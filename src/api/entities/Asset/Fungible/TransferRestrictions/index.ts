import {
  PolymeshPrimitivesStatisticsStat1stKey,
  PolymeshPrimitivesStatisticsStat2ndKey,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';

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
  AccreditedValue,
  ActiveTransferRestrictions,
  AffiliateValue,
  AssetStat,
  ClaimType,
  CountryCode,
  JurisdictionValue,
  ProcedureMethod,
  SetTransferRestrictionStatParams,
  StatType,
  TransferRestrictionExemption,
  TransferRestrictionExemptionParams,
  TransferRestrictionParams,
  TransferRestrictionStatValues,
} from '~/types';
import {
  assetComplianceToTransferRestrictions,
  assetStatToStat,
  assetToMeshAssetId,
  exemptionToTransferExemption,
  getStat1stKey,
  getStat2ndKey,
  identityIdToString,
  meshStatToStatType,
  stringToAssetId,
  u128ToBigNumber,
} from '~/utils/conversion';
import { createProcedureMethod, requestMulti } from '~/utils/internal';

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
   * Get the values of all active transfer restrictions for this Asset
   * @returns an array of objects containing the values of all active transfer restrictions for this Asset
   */
  public async getValues(): Promise<TransferRestrictionStatValues[]> {
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
    const activeStats = await statistics.activeAssetStats(rawAssetId);

    const queries: [
      typeof statistics.assetStats,
      [PolymeshPrimitivesStatisticsStat1stKey, PolymeshPrimitivesStatisticsStat2ndKey]
    ][] = [];

    const stats: {
      type: StatType;
      issuer?: Identity;
      claimType?: ClaimType.Accredited | ClaimType.Affiliate | ClaimType.Jurisdiction;
      claimValue?: boolean | CountryCode | null;
    }[] = [];

    const result: TransferRestrictionStatValues[] = [];

    activeStats.forEach(stat => {
      const stat1stKey = getStat1stKey(rawAssetId, stat, context);
      const statType = meshStatToStatType(stat);

      if (stat.claimIssuer.isSome) {
        const [rawClaimClaimType, rawIssuer] = stat.claimIssuer.unwrap();
        const issuer = new Identity({ did: identityIdToString(rawIssuer) }, context);

        const { type } = rawClaimClaimType;

        if (type === ClaimType.Accredited || type === ClaimType.Affiliate) {
          const claimType = type as ClaimType.Accredited | ClaimType.Affiliate;

          result.push({
            type: statType,
            value: new BigNumber(0),
            claim: {
              issuer,
              claimType,
              value:
                claimType === ClaimType.Accredited
                  ? { accredited: new BigNumber(0), nonAccredited: new BigNumber(0) }
                  : { affiliate: new BigNumber(0), nonAffiliate: new BigNumber(0) },
            },
          });

          stats.push({
            type: statType,
            issuer,
            claimType,
            claimValue: true,
          });
          stats.push({
            type: statType,
            issuer,
            claimType,
            claimValue: false,
          });

          queries.push([
            statistics.assetStats,
            [stat1stKey, getStat2ndKey(context, claimType, true)],
          ]);
          queries.push([
            statistics.assetStats,
            [stat1stKey, getStat2ndKey(context, claimType, false)],
          ]);
        } else if (type === ClaimType.Jurisdiction) {
          result.push({
            type: statType,
            value: new BigNumber(0),
            claim: {
              issuer,
              claimType: ClaimType.Jurisdiction,
              value: [],
            },
          });

          const countryCodes = Object.values(CountryCode);

          countryCodes.forEach(countryCode => {
            stats.push({
              type: statType,
              issuer,
              claimType: ClaimType.Jurisdiction,
              claimValue: countryCode,
            });
          });

          stats.push({
            type: statType,
            issuer,
            claimType: ClaimType.Jurisdiction,
            claimValue: null,
          });

          countryCodes.forEach(countryCode => {
            queries.push([
              statistics.assetStats,
              [stat1stKey, getStat2ndKey(context, ClaimType.Jurisdiction, countryCode)],
            ]);
          });

          queries.push([
            statistics.assetStats,
            [stat1stKey, getStat2ndKey(context, ClaimType.Jurisdiction)],
          ]);
        }
      } else {
        stats.push({
          type: statType,
        });

        queries.push([statistics.assetStats, [stat1stKey, getStat2ndKey(context)]]);

        result.push({
          type: statType,
          value: new BigNumber(0),
        });
      }
    });

    const values = await requestMulti(context, queries);

    const statsWithValue = stats
      .map((stat, index) => {
        return {
          ...stat,
          value:
            stat.type === StatType.Count || stat.type === StatType.ScopedCount
              ? u128ToBigNumber(values[index])
              : u128ToBigNumber(values[index]).shiftedBy(-6),
        };
      })
      .filter(stat => stat.value.gt(0));

    const isClaimStat = (
      stat: TransferRestrictionStatValues
    ): stat is TransferRestrictionStatValues & {
      claim: {
        issuer: Identity;
        claimType: ClaimType.Accredited | ClaimType.Affiliate | ClaimType.Jurisdiction;
        value: AccreditedValue | AffiliateValue | JurisdictionValue[];
      };
    } => {
      return stat.claim !== undefined;
    };

    statsWithValue.forEach(stat => {
      const { claimType, issuer, claimValue } = stat;

      if (claimType && issuer) {
        const statResult = result
          .filter(isClaimStat)
          .find(
            resultStat =>
              resultStat.type === stat.type &&
              resultStat.claim.issuer.did === issuer.did &&
              resultStat.claim.claimType === claimType
          );

        statResult!.value = statResult!.value.plus(stat.value);

        if (claimType === ClaimType.Jurisdiction) {
          (statResult!.claim!.value as JurisdictionValue[]).push({
            countryCode: stat.claimValue as CountryCode | null,
            count: stat.value,
          });
        } else if (claimType === ClaimType.Accredited) {
          const value = statResult!.claim!.value as AccreditedValue;
          if (claimValue === true) {
            value.accredited = value.accredited.plus(stat.value);
          } else {
            value.nonAccredited = value.nonAccredited.plus(stat.value);
          }
        } else if (claimType === ClaimType.Affiliate) {
          const value = statResult!.claim!.value as AffiliateValue;
          if (claimValue === true) {
            value.affiliate = value.affiliate.plus(stat.value);
          } else {
            value.nonAffiliate = value.nonAffiliate.plus(stat.value);
          }
        }
      } else {
        const statResult = result
          .filter(resultStat => !isClaimStat(resultStat))
          .find(resultStat => resultStat.type === stat.type);

        statResult!.value = statResult!.value.plus(stat.value);
      }
    });

    return result;
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
