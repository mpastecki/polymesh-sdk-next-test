import { bool } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesStatisticsStatOpType,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareSetTransferRestrictionExemptions,
} from '~/api/procedures/setTransferRestrictionExemptions';
import { Context, PolymeshError } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { ErrorCode, FungibleAsset, StatType, TxTags } from '~/types';
import { ExemptKey, PolymeshTx } from '~/types/internal';
import * as utilsConversionModule from '~/utils/conversion';
import { toExemptKey } from '~/utils/conversion';

jest.mock(
  '~/api/entities/Asset/Fungible',
  require('~/testUtils/mocks/entities').mockFungibleAssetModule('~/api/entities/Asset/Fungible')
);
jest.mock(
  '~/api/entities/Identity',
  require('~/testUtils/mocks/entities').mockIdentityModule('~/api/entities/Identity')
);

describe('setTransferRestrictionsExemptions procedure', () => {
  let mockContext: Mocked<Context>;
  let assetToMeshAssetIdSpy: jest.SpyInstance;
  let identitiesToBtreeSetSpy: jest.SpyInstance;
  let boolToBooleanSpy: jest.SpyInstance;
  let statTypeToOpTypeSpy: jest.SpyInstance;
  let assetId: string;
  let asset: FungibleAsset;
  let rawAssetId: PolymeshPrimitivesAssetAssetId;
  let rawType: PolymeshPrimitivesStatisticsStatOpType;
  let rawIsExempt: bool;
  let exemptKey: ExemptKey;
  let setTransferRestrictionsExemptions: PolymeshTx<
    [PolymeshPrimitivesAssetAssetId, PolymeshPrimitivesTransferComplianceTransferCondition]
  >;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();
    assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
    identitiesToBtreeSetSpy = jest.spyOn(utilsConversionModule, 'identitiesToBtreeSet');
    boolToBooleanSpy = jest.spyOn(utilsConversionModule, 'booleanToBool');
    statTypeToOpTypeSpy = jest.spyOn(utilsConversionModule, 'statTypeToStatOpType');
  });

  beforeEach(() => {
    assetId = '12341234-1234-1234-1234-123412341234';
    asset = entityMockUtils.getFungibleAssetInstance({ assetId });
    rawIsExempt = dsMockUtils.createMockBool(true);
    rawType = dsMockUtils.createMockStatisticsOpType();
    rawAssetId = dsMockUtils.createMockAssetId(assetId);
    exemptKey = toExemptKey(rawAssetId, rawType);

    setTransferRestrictionsExemptions = dsMockUtils.createTxMock('statistics', 'setEntitiesExempt');

    mockContext = dsMockUtils.getContextInstance();

    when(statTypeToOpTypeSpy).calledWith(StatType.Count, mockContext).mockReturnValue(rawType);
    when(assetToMeshAssetIdSpy).calledWith(asset, mockContext).mockReturnValue(rawAssetId);
    boolToBooleanSpy.mockReturnValue(rawIsExempt);
  });

  afterEach(() => {
    entityMockUtils.reset();
    procedureMockUtils.reset();
    dsMockUtils.reset();
  });

  afterAll(() => {
    procedureMockUtils.cleanup();
    dsMockUtils.cleanup();
  });

  describe('prepareSetTransferRestrictionsExemptions', () => {
    it('should prepare the procedure', async () => {
      const someId = entityMockUtils.getIdentityInstance({ did: 'someDid' });
      const mockIds = dsMockUtils.createMockBtreeSet(['someDid']);
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const args: Params = {
        asset,
        isExempt: true,
        type: StatType.Count,
        identities: [someId],
      };

      dsMockUtils.createQueryMock('statistics', 'transferConditionExemptEntities', {
        multi: [],
      });

      when(identitiesToBtreeSetSpy).calledWith([someId], mockContext).mockReturnValue(mockIds);

      const result = await prepareSetTransferRestrictionExemptions.call(proc, args);

      expect(result).toEqual({
        transaction: setTransferRestrictionsExemptions,
        feeMultiplier: new BigNumber(1),
        args: [rawIsExempt, exemptKey, mockIds],
        resolver: undefined,
      });
    });

    it('throw an error if setting an already set identity', async () => {
      const someId = entityMockUtils.getIdentityInstance({ did: 'someDid' });
      const mockIds = dsMockUtils.createMockBtreeSet(['someDid']);
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const args: Params = {
        asset,
        isExempt: true,
        type: StatType.Count,
        identities: [someId],
      };

      dsMockUtils.createQueryMock('statistics', 'transferConditionExemptEntities', {
        multi: [dsMockUtils.createMockBool(true)],
      });

      when(identitiesToBtreeSetSpy).calledWith([someId], mockContext).mockReturnValue(mockIds);

      const expectedError = new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'Some identities are already exempted',
      });

      await expect(prepareSetTransferRestrictionExemptions.call(proc, args)).rejects.toThrow(
        expectedError
      );
    });

    it('throw an error if removing an unset identity', async () => {
      const someId = entityMockUtils.getIdentityInstance({ did: 'someDid' });
      const mockIds = dsMockUtils.createMockBtreeSet(['someDid']);
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const args: Params = {
        asset,
        isExempt: false,
        type: StatType.Count,
        identities: [someId],
      };

      dsMockUtils.createQueryMock('statistics', 'transferConditionExemptEntities', {
        multi: [dsMockUtils.createMockBool(false)],
      });

      when(identitiesToBtreeSetSpy).calledWith([someId], mockContext).mockReturnValue(mockIds);

      const expectedError = new PolymeshError({
        code: ErrorCode.NoDataChange,
        message: 'Some identities are not exemptions',
      });

      await expect(prepareSetTransferRestrictionExemptions.call(proc, args)).rejects.toThrow(
        expectedError
      );
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, void>(mockContext);
      const args: Params = {
        asset,
        isExempt: true,
        type: StatType.Balance,
        identities: [],
      };

      const boundFunc = getAuthorization.bind(proc);

      expect(boundFunc(args)).toEqual({
        permissions: {
          assets: [expect.objectContaining({ id: assetId })],
          transactions: [TxTags.statistics.SetEntitiesExempt],
          portfolios: [],
        },
      });
    });
  });
});
