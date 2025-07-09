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
import { ClaimType, CountryCode, StatType, TransferRestrictionType } from '~/types';
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
    it('should return the active stats for the asset', async () => {
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
        ]),
      });

      const result = await transferRestrictions.getStats();

      expect(result).toEqual([{ type: StatType.Balance }, { type: StatType.Count }]);
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
    let rawPercentageStatType: PolymeshPrimitivesStatisticsStatType;
    let rawClaimCountStatType: PolymeshPrimitivesStatisticsStatType;
    let rawJurisdictionStatType: PolymeshPrimitivesStatisticsStatType;
    let rawClaimPercentageStatType: PolymeshPrimitivesStatisticsStatType;
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
      rawPercentageStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.Balance),
        claimIssuer: dsMockUtils.createMockOption(),
      });
      rawClaimCountStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.Count),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(ClaimType.Affiliate),
          issuerDid,
        ]),
      });
      rawJurisdictionStatType = dsMockUtils.createMockStatisticsStatType({
        operationType: dsMockUtils.createMockStatisticsOpType(StatType.ScopedCount),
        claimIssuer: dsMockUtils.createMockOption([
          dsMockUtils.createMockClaimType(ClaimType.Jurisdiction),
          issuerDid,
        ]),
      });

      rawClaimPercentageStatType = dsMockUtils.createMockStatisticsStatType({
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
        .calledWith(rawPercentageStatType, context)
        .mockReturnValue(StatType.Balance);
      when(meshStatToStatTypeSpy)
        .calledWith(rawClaimCountStatType, context)
        .mockReturnValue(StatType.Count);
      when(meshStatToStatTypeSpy)
        .calledWith(rawClaimPercentageStatType, context)
        .mockReturnValue(StatType.ScopedBalance);
      when(meshStatToStatTypeSpy)
        .calledWith(rawJurisdictionStatType, context)
        .mockReturnValue(StatType.ScopedCount);
      when(u128ToBigNumberSpy).calledWith(rawValue).mockReturnValue(value);
      when(getStat1stKeySpy)
        .calledWith(asset, rawCountStatType, context)
        .mockReturnValue(stat1stKey);
      when(getStat1stKeySpy)
        .calledWith(asset, rawPercentageStatType, context)
        .mockReturnValue(stat1stKey);
      when(getStat1stKeySpy)
        .calledWith(asset, rawClaimCountStatType, context)
        .mockReturnValue(stat1stKey);
      when(getStat1stKeySpy)
        .calledWith(asset, rawClaimPercentageStatType, context)
        .mockReturnValue(stat1stKey);
      when(getStat1stKeySpy)
        .calledWith(asset, rawJurisdictionStatType, context)
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
          rawPercentageStatType,
          rawClaimCountStatType,
          rawClaimPercentageStatType,
          rawJurisdictionStatType,
        ],
      });
      dsMockUtils.createQueryMock('statistics', 'assetStats');

      queryMultiMock.mockResolvedValue([
        rawValue,
        rawValue,
        rawValue,
        rawValue,
        rawValue,
        rawValue,
        rawValue,
        rawValue,
        // for Jurisdiction without country code
        rawValue,
        // for Jurisdiction with country code
        ...new Array(Object.keys(CountryCode).length).fill(rawValue),
      ]);
    });

    afterAll(() => {
      dsMockUtils.cleanup();
      procedureMockUtils.cleanup();
    });

    it('should return the stat values for the asset', async () => {
      stat1stKey = {
        assetId: rawAssetId,
        statType: 'MaxInvestorCount',
      } as unknown as PolymeshPrimitivesStatisticsStat1stKey;
      stat2ndKey = {
        isNoClaimStat: true,
        type: 'NoClaimStat',
      } as PolymeshPrimitivesStatisticsStat2ndKey;

      const result = await asset.transferRestrictions.getValues();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: StatType.Count,
            value: new BigNumber(10),
          }),
          expect.objectContaining({
            type: StatType.Balance,
            value: new BigNumber(10).shiftedBy(-6),
          }),
          expect.objectContaining({
            claim: {
              claimType: ClaimType.Affiliate,
              issuer: expect.anything(),
              value: {
                affiliate: new BigNumber(10),
                nonAffiliate: new BigNumber(10),
              },
            },
            type: StatType.ScopedCount,
            value: new BigNumber(20),
          }),
          expect.objectContaining({
            claim: {
              claimType: ClaimType.Accredited,
              issuer: expect.anything(),
              value: {
                accredited: new BigNumber(10).shiftedBy(-6),
                nonAccredited: new BigNumber(10).shiftedBy(-6),
              },
            },
            type: StatType.ScopedBalance,
            value: new BigNumber(20).shiftedBy(-6),
          }),
          expect.objectContaining({
            claim: {
              claimType: ClaimType.Jurisdiction,
              issuer: expect.anything(),
              value: expect.arrayContaining([
                expect.objectContaining({
                  count: expect.any(BigNumber),
                  countryCode: expect.any(String),
                }),
              ]),
            },
            type: StatType.ScopedBalance,
            value: expect.any(BigNumber),
          }),
        ])
      );
    });
  });
});
