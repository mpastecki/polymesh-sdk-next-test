import BigNumber from 'bignumber.js';

import { assertInstructionValidForLocking } from '~/api/procedures/utils';
import { dispatchErrorToMessage } from '~/base/utils';
import { Instruction, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { bigNumberToU64 } from '~/utils/conversion';

/**
 * @hidden
 */
export type Params = {
  id: BigNumber;
};

/**
 * @hidden
 */
export async function prepareLockInstructionForExecution(
  this: Procedure<Params, Instruction>,
  args: Params
): Promise<TransactionSpec<Instruction, ExtrinsicParams<'settlementTx', 'lockInstruction'>>> {
  const {
    context: {
      polymeshApi: {
        tx: { settlement: settlementTx },
        call: { settlementApi },
      },
    },
    context,
  } = this;

  const { id } = args;

  const instruction = new Instruction({ id }, context);

  const [{ did: signerDid }, instructionDetails, pendingAffirmationsCount, mediatorAffirmations] =
    await Promise.all([
      context.getSigningIdentity(),
      instruction.detailsFromChain(),
      instruction.getPendingAffirmationCount(),
      instruction.getMediators(),
    ]);

  assertInstructionValidForLocking(instructionDetails);

  if (!pendingAffirmationsCount.isZero()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message:
        'Instruction needs to be affirmed by all parties before it can be locked for execution',
      data: {
        pendingAffirmationsCount,
      },
    });
  }

  const mediatorWithAffirmation = mediatorAffirmations.find(
    ({ identity: { did } }) => did === signerDid
  );

  if (!mediatorWithAffirmation) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Only mediators can lock instructions for execution',
      data: { signer: signerDid, instructionId: id.toString() },
    });
  }

  if (mediatorWithAffirmation.expiry && mediatorWithAffirmation.expiry < new Date()) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Mediator affirmation has expired',
    });
  }

  const rawInstructionId = bigNumberToU64(id, context);

  const rawLockInstructionWeight = await settlementApi.lockInstructionWeight(rawInstructionId);

  if (rawLockInstructionWeight.isErr) {
    throw new PolymeshError({
      code: ErrorCode.UnmetPrerequisite,
      message: 'Instruction cannot be locked for execution',
      data: {
        error: dispatchErrorToMessage(rawLockInstructionWeight.asErr),
      },
    });
  }

  return {
    transaction: settlementTx.lockInstruction,
    resolver: instruction,
    args: [rawInstructionId, rawLockInstructionWeight.asOk],
  };
}

/**
 * @hidden
 */
export function getAuthorization(this: Procedure<Params, Instruction>): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.settlement.LockInstruction],
      assets: [],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const lockInstructionForExecution = (): Procedure<Params, Instruction> =>
  new Procedure(prepareLockInstructionForExecution, getAuthorization);
