import BigNumber from 'bignumber.js';

import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, TransferRestrictionExemptionParams, TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { tuple } from '~/types/utils';
import {
  assetToMeshAssetId,
  booleanToBool,
  boolToBoolean,
  identitiesToBtreeSet,
  statTypeToStatOpType,
  stringToIdentityId,
  toExemptKey,
} from '~/utils/conversion';
import { asIdentity } from '~/utils/internal';

export type Params = {
  asset: FungibleAsset;
  isExempt: boolean;
} & TransferRestrictionExemptionParams;

/**
 * @hidden
 */
export async function prepareSetTransferRestrictionExemptions(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'statistics', 'setEntitiesExempt'>>> {
  const {
    context: {
      polymeshApi: {
        query,
        tx: { statistics },
      },
    },
    context,
  } = this;
  const { asset, type, identities: entities, claim, isExempt } = args;

  const identities = entities.map(id => {
    return asIdentity(id, context);
  });

  const rawEntities = identitiesToBtreeSet(identities, context);
  const rawIsExempt = booleanToBool(isExempt, context);
  const rawAssetId = assetToMeshAssetId(asset, context);
  const rawType = statTypeToStatOpType(type, context);
  const exemptKey = toExemptKey(rawAssetId, rawType, claim);

  // Ensure entities are not already set
  if (isExempt) {
    const multiParams = identities.map(({ did }) =>
      tuple(exemptKey, stringToIdentityId(did, context))
    );
    const result = await query.statistics.transferConditionExemptEntities.multi(multiParams);

    const exemptedDids = result.reduce((ids, rawResult, index) => {
      const isSet = boolToBoolean(rawResult);

      if (isSet) {
        ids.push(identities[index]!.did);
      }

      return ids;
    }, [] as string[]);

    if (exemptedDids.length) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'Some identities are already exempted',
        data: { exemptedDids },
      });
    }
  } else {
    // Ensure entities are already set
    const multiParams = identities.map(({ did }) =>
      tuple(exemptKey, stringToIdentityId(did, context))
    );
    const result = await query.statistics.transferConditionExemptEntities.multi(multiParams);

    const unsetDids = result.reduce((ids, rawResult, index) => {
      const isSet = boolToBoolean(rawResult);

      if (!isSet) {
        ids.push(identities[index]!.did);
      }

      return ids;
    }, [] as string[]);

    if (unsetDids.length) {
      throw new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'Some identities are not exemptions',
        data: { isExempt, unsetDids },
      });
    }
  }

  return {
    transaction: statistics.setEntitiesExempt,
    feeMultiplier: new BigNumber(rawEntities.size),
    args: [rawIsExempt, exemptKey, rawEntities],
    resolver: undefined,
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, void>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      assets: [asset],
      transactions: [TxTags.statistics.SetEntitiesExempt],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const setTransferRestrictionsExemptions = (): Procedure<Params, void> =>
  new Procedure(prepareSetTransferRestrictionExemptions, getAuthorization);
