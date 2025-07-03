import { PolymeshPrimitivesStatisticsStatType } from '@polkadot/types/lookup';

import { Procedure } from '~/internal';
import { FungibleAsset, SetTransferRestrictionStatParams, StatType, TxTags } from '~/types';
import { BatchTransactionSpec, ProcedureAuthorization, TxWithArgs } from '~/types/internal';
import {
  assetToMeshAssetId,
  claimCountStatInputToStatUpdates,
  claimIssuerToMeshClaimIssuer,
  countStatInputToStatUpdates,
  statisticsOpTypeToStatType,
  statisticStatTypesToBtreeStatType,
  statTypeToStatOpType,
} from '~/utils/conversion';
import { checkTxType } from '~/utils/internal';

/**
 * @hidden
 */
export type SetAssetStatParams = { asset: FungibleAsset } & SetTransferRestrictionStatParams;

/**
 * @hidden
 */
export async function prepareSetAssetStats(
  this: Procedure<SetAssetStatParams, void>,
  args: SetAssetStatParams
): Promise<BatchTransactionSpec<void, unknown[][]>> {
  const {
    context: {
      polymeshApi: {
        tx: { statistics },
      },
    },
    context,
  } = this;
  const { asset, stats } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);

  const newStats: PolymeshPrimitivesStatisticsStatType[] = [];
  const transactions = [];
  const updateTransactions: TxWithArgs<unknown[]>[] = [];

  stats.forEach(stat => {
    const type = stat.type;
    const operationType = statTypeToStatOpType(type, context);

    let rawClaimIssuer;
    if (type === StatType.ScopedCount || type === StatType.ScopedBalance) {
      rawClaimIssuer = claimIssuerToMeshClaimIssuer(stat, context);
    }

    const newStat = statisticsOpTypeToStatType(
      { operationType, claimIssuer: rawClaimIssuer },
      context
    );

    newStats.push(newStat);

    // Count stats need the user to provide the initial value for the counter as computing may cause prohibitive gas charges on the chain
    // We require users to provide initial stats in this method so they won't miss setting initial values. It could be its own step
    if (type === StatType.Count) {
      const statValue = countStatInputToStatUpdates(stat, context);
      updateTransactions.push(
        checkTxType({
          transaction: statistics.batchUpdateAssetStats,
          args: [rawAssetId, newStat, statValue],
        })
      );
    } else if (type === StatType.ScopedCount) {
      const statValue = claimCountStatInputToStatUpdates(stat, context);
      updateTransactions.push(
        checkTxType({
          transaction: statistics.batchUpdateAssetStats,
          args: [rawAssetId, newStat, statValue],
        })
      );
    }
  });

  const rawNewStats = statisticStatTypesToBtreeStatType(newStats, context);

  transactions.push(
    checkTxType({
      transaction: statistics.setActiveAssetStats,
      args: [rawAssetId, rawNewStats],
    })
  );

  transactions.push(...updateTransactions);

  return { transactions, resolver: undefined };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<SetAssetStatParams, void>,
  { asset, stats }: SetAssetStatParams
): ProcedureAuthorization {
  const hasCount = stats.some(
    stat => stat.type === StatType.Count || stat.type === StatType.ScopedCount
  );

  const transactions = [TxTags.statistics.SetActiveAssetStats];
  if (hasCount) {
    transactions.push(TxTags.statistics.BatchUpdateAssetStats);
  }
  return {
    permissions: {
      transactions,
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const setAssetStats = (): Procedure<SetAssetStatParams, void> =>
  new Procedure(prepareSetAssetStats, getAuthorization);
