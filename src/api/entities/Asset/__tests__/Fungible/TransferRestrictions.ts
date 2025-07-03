import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import { TransferRestrictions } from '~/api/entities/Asset/Fungible/TransferRestrictions';
import { Context, FungibleAsset, Namespace, PolymeshTransaction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { createMockAssetId, createMockStatisticsOpType } from '~/testUtils/mocks/dataSources';
import { ClaimType, StatType, TransferRestrictionType } from '~/types';
import { tuple } from '~/types/utils';

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
});
