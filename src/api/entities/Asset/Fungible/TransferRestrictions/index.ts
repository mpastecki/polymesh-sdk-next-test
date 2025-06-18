import {
  PolymeshPrimitivesStatisticsStat1stKey,
  PolymeshPrimitivesStatisticsStat2ndKey,
} from '@polkadot/types/lookup';

import { TransferRestrictionValues } from '~/api/entities/Asset/types';
import { TransferRestriction } from '~/api/procedures/types';
import { Context, FungibleAsset, Namespace } from '~/internal';
import {
  assetToMeshAssetId,
  transferConditionToTransferRestriction,
  transferRestrictionToPolymeshPrimitivesStatisticsStat1stKey,
  transferRestrictionToPolymeshPrimitivesStatisticsStat2ndKey,
  u128ToBigNumber,
} from '~/utils/conversion';
import { requestMulti } from '~/utils/internal';

import { ClaimCount } from './ClaimCount';
import { ClaimPercentage } from './ClaimPercentage';
import { Count } from './Count';
import { Percentage } from './Percentage';

/**
 * Handles all Asset Transfer Restrictions related functionality
 */
export class TransferRestrictions extends Namespace<FungibleAsset> {
  public count: Count;
  public percentage: Percentage;
  public claimCount: ClaimCount;
  public claimPercentage: ClaimPercentage;

  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
    super(parent, context);

    this.count = new Count(parent, context);
    this.percentage = new Percentage(parent, context);
    this.claimCount = new ClaimCount(parent, context);
    this.claimPercentage = new ClaimPercentage(parent, context);
  }

  /**
   * Get the values of all active transfer restrictions for this Asset
   * @returns an array of objects containing the values of all active transfer restrictions for this Asset
   */
  public async getValues(): Promise<TransferRestrictionValues[]> {
    const {
      parent,
      context,
      context: {
        polymeshApi: {
          query: { statistics },
        },
      },
    } = this;

    const rawAssetId = assetToMeshAssetId(parent, context);

    const { requirements } = await statistics.assetTransferCompliances(rawAssetId);

    const queries: [
      typeof statistics.assetStats,
      [PolymeshPrimitivesStatisticsStat1stKey, PolymeshPrimitivesStatisticsStat2ndKey]
    ][] = [];

    const restrictions: TransferRestriction[] = [];

    requirements.forEach(requirement => {
      const restriction = transferConditionToTransferRestriction(requirement, context);

      const stat1stKey = transferRestrictionToPolymeshPrimitivesStatisticsStat1stKey(
        rawAssetId,
        restriction,
        context
      );
      const stat2ndKey = transferRestrictionToPolymeshPrimitivesStatisticsStat2ndKey(
        restriction,
        context
      );

      queries.push([statistics.assetStats, [stat1stKey, stat2ndKey]]);

      restrictions.push(restriction);
    });

    const values = await requestMulti(context, queries);

    return restrictions.map((restriction, index) => ({
      restriction,
      value: u128ToBigNumber(values[index]),
    }));
  }
}
