import { u128 } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesStatisticsStat1stKey,
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesStatisticsStatType,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { TransferRestrictions } from '~/api/entities/Asset/Fungible/TransferRestrictions';
import { Context, FungibleAsset, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockAssetId, createMockStatisticsOpType } from '~/testUtils/mocks/dataSources';
import { ClaimType, StatType, TransferRestrictionType } from '~/types';
import { tuple } from '~/types/utils';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/base/Procedure',
  require('~/testUtils/mocks/procedure').mockProcedureModule('~/base/Procedure')
);

describe('TransferRestrictions class', () => {
  let context: Context;
  let asset: FungibleAsset;
  let transferRestrictions: TransferRestrictions;

  beforeEach(() => {
    context = dsMockUtils.getContextInstance();
    asset = entityMockUtils.getFungibleAssetInstance();
    transferRestrictions = new TransferRestrictions(asset, context);
  });

  beforeAll(() => {
    entityMockUtils.initMocks();
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
  });

  afterEach(() => {
    dsMockUtils.reset();
    entityMockUtils.reset();
    procedureMockUtils.reset();
  });

  afterAll(() => {
    dsMockUtils.cleanup();
    procedureMockUtils.cleanup();
  });

  it('should extend namespace', () => {
    expect(TransferRestrictions.prototype instanceof Namespace).toBe(true);
  });

  describe('method: setStats', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { asset, stats: [] },
            transformer: undefined,
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await transferRestrictions.setStats({
        stats: [],
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: setRestrictions', () => {
    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getFungibleAssetInstance();
      transferRestrictions = new TransferRestrictions(asset, context);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { restrictions: [], asset },
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await transferRestrictions.setRestrictions({
        restrictions: [],
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: addExemptions', () => {
    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getFungibleAssetInstance();
      transferRestrictions = new TransferRestrictions(asset, context);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { identities: [], type: StatType.Count, isExempt: true, asset },
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await transferRestrictions.addExemptions({
        identities: [],
        type: StatType.Count,
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: removeExemptions', () => {
    beforeEach(() => {
      context = dsMockUtils.getContextInstance();
      asset = entityMockUtils.getFungibleAssetInstance();
      transferRestrictions = new TransferRestrictions(asset, context);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should prepare the procedure', async () => {
      const expectedTransaction = 'someTransaction' as unknown as PolymeshTransaction<number>;

      when(procedureMockUtils.getPrepareMock())
        .calledWith(
          {
            args: { identities: [], type: StatType.Count, isExempt: false, asset },
          },
          context,
          {}
        )
        .mockResolvedValue(expectedTransaction);

      const tx = await transferRestrictions.removeExemptions({
        identities: [],
        type: StatType.Count,
      });

      expect(tx).toBe(expectedTransaction);
    });
  });

  describe('method: getRestrictions', () => {
    it('should return the active transfer restrictions', async () => {
      dsMockUtils.createQueryMock('statistics', 'assetTransferCompliances', {
        returnValue: {
          paused: dsMockUtils.createMockBool(true),
          requirements: dsMockUtils.createMockBtreeSet([
            dsMockUtils.createMockTransferCondition({
              MaxInvestorCount: dsMockUtils.createMockU64(new BigNumber(5)),
            }),
          ]),
        },
      });

      const result = await transferRestrictions.getRestrictions();

      expect(result).toEqual({
        paused: true,
        restrictions: [
          {
            type: TransferRestrictionType.Count,
            value: new BigNumber(5),
          },
        ],
      });
    });
  });

  describe('method: getStats', () => {
    it('should return the active stats for the asset, including scoped and custom claims', async () => {
      // Standard scoped stat types
      const affiliateStat = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.Count),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(ClaimType.Affiliate),
          dsMockUtils.createMockIdentityId('affiliateDid'),
        ]),
      });
      const jurisdictionStat = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(ClaimType.Jurisdiction),
          dsMockUtils.createMockIdentityId('jurisdictionDid'),
        ]),
      });

      // Custom claim type
      const customClaimTypeId = new BigNumber(123);
      const customStat = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(ClaimType.Custom, customClaimTypeId),
          dsMockUtils.createMockIdentityId('customDid'),
        ]),
      });

      dsMockUtils.createQueryMock('statistics', 'activeAssetStats', {
        returnValue: dsMockUtils.createMockBtreeSet([
          dsMockUtils.createMockStatisticsStatType({
            operationType: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
            claimIssuer: dsMockUtils.createMockOption(),
          }),
          dsMockUtils.createMockStatisticsStatType({
            operationType: dsMockUtils.createMockStatisticsOpType(StatType.Count),
            claimIssuer: dsMockUtils.createMockOption(),
          }),
          affiliateStat,
          jurisdictionStat,
          customStat,
        ]),
      });

      const result = await transferRestrictions.getStats();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: StatType.Balance }),
          expect.objectContaining({ type: StatType.Count }),
          expect.objectContaining({
            type: StatType.ScopedCount,
            claimIssuer: expect.objectContaining({
              claimType: ClaimType.Affiliate,
              issuer: expect.objectContaining({ did: 'affiliateDid' }),
            }),
          }),
          expect.objectContaining({
            type: StatType.ScopedBalance,
            claimIssuer: expect.objectContaining({
              claimType: ClaimType.Jurisdiction,
              issuer: expect.objectContaining({ did: 'jurisdictionDid' }),
            }),
          }),
          expect.objectContaining({
            type: StatType.ScopedBalance,
            claimIssuer: expect.objectContaining({
              claimType: { type: ClaimType.Custom, customClaimTypeId },
              issuer: expect.objectContaining({ did: 'customDid' }),
            }),
          }),
        ])
      );
    });
  });

  describe('method: getExemptions', () => {
    it('should return the identities with exemptions', async () => {
      dsMockUtils.createQueryMock('statistics', 'transferConditionExemptEntities', {
        entries: [
          tuple(
            [
              dsMockUtils.createMockExemptKey({
                assetId: createMockAssetId('0x12341234123412341234123412341234'),
                op: createMockStatisticsOpType(),
                claimType: dsMockUtils.createMockOption(),
              }),
              dsMockUtils.createMockIdentityId('someDid'),
            ],
            dsMockUtils.createMockBool(true)
          ),
        ],
      });

      let result = await transferRestrictions.getExemptions();

      expect(result).toEqual([
        {
          exemptKey: expect.objectContaining({
            assetId: '12341234-1234-1234-1234-123412341234',
            claimType: null,
            opType: StatType.Balance,
          }),
          identity: expect.objectContaining({ did: 'someDid' }),
        },
      ]);

      dsMockUtils.createQueryMock('statistics', 'transferConditionExemptEntities', {
        entries: [
          tuple(
            [
              dsMockUtils.createMockExemptKey({
                assetId: createMockAssetId('0x12341234123412341234123412341234'),
                op: createMockStatisticsOpType(StatType.Count),
                claimType: dsMockUtils.createMockOption(
                  dsMockUtils.createMockClaimType(ClaimType.Jurisdiction)
                ),
              }),
              dsMockUtils.createMockIdentityId('someDid'),
            ],
            dsMockUtils.createMockBool(true)
          ),
        ],
      });

      result = await transferRestrictions.getExemptions();

      expect(result).toEqual([
        {
          exemptKey: expect.objectContaining({
            assetId: '12341234-1234-1234-1234-123412341234',
            claimType: ClaimType.Jurisdiction,
            opType: StatType.Count,
          }),
          identity: expect.objectContaining({ did: 'someDid' }),
        },
      ]);
    });
  });

  describe('getValues', () => {
    const assetId = '12341234-1234-1234-1234-123412341234';
    let rawAssetId: PolymeshPrimitivesAssetAssetId;

    let rawCountStatType: PolymeshPrimitivesStatisticsStatType;
    let rawBalanceStatType: PolymeshPrimitivesStatisticsStatType;
    let rawAffiliateCountStatType: PolymeshPrimitivesStatisticsStatType;
    let rawJurisdictionBalanceStatType: PolymeshPrimitivesStatisticsStatType;
    let rawAccreditedBalanceStatType: PolymeshPrimitivesStatisticsStatType;
    let issuerDid: PolymeshPrimitivesIdentityId;

    let stat1stKey: PolymeshPrimitivesStatisticsStat1stKey;
    let stat2ndKey: PolymeshPrimitivesStatisticsStat2ndKey;
    let rawValue: u128;
    let value: BigNumber;

    let meshStatToStatTypeSpy: jest.SpyInstance;
    let assetToMeshAssetIdSpy: jest.SpyInstance;
    let u128ToBigNumberSpy: jest.SpyInstance;
    let queryMultiMock: jest.Mock;
    let getStat1stKeySpy: jest.SpyInstance;
    let getStat2ndKeySpy: jest.SpyInstance;

    beforeAll(() => {
      entityMockUtils.initMocks();
      dsMockUtils.initMocks();
      procedureMockUtils.initMocks();

      assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
      meshStatToStatTypeSpy = jest.spyOn(utilsConversionModule, 'meshStatToStatType');
      u128ToBigNumberSpy = jest.spyOn(utilsConversionModule, 'u128ToBigNumber');
      getStat1stKeySpy = jest.spyOn(utilsConversionModule, 'getStat1stKey');
      getStat2ndKeySpy = jest.spyOn(utilsConversionModule, 'getStat2ndKey');
    });

    afterEach(() => {
      dsMockUtils.reset();
      entityMockUtils.reset();
      procedureMockUtils.reset();
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      context = dsMockUtils.getContextInstance();

      rawAssetId = dsMockUtils.createMockAssetId(assetId);
      asset = new FungibleAsset({ assetId }, context);
      value = new BigNumber(10);
      rawValue = dsMockUtils.createMockU128(value);

      issuerDid = dsMockUtils.createMockIdentityId();

      rawCountStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.Count),
        claimIssuer: dsMockUtils.createMockOption(),
      });
      rawBalanceStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
        claimIssuer: dsMockUtils.createMockOption(),
      });
      rawAffiliateCountStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.ScopedCount),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(ClaimType.Affiliate),
          issuerDid,
        ]),
      });
      rawJurisdictionBalanceStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.ScopedBalance),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(ClaimType.Jurisdiction),
          issuerDid,
        ]),
      });

      rawAccreditedBalanceStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.ScopedBalance),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(ClaimType.Accredited),
          issuerDid,
        ]),
      });

      queryMultiMock = dsMockUtils.getQueryMultiMock();

      when(assetToMeshAssetIdSpy).calledWith(asset, context).mockReturnValue(rawAssetId);
      when(meshStatToStatTypeSpy)
        .calledWith(rawCountStatType, context)
        .mockReturnValue(StatType.Count);
      when(meshStatToStatTypeSpy)
        .calledWith(rawBalanceStatType, context)
        .mockReturnValue(StatType.Balance);
      when(meshStatToStatTypeSpy)
        .calledWith(rawAffiliateCountStatType, context)
        .mockReturnValue(StatType.ScopedCount);
      when(meshStatToStatTypeSpy)
        .calledWith(rawAccreditedBalanceStatType, context)
        .mockReturnValue(StatType.ScopedBalance);
      when(meshStatToStatTypeSpy)
        .calledWith(rawJurisdictionBalanceStatType, context)
        .mockReturnValue(StatType.ScopedBalance);
      when(u128ToBigNumberSpy).calledWith(rawValue).mockReturnValue(value);
      when(getStat1stKeySpy)
        .calledWith(asset, rawCountStatType, context)
        .mockReturnValue(stat1stKey);
      when(getStat1stKeySpy)
        .calledWith(asset, rawBalanceStatType, context)
        .mockReturnValue(stat1stKey);
      when(getStat1stKeySpy)
        .calledWith(asset, rawAffiliateCountStatType, context)
        .mockReturnValue(stat1stKey);
      when(getStat1stKeySpy)
        .calledWith(asset, rawAccreditedBalanceStatType, context)
        .mockReturnValue(stat1stKey);
      when(getStat1stKeySpy)
        .calledWith(asset, rawJurisdictionBalanceStatType, context)
        .mockReturnValue(stat1stKey);
      when(getStat2ndKeySpy).calledWith(context).mockReturnValue(stat2ndKey);
      when(getStat2ndKeySpy)
        .calledWith(context, ClaimType.Accredited, expect.any(Boolean))
        .mockReturnValue(stat2ndKey);
      when(getStat2ndKeySpy)
        .calledWith(context, ClaimType.Affiliate, expect.any(Boolean))
        .mockReturnValue(stat2ndKey);
      when(getStat2ndKeySpy)
        .calledWith(context, ClaimType.Jurisdiction, expect.anything())
        .mockReturnValue(stat2ndKey);

      dsMockUtils.createQueryMock('statistics', 'activeAssetStats', {
        returnValue: [
          rawCountStatType,
          rawBalanceStatType,
          rawAffiliateCountStatType,
          rawAccreditedBalanceStatType,
          rawJurisdictionBalanceStatType,
        ],
      });
      const entriesMock = dsMockUtils.createQueryMock('statistics', 'assetStats', {
        returnValue: jest.fn(),
      });

      // Mock the entries method for jurisdiction stats
      entriesMock.entries = jest.fn().mockResolvedValue([]);

      queryMultiMock.mockResolvedValue([
        rawValue, // rawCountStatType (NoClaimStat)
        rawValue, // rawBalanceStatType (NoClaimStat)
        rawValue, // rawAffiliateCountStatType (withClaim: true)
        rawValue, // rawAffiliateCountStatType (withoutClaim: false)
        rawValue, // rawAccreditedBalanceStatType (withClaim: true)
        rawValue, // rawAccreditedBalanceStatType (withoutClaim: false)
      ]);
    });

    afterAll(() => {
      dsMockUtils.cleanup();
      procedureMockUtils.cleanup();
    });

    it('should return an empty array when no active stats', async () => {
      // Mock activeAssetStats to return empty collection with isEmpty: true
      const emptyStats = dsMockUtils.createMockCodec([], true); // second param sets isEmpty to true
      dsMockUtils.createQueryMock('statistics', 'activeAssetStats', {
        returnValue: emptyStats,
      });

      const result = await asset.transferRestrictions.getValues();

      expect(result).toEqual([]);
    });

    it('should return the stat values for the asset', async () => {
      // Reset the activeAssetStats to the original setup
      dsMockUtils.createQueryMock('statistics', 'activeAssetStats', {
        returnValue: [
          rawCountStatType,
          rawBalanceStatType,
          rawAffiliateCountStatType,
          rawAccreditedBalanceStatType,
          rawJurisdictionBalanceStatType,
        ],
      });

      stat1stKey = {
        assetId: rawAssetId,
        statType: 'MaxInvestorCount',
      } as unknown as PolymeshPrimitivesStatisticsStat1stKey;
      stat2ndKey = {
        isNoClaimStat: true,
        type: 'NoClaimStat',
      } as PolymeshPrimitivesStatisticsStat2ndKey;

      const result = await asset.transferRestrictions.getValues();

      // Based on the actual output, we get 5 results:
      // 1. Jurisdiction with ScopedBalance, value "0", empty array
      // 2. Count with value "10" (basic stat)
      // 3. Balance with value "0.00001" (basic stat)
      // 4. Affiliate with ScopedBalance, value "0.00002" (scoped claim)
      // 5. Accredited with ScopedBalance, value "0.00002" (scoped claim)

      expect(result).toHaveLength(5);

      // All results should have type and value
      result.forEach(item => {
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('value');
        expect(item.value).toBeInstanceOf(BigNumber);
      });

      // Check for basic stats (no claims)
      const basicStats = result.filter(r => !r.claim);
      expect(basicStats).toHaveLength(2);

      expect(basicStats).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: StatType.Count,
            value: new BigNumber(10),
          }),
          expect.objectContaining({
            type: StatType.Balance,
            value: new BigNumber(10).shiftedBy(-6),
          }),
        ])
      );

      // Check for scoped claims
      const scopedStats = result.filter(r => r.claim);
      expect(scopedStats).toHaveLength(3);

      // Should have Jurisdiction scoped balance (empty value)
      expect(scopedStats).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim: expect.objectContaining({
              claimType: ClaimType.Jurisdiction,
            }),
            type: StatType.ScopedBalance,
            value: new BigNumber(0),
          }),
        ])
      );

      // Should have Affiliate scoped balance (decimal shifted)
      expect(scopedStats).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim: expect.objectContaining({
              claimType: ClaimType.Affiliate,
              issuer: expect.anything(),
              value: {
                withClaim: new BigNumber(10).shiftedBy(-6),
                withoutClaim: new BigNumber(10).shiftedBy(-6),
              },
            }),
            type: StatType.ScopedBalance,
            value: new BigNumber(20).shiftedBy(-6),
          }),
        ])
      );

      // Should have Accredited scoped balance (decimal shifted)
      expect(scopedStats).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim: expect.objectContaining({
              claimType: ClaimType.Accredited,
              issuer: expect.anything(),
              value: {
                withClaim: new BigNumber(10).shiftedBy(-6),
                withoutClaim: new BigNumber(10).shiftedBy(-6),
              },
            }),
            type: StatType.ScopedBalance,
            value: new BigNumber(20).shiftedBy(-6), // 0.00002
          }),
        ])
      );
    });

    it('should handle custom claim types and verify claimType as object with issuer', async () => {
      // Test Custom claim that returns an object structure
      const rawCustomClaimType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.ScopedBalance),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(ClaimType.Custom, new BigNumber(123)),
          issuerDid,
        ]),
      });

      dsMockUtils.createQueryMock('statistics', 'activeAssetStats', {
        returnValue: [rawCustomClaimType],
      });

      when(meshStatToStatTypeSpy)
        .calledWith(rawCustomClaimType, context)
        .mockReturnValue(StatType.ScopedBalance);

      // Mock the conversion function to return a Custom claim object
      const meshClaimTypeToClaimTypeSpy = jest.spyOn(
        utilsConversionModule,
        'meshClaimTypeToClaimType'
      );
      meshClaimTypeToClaimTypeSpy.mockReturnValue({
        type: ClaimType.Custom,
        customClaimTypeId: new BigNumber(123),
      });

      // Mock getStat1stKey for the custom claim
      when(getStat1stKeySpy)
        .calledWith(asset, rawCustomClaimType, context)
        .mockReturnValue(stat1stKey);

      // Mock requestMulti to return value for NoClaimStat query only (custom claims don't have withClaim/withoutClaim)
      queryMultiMock.mockResolvedValue([
        dsMockUtils.createMockU128(new BigNumber(800000)), // 0.8 token total (NoClaimStat only)
      ]);

      const result = await asset.transferRestrictions.getValues();

      // Verify we get the expected result structure
      expect(result).toHaveLength(1);

      const customClaimResult = result[0];

      // Verify that custom claims return claim property with issuer and claimType but NO value
      // (value is undefined for claim types not tracked onchain)
      expect(customClaimResult).toEqual({
        type: StatType.ScopedBalance,
        value: new BigNumber(800000).shiftedBy(-6), // 0.8 token total from NoClaimStat
        claim: {
          issuer: expect.anything(),
          claimType: {
            type: ClaimType.Custom,
            customClaimTypeId: new BigNumber(123),
          },
          // Note: NO 'value' property in claim object for custom claims (not tracked on-chain)
        },
      });

      // Verify that the claim object does NOT have a value property (not tracked on-chain for custom claims)
      expect(customClaimResult!.claim).not.toHaveProperty('value');

      // Verify the conversion was called to get the custom claim object
      expect(meshClaimTypeToClaimTypeSpy).toHaveBeenCalled();

      // Reset mocks
      meshClaimTypeToClaimTypeSpy.mockRestore();
    });

    it('should handle jurisdiction entries with different key types', async () => {
      // This test focuses on covering the jurisdiction handling branches
      const originalActiveAssetStats = [
        rawCountStatType,
        rawBalanceStatType,
        rawAffiliateCountStatType,
        rawAccreditedBalanceStatType,
        rawJurisdictionBalanceStatType,
      ];

      // Set up only the jurisdiction stat (which is ScopedBalance type)
      dsMockUtils.createQueryMock('statistics', 'activeAssetStats', {
        returnValue: [rawJurisdictionBalanceStatType],
      });

      // Mock jurisdiction entries with both NoClaimStat and Claim keys
      const noClaimKey = {
        args: [
          stat1stKey,
          {
            isNoClaimStat: true,
            asClaim: null,
          },
        ],
      };

      const usClaimKey = {
        args: [
          stat1stKey,
          {
            isNoClaimStat: false,
            isClaim: true,
            asClaim: {
              isJurisdiction: true,
              asJurisdiction: {
                toString: (): string => 'US',
              },
            },
          },
        ],
      };

      const canadaClaimKey = {
        args: [
          stat1stKey,
          {
            isNoClaimStat: false,
            isClaim: true,
            asClaim: {
              isJurisdiction: true,
              asJurisdiction: {
                toString: (): string => 'CA',
              },
            },
          },
        ],
      };

      const mockEntries = [
        [noClaimKey, rawValue],
        [usClaimKey, rawValue],
        [canadaClaimKey, rawValue],
      ];

      // Create a specific mock for this test
      const jurisdictionEntriesMock = dsMockUtils.createQueryMock('statistics', 'assetStats', {
        returnValue: jest.fn(),
      });
      jurisdictionEntriesMock.entries = jest.fn().mockResolvedValue(mockEntries);

      const result = await asset.transferRestrictions.getValues();

      // Verify we have the expected jurisdiction result with proper structure
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            claim: expect.objectContaining({
              claimType: ClaimType.Jurisdiction,
              issuer: expect.anything(),
              value: expect.arrayContaining([
                expect.objectContaining({
                  countryCode: null,
                  value: new BigNumber(10).shiftedBy(-6), // Balance type: shifted
                }),
                expect.objectContaining({
                  countryCode: 'US',
                  value: new BigNumber(10).shiftedBy(-6), // Balance type: shifted
                }),
                expect.objectContaining({
                  countryCode: 'CA',
                  value: new BigNumber(10).shiftedBy(-6), // Balance type: shifted
                }),
              ]),
            }),
            type: StatType.ScopedBalance,
            value: new BigNumber(30).shiftedBy(-6), // 10+10+10=30 -> 0.00003
          }),
        ])
      );

      // Reset to original stats
      dsMockUtils.createQueryMock('statistics', 'activeAssetStats', {
        returnValue: originalActiveAssetStats,
      });
    });
  });
});
