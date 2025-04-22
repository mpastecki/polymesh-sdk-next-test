import {
  assertBallotRecordDateValid,
  assertCaCheckpointValid,
  assertDistributionDatesValid,
} from '~/api/procedures/utils';
import {
  Checkpoint,
  CorporateActionBase,
  CorporateBallot,
  DividendDistribution,
  PolymeshError,
  Procedure,
} from '~/internal';
import { ErrorCode, ModifyCaCheckpointParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  checkpointToRecordDateSpec,
  corporateActionIdentifierToCaId,
  momentToDate,
} from '~/utils/conversion';
import { assertBallotNotStarted, getCheckpointValue, optionize } from '~/utils/internal';

export type Params = ModifyCaCheckpointParams & {
  corporateAction: CorporateActionBase;
};

/**
 * @hidden
 */
export async function prepareModifyCaCheckpoint(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'corporateAction', 'changeRecordDate'>>> {
  const {
    context: {
      polymeshApi: { tx },
      polymeshApi: { query },
    },
    context,
  } = this;
  const { checkpoint, corporateAction } = args;
  const { id: localId, asset } = corporateAction;

  let checkpointValue;

  if (checkpoint) {
    checkpointValue = await getCheckpointValue(checkpoint, asset, context);
    await assertCaCheckpointValid(checkpointValue);
  }

  // extra validation if the CA is a Dividend Distribution
  if (corporateAction instanceof DividendDistribution) {
    const { paymentDate, expiryDate } = corporateAction;

    const now = new Date();

    if (paymentDate <= now) {
      throw new PolymeshError({
        code: ErrorCode.UnmetPrerequisite,
        message: 'Cannot modify a Distribution checkpoint after the payment date',
      });
    }

    if (checkpointValue && !(checkpointValue instanceof Checkpoint)) {
      await assertDistributionDatesValid(checkpointValue, paymentDate, expiryDate);
    }
  }

  const rawCaId = corporateActionIdentifierToCaId({ asset, localId }, context);

  if (corporateAction instanceof CorporateBallot) {
    const rawTimeRange = await query.corporateBallot.timeRanges(rawCaId);

    if (rawTimeRange.isNone) {
      throw new PolymeshError({
        code: ErrorCode.ValidationError,
        message: 'The ballot does not exist',
      });
    }

    const timeRange = rawTimeRange.unwrap();
    const startDate = momentToDate(timeRange.start);

    assertBallotNotStarted({ startDate });

    if (checkpointValue && !(checkpointValue instanceof Checkpoint)) {
      await assertBallotRecordDateValid(checkpointValue, startDate);
    }
  }

  const rawRecordDateSpec = optionize(checkpointToRecordDateSpec)(checkpointValue, context);

  return {
    transaction: tx.corporateAction.changeRecordDate,
    args: [rawCaId, rawRecordDateSpec],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { corporateAction: { asset } }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.corporateAction.ChangeRecordDate],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const modifyCaCheckpoint = (): Procedure<Params, void> =>
  new Procedure(prepareModifyCaCheckpoint, getAuthorization);
