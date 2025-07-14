import { StorageKey, u128 } from '@polkadot/types';
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
  ActiveTransferRestrictions,
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
  TrustedFor,
} from '~/types';
import {
  assetComplianceToTransferRestrictions,
  assetStatToStat,
  assetToMeshAssetId,
  exemptionToTransferExemption,
  getStat1stKey,
  getStat2ndKey,
  identityIdToString,
  meshClaimTypeToClaimType,
  meshStatToStatType,
  stringToAssetId,
  u128ToStatValue,
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

    if (activeStats.isEmpty) {
      return [];
    }

    const result: TransferRestrictionStatValues[] = [];
    const jurisdictionQueries: Promise<
      [
        StorageKey<
          [PolymeshPrimitivesStatisticsStat1stKey, PolymeshPrimitivesStatisticsStat2ndKey]
        >,
        u128
      ][]
    >[] = [];
    const jurisdictionMappings: {
      statType: StatType;
      issuer: Identity;
      claimType: TrustedFor;
    }[] = [];

    // Prepare non-jurisdiction queries using requestMulti
    const nonJurisdictionQueries: [
      typeof statistics.assetStats,
      [PolymeshPrimitivesStatisticsStat1stKey, PolymeshPrimitivesStatisticsStat2ndKey]
    ][] = [];
    const nonJurisdictionMappings: {
      statType: StatType;
      issuer?: Identity;
      claimType?: TrustedFor;
    }[] = [];

    activeStats.forEach(stat => {
      const stat1stKey = getStat1stKey(rawAssetId, stat, context);
      const statType = meshStatToStatType(stat);

      if (stat.claimIssuer.isSome) {
        const [rawClaimClaimType, rawIssuer] = stat.claimIssuer.unwrap();
        const issuer = new Identity({ did: identityIdToString(rawIssuer) }, context);
        const claimType = meshClaimTypeToClaimType(rawClaimClaimType);
        const claimTypeForComparison = typeof claimType === 'object' ? claimType.type : claimType;

        if (claimTypeForComparison === ClaimType.Jurisdiction) {
          // Handle jurisdiction claims with entries query
          jurisdictionQueries.push(statistics.assetStats.entries(stat1stKey));
          jurisdictionMappings.push({
            statType,
            issuer,
            claimType,
          });
        } else if (
          claimTypeForComparison === ClaimType.Accredited ||
          claimTypeForComparison === ClaimType.Affiliate
        ) {
          // Handle Accredited and Affiliate claims with specific true/false queries only
          const trueStat2ndKey = getStat2ndKey(context, claimTypeForComparison, true);
          const falseStat2ndKey = getStat2ndKey(context, claimTypeForComparison, false);
          nonJurisdictionQueries.push(
            [statistics.assetStats, [stat1stKey, trueStat2ndKey]],
            [statistics.assetStats, [stat1stKey, falseStat2ndKey]]
          );
          nonJurisdictionMappings.push({
            statType,
            issuer,
            claimType,
          });
        } else {
          // Handle all other claim types (Custom, etc.) with NoClaimStat only
          const noClaimStat2ndKey = getStat2ndKey(context);
          nonJurisdictionQueries.push([statistics.assetStats, [stat1stKey, noClaimStat2ndKey]]);
          nonJurisdictionMappings.push({
            statType,
            issuer,
            claimType,
          });
        }
      } else {
        // Handle non-claim stats
        const noClaimStat2ndKey = getStat2ndKey(context);
        nonJurisdictionQueries.push([statistics.assetStats, [stat1stKey, noClaimStat2ndKey]]);
        nonJurisdictionMappings.push({
          statType,
        });
      }
    });

    // Execute all queries in parallel
    const [jurisdictionResults, nonJurisdictionResults] = await Promise.all([
      Promise.all(jurisdictionQueries),
      nonJurisdictionQueries.length > 0 ? requestMulti(context, nonJurisdictionQueries) : [],
    ]);

    // Process jurisdiction results
    jurisdictionMappings.forEach((mapping, index) => {
      const entries = jurisdictionResults[index];
      const { statType, issuer, claimType } = mapping;

      const jurisdictionValues: JurisdictionValue[] = [];

      entries.forEach(([key, rawValue]) => {
        const secondKey = key.args[1];

        if (secondKey.isNoClaimStat) {
          // No jurisdiction claim
          jurisdictionValues.push({
            countryCode: null,
            value: u128ToStatValue(rawValue, statType),
          });
        } else if (secondKey.isClaim && secondKey.asClaim.isJurisdiction) {
          // Specific jurisdiction
          const countryCode = secondKey.asClaim.asJurisdiction.toString() as CountryCode;
          jurisdictionValues.push({
            countryCode,
            value: u128ToStatValue(rawValue, statType),
          });
        }
      });

      const totalValue = jurisdictionValues.reduce(
        (sum, jv) => sum.plus(jv.value),
        new BigNumber(0)
      );

      result.push({
        type: statType,
        value: totalValue,
        claim: {
          issuer,
          claimType,
          value: jurisdictionValues,
        },
      });
    });

    // Process non-jurisdiction results
    let resultIndex = 0;
    nonJurisdictionMappings.forEach(mapping => {
      const { statType, issuer, claimType } = mapping;

      if (claimType && issuer) {
        const claimTypeForComparison = typeof claimType === 'object' ? claimType.type : claimType;

        if (
          claimTypeForComparison === ClaimType.Accredited ||
          claimTypeForComparison === ClaimType.Affiliate
        ) {
          // Get the specific claim values (true/false queries only)
          const withClaimValue = u128ToStatValue(nonJurisdictionResults[resultIndex], statType);
          const withoutClaimValue = u128ToStatValue(
            nonJurisdictionResults[resultIndex + 1],
            statType
          );
          resultIndex += 2;

          const totalValue = withClaimValue.plus(withoutClaimValue);
          result.push({
            type: statType,
            value: totalValue,
            claim: {
              issuer,
              claimType,
              value: { withClaim: withClaimValue, withoutClaim: withoutClaimValue },
            },
          });
        } else {
          // Custom claims and other unsupported types - get NoClaimStat total holder/balance value only
          result.push({
            claim: {
              issuer,
              claimType,
            },
            type: statType,
            value: u128ToStatValue(nonJurisdictionResults[resultIndex], statType),
          });
          resultIndex++;
        }
      } else {
        // Handle non-claim stats
        result.push({
          type: statType,
          value: u128ToStatValue(nonJurisdictionResults[resultIndex], statType),
        });
        resultIndex++;
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
