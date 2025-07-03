import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesIdentityClaimClaimType,
  PolymeshPrimitivesIdentityId,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesStatisticsStatType,
  PolymeshPrimitivesStatisticsStatUpdate,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import { BTreeSet } from '@polkadot/types-codec';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  prepareSetAssetStats,
  SetAssetStatParams,
} from '~/api/procedures/setAssetStats';
import { Context } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ClaimType, FungibleAsset, StatType, TxTags } from '~/types';
import { PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);

describe('setAssetStats procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let assetId: string;
  let asset: FungibleAsset;
  let count: BigNumber;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let args: SetAssetStatParams;
  let rawStatType: PolymeshPrimitivesStatisticsStatType;
  let rawStatBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatType>;
  let rawStatUpdate: PolymeshPrimitivesStatisticsStatUpdate;

  let setActiveAssetStatsTxMock: PolymeshTx<
    [PolymeshPrimitivesAssetAssetId, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;
  let batchUpdateAssetStatsTxMock: PolymeshTx<
    [
      PolymeshPrimitivesAssetAssetId,
      PolymeshPrimitivesStatisticsStatType,
      BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>
    ]
  >;
  let statisticsOpTypeToStatOpTypeSpy: jest.SpyInstance<
    PolymeshPrimitivesStatisticsStatType,
    [
      {
        operationType: PolymeshPrimitivesStatisticsStatOpType;
        claimIssuer?: [PolymeshPrimitivesIdentityClaimClaimType, PolymeshPrimitivesIdentityId];
      },
      Context
    ]
  >;
  let statisticStatTypesToBtreeStatTypeSpy: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesStatisticsStatType>,
    [PolymeshPrimitivesStatisticsStatType[], Context]
  >;
  let statUpdatesToBtreeStatUpdateSpy: jest.SpyInstance<
    BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>,
    [PolymeshPrimitivesStatisticsStatUpdate[], Context]
  >;
  let statUpdateBtreeSet: BTreeSet<PolymeshPrimitivesStatisticsStatUpdate>;
  let activeAssetStatsMock: jest.Mock;
  let statSpy: jest.SpyInstance;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    mockContext = dsMockUtils.getContextInstance();
    assetId = '0x12341234123412341234123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    count = new BigNumber(10);
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    statisticsOpTypeToStatOpTypeSpy = jest.spyOn(
      utilsConversionModule,
      'statisticsOpTypeToStatType'
    );
    statUpdatesToBtreeStatUpdateSpy = jest.spyOn(
      utilsConversionModule,
      'statUpdatesToBtreeStatUpdate'
    );
    dsMockUtils.setConstMock('statistics', 'maxTransferConditionsPerAsset', {
      returnValue: dsMockUtils.createMockU32(new BigNumber(3)),
    });
    statSpy = jest.spyOn(utilsConversionModule, 'meshStatToStatType');
    activeAssetStatsMock = dsMockUtils.createQueryMock('statistics', 'activeAssetStats');
    activeAssetStatsMock.mockReturnValue(dsMockUtils.createMockBtreeSet([]));
    statisticStatTypesToBtreeStatTypeSpy = jest.spyOn(
      utilsConversionModule,
      'statisticStatTypesToBtreeStatType'
    );
  });

  beforeEach(() => {
    statSpy.mockReturnValue(StatType.Balance);
    setActiveAssetStatsTxMock = dsMockUtils.createTxMock('statistics', 'setActiveAssetStats');
    batchUpdateAssetStatsTxMock = dsMockUtils.createTxMock('statistics', 'batchUpdateAssetStats');

    rawStatType = dsMockUtils.createMockStatisticsStatType();
    rawStatBtreeSet = dsMockUtils.createMockBtreeSet([rawStatType]);
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    rawStatUpdate = dsMockUtils.createMockStatUpdate();
    statUpdateBtreeSet = dsMockUtils.createMockBtreeSet([rawStatUpdate]);

    when(statUpdatesToBtreeStatUpdateSpy)
      .calledWith([rawStatUpdate], mockContext)
      .mockReturnValue(statUpdateBtreeSet);
    statisticsOpTypeToStatOpTypeSpy.mockReturnValue(rawStatType);

    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    statisticStatTypesToBtreeStatTypeSpy.mockReturnValue(rawStatBtreeSet);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
    jest.restoreAllMocks();
  });

  it('should add an setAssetStats transaction to the queue', async () => {
    args = {
      stats: [{ type: StatType.Balance }],
      asset,
    };
    const proc = procedureMockUtils.getInstance<SetAssetStatParams, void>(mockContext, {});

    let result = await prepareSetAssetStats.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setActiveAssetStatsTxMock,
          args: [rawAssetId, rawStatBtreeSet],
        },
      ],
      resolver: undefined,
    });

    args = {
      asset,
      stats: [
        {
          type: StatType.Count,
          count,
        },
      ],
    };

    jest
      .spyOn(utilsConversionModule, 'countStatInputToStatUpdates')
      .mockReturnValue(statUpdateBtreeSet);
    result = await prepareSetAssetStats.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setActiveAssetStatsTxMock,
          args: [rawAssetId, rawStatBtreeSet],
        },
        {
          transaction: batchUpdateAssetStatsTxMock,
          args: [rawAssetId, rawStatType, statUpdateBtreeSet],
        },
      ],
      resolver: undefined,
    });

    args = {
      asset,
      stats: [
        {
          type: StatType.ScopedCount,
          issuer: entityMockUtils.getIdentityInstance(),
          claimType: ClaimType.Accredited,
          value: {
            accredited: new BigNumber(1),
            nonAccredited: new BigNumber(2),
          },
        },
      ],
    };

    jest
      .spyOn(utilsConversionModule, 'claimCountStatInputToStatUpdates')
      .mockReturnValue(statUpdateBtreeSet);

    result = await prepareSetAssetStats.call(proc, args);

    expect(result).toEqual({
      transactions: [
        {
          transaction: setActiveAssetStatsTxMock,
          args: [rawAssetId, rawStatBtreeSet],
        },
        {
          transaction: batchUpdateAssetStatsTxMock,
          args: [rawAssetId, rawStatType, statUpdateBtreeSet],
        },
      ],
      resolver: undefined,
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      args = {
        asset,
        stats: [
          {
            count,
            type: StatType.Count,
          },
        ],
      };

      const proc = procedureMockUtils.getInstance<SetAssetStatParams, void>(mockContext);
      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [asset],
          transactions: [
            TxTags.statistics.SetActiveAssetStats,
            TxTags.statistics.BatchUpdateAssetStats,
          ],
          portfolios: [],
        },
      });
      expect(boundFunc({ asset, stats: [{ type: StatType.Balance }] })).toEqual({
        permissions: {
          assets: [asset],
          transactions: [TxTags.statistics.SetActiveAssetStats],
          portfolios: [],
        },
      });
    });
  });
});
