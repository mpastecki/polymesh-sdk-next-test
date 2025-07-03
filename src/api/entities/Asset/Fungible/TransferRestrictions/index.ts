import { setTransferRestrictionsExemptions } from '~/api/procedures/setTransferRestrictionExemptions';
import {
  Context,
  FungibleAsset,
  Identity,
  Namespace,
  SetAssetStatParams,
  setAssetStats,
  SetTransferExemptionsParams,
  SetTransferRestrictionParams,
  setTransferRestrictions,
} from '~/internal';
import {
  ActiveTransferRestrictions,
  AssetStat,
  ProcedureMethod,
  SetTransferRestrictionStatParams,
  TransferRestrictionExemption,
  TransferRestrictionExemptionParams,
  TransferRestrictionParams,
} from '~/types';
import {
  assetComplianceToTransferRestrictions,
  assetStatToStat,
  exemptionToTransferExemption,
  identityIdToString,
  stringToAssetId,
} from '~/utils/conversion';
import { createProcedureMethod } from '~/utils/internal';

/**
 * Handles all Transfer Restriction related functionality
 */
export class TransferRestrictions extends Namespace<FungibleAsset> {
  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
    super(parent, context);

    this.setRestrictions = createProcedureMethod<
      TransferRestrictionParams,
      SetTransferRestrictionParams,
      void
    >(
      {
        getProcedureAndArgs: args => [setTransferRestrictions, { ...args, asset: parent }],
      },
      context
    );

    this.setStats = createProcedureMethod<
      SetTransferRestrictionStatParams,
      SetAssetStatParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          setAssetStats,
          {
            ...args,
            asset: parent,
          },
        ],
      },
      context
    );

    this.addExemptions = createProcedureMethod<
      TransferRestrictionExemptionParams,
      SetTransferExemptionsParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          setTransferRestrictionsExemptions,
          {
            ...args,
            asset: parent,
            isExempt: true,
          },
        ],
      },
      context
    );

    this.removeExemptions = createProcedureMethod<
      TransferRestrictionExemptionParams,
      SetTransferExemptionsParams,
      void
    >(
      {
        getProcedureAndArgs: args => [
          setTransferRestrictionsExemptions,
          {
            ...args,
            asset: parent,
            isExempt: false,
          },
        ],
      },
      context
    );
  }

  /**
   * Get all current restrictions for this asset
   */
  public async getRestrictions(): Promise<ActiveTransferRestrictions> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { statistics },
        },
      },
      parent,
    } = this;

    const rawAssetId = stringToAssetId(parent.id, context);
    const result = await statistics.assetTransferCompliances(rawAssetId);

    return assetComplianceToTransferRestrictions(result, context);
  }

  /**
   * Returns active asset stats
   */
  public async getStats(): Promise<AssetStat[]> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { statistics },
        },
      },
      parent,
    } = this;

    const rawAssetId = stringToAssetId(parent.id, context);
    const rawStats = await statistics.activeAssetStats(rawAssetId);

    const stats = [...rawStats].map(stat => assetStatToStat(stat));

    return stats;
  }

  /**
   * Returns identities with exemptions
   */
  public async getExemptions(): Promise<TransferRestrictionExemption[]> {
    const {
      context,
      context: {
        polymeshApi: {
          query: { statistics },
        },
      },
      parent,
    } = this;

    const rawAssetId = stringToAssetId(parent.id, context);
    const rawExemptions = await statistics.transferConditionExemptEntities.entries(rawAssetId);

    const exemptions = rawExemptions.map(([exemption]) => {
      const [rawExemptKey, rawIdentity] = exemption.args;
      const exemptKey = exemptionToTransferExemption(rawExemptKey);
      const did = identityIdToString(rawIdentity);

      return {
        exemptKey,
        identity: new Identity({ did }, context),
      };
    });

    return exemptions;
  }

  /**
   * Sets all Transfer Restrictions on this Asset
   *
   * Transfer Restrictions control ownership requirements based on investor statistics.
   * For example TransferRestrictionType.Count can limit the number of investors.
   * TransferRestrictionType.Percentage can limit the maximum percentage an individual investor may hold.
   *
   * @note the relevant stat must be enabled before the restriction can be created
   *
   */
  public setRestrictions: ProcedureMethod<TransferRestrictionParams, void>;

  /**
   * Enables statistics on an Asset.
   *
   * Transfer Restrictions require the relevant stat to be enabled before they can be set.
   *
   * @note Count based stats must be given an initial value. The counter is only updated automatically with each transfer of tokens after the stat has been enabled.
   * As such the initial value for the stat should be passed in, which can be fetched with {@link api/entities/Asset/Fungible/TransferRestrictions/Count!Count.investorCount | Count.investorCount }
   *
   */
  public setStats: ProcedureMethod<SetTransferRestrictionStatParams, void>;

  /**
   * Exempt identities from Transfer Restrictions. These identities will not be subject
   * to Transfer Restriction rules
   */
  public addExemptions: ProcedureMethod<TransferRestrictionExemptionParams, void>;

  /**
   * Remove identities from Transfer Restriction exemptions
   *
   * Given identities will no longer be exempt from Transfer Restrictions
   */
  public removeExemptions: ProcedureMethod<TransferRestrictionExemptionParams, void>;
}
