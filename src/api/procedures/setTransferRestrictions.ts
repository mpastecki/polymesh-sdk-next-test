import BigNumber from 'bignumber.js';

import { FungibleAsset, PolymeshError, Procedure } from '~/internal';
import {
  ClaimCountRestrictionValue,
  ClaimCountTransferRestrictionInput,
  ClaimPercentageTransferRestriction,
  ClaimType,
  ErrorCode,
  TransferRestriction,
  TransferRestrictionParams,
  TransferRestrictionType,
  TxTags,
} from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  complianceConditionsToBtreeSet,
  transferRestrictionToPolymeshTransferCondition,
} from '~/utils/conversion';
import { assertStatIsSet, neededStatTypeForRestrictionInput } from '~/utils/internal';

export type Params = { asset: FungibleAsset } & TransferRestrictionParams;

/**
 * @hidden
 * Checks if the input restrictions are valid
 */
function assertInputValid(input: TransferRestrictionParams): void {
  input.restrictions.forEach(restriction => {
    const type = restriction.type;
    if (type === TransferRestrictionType.ClaimCount) {
      const seenJurisdictions = new Set<string>();
      const seenClaimTypes = new Set<string>();

      input.restrictions.forEach(rest => {
        const { claim } = rest as ClaimCountTransferRestrictionInput;

        if (!claim) {
          return;
        }

        if (claim.type === ClaimType.Jurisdiction) {
          // cannot add two claims with same country code restrictions will result in internal error
          if (seenJurisdictions.has(claim.countryCode || 'none')) {
            throw new PolymeshError({
              code: ErrorCode.ValidationError,
              message: 'Duplicate Jurisdiction CountryCode found in input',
              data: { countryCode: claim.countryCode },
            });
          }
          seenJurisdictions.add(claim.countryCode ?? 'none');
        } else {
          // cannot add two ClaimType.Accredited or ClaimType.Affiliate restrictions will result in internal error
          if (seenClaimTypes.has(claim.type)) {
            throw new PolymeshError({
              code: ErrorCode.ValidationError,
              message: 'Duplicate ClaimType found in input',
              data: { claimType: claim.type },
            });
          }
          seenClaimTypes.add(claim.type);
        }
      });
    }
  });
}

/**
 * @hidden
 */
export async function prepareSetTransferRestrictions(
  this: Procedure<Params, void>,
  args: Params
): Promise<TransactionSpec<void, ExtrinsicParams<'statistics', 'setAssetTransferCompliance'>>> {
  const {
    context: {
      polymeshApi: {
        query,
        tx: { statistics },
      },
    },
    context,
  } = this;
  const { restrictions, asset } = args;
  const rawAssetId = assetToMeshAssetId(asset, context);

  assertInputValid(args);

  const currentStats = await query.statistics.activeAssetStats(rawAssetId);

  const conditions = restrictions.map(restriction => {
    let value: BigNumber | ClaimCountRestrictionValue | ClaimPercentageTransferRestriction;
    if ('count' in restriction) {
      value = restriction.count;
    } else if ('percentage' in restriction) {
      value = restriction.percentage;
    } else {
      value = restriction;
    }

    const condition = { type: restriction.type, value } as TransferRestriction;

    const neededStat = neededStatTypeForRestrictionInput(restriction, context);

    assertStatIsSet(currentStats, neededStat);

    return transferRestrictionToPolymeshTransferCondition(condition, context);
  });

  const rawConditions = complianceConditionsToBtreeSet(conditions, context);

  return {
    transaction: statistics.setAssetTransferCompliance,
    args: [rawAssetId, rawConditions],
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
      transactions: [TxTags.statistics.SetAssetTransferCompliance],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const setTransferRestrictions = (): Procedure<Params, void> =>
  new Procedure(prepareSetTransferRestrictions, getAuthorization);
