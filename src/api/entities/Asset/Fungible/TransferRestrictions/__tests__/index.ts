import { u128 } from '@polkadot/types';
import {
  PolymeshPrimitivesAssetAssetId,
  PolymeshPrimitivesStatisticsStat1stKey,
  PolymeshPrimitivesStatisticsStat2ndKey,
  PolymeshPrimitivesTransferComplianceTransferCondition,
} from '@polkadot/types/lookup';
import { BigNumber } from 'bignumber.js';
import { when } from 'jest-when';

import { Context, FungibleAsset, Namespace } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { TransferRestriction, TransferRestrictionType } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

import { TransferRestrictions } from '..';

describe('TransferRestrictions class', () => {
  it('should extend namespace', () => {
    expect(TransferRestrictions.prototype instanceof Namespace).toBe(true);
  });

  describe('getValues', () => {
    let context: Context;
    let asset: FungibleAsset;
    const assetId = '12341234-1234-1234-1234-123412341234';
    let rawAssetId: PolymeshPrimitivesAssetAssetId;
    let countRestriction: TransferRestriction;
    let rawCountRestriction: PolymeshPrimitivesTransferComplianceTransferCondition;
    let stat1stKey: PolymeshPrimitivesStatisticsStat1stKey;
    let stat2ndKey: PolymeshPrimitivesStatisticsStat2ndKey;
    let rawValue: u128;
    let value: BigNumber;

    let assetToMeshAssetIdSpy: jest.SpyInstance;
    let transferConditionToTransferRestrictionSpy: jest.SpyInstance;
    let transferRestrictionToPolymeshPrimitivesStatisticsStat1stKeySpy: jest.SpyInstance;
    let transferRestrictionToPolymeshPrimitivesStatisticsStat2ndKeySpy: jest.SpyInstance;
    let queryMultiMock: jest.Mock;

    beforeAll(() => {
      entityMockUtils.initMocks();
      dsMockUtils.initMocks();
      procedureMockUtils.initMocks();

      assetToMeshAssetIdSpy = jest.spyOn(utilsConversionModule, 'assetToMeshAssetId');
      transferConditionToTransferRestrictionSpy = jest.spyOn(
        utilsConversionModule,
        'transferConditionToTransferRestriction'
      );
      transferRestrictionToPolymeshPrimitivesStatisticsStat1stKeySpy = jest.spyOn(
        utilsConversionModule,
        'transferRestrictionToPolymeshPrimitivesStatisticsStat1stKey'
      );
      transferRestrictionToPolymeshPrimitivesStatisticsStat2ndKeySpy = jest.spyOn(
        utilsConversionModule,
        'transferRestrictionToPolymeshPrimitivesStatisticsStat2ndKey'
      );

      countRestriction = {
        type: TransferRestrictionType.Count,
        value: new BigNumber(10),
      };

      rawCountRestriction = dsMockUtils.createMockTransferCondition({
        MaxInvestorCount: dsMockUtils.createMockU64(countRestriction.value),
      });
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

      stat1stKey = {
        assetId: rawAssetId,
        statType: 'MaxInvestorCount',
      } as unknown as PolymeshPrimitivesStatisticsStat1stKey;
      stat2ndKey = {
        isNoClaimStat: true,
        type: 'NoClaimStat',
      } as PolymeshPrimitivesStatisticsStat2ndKey;

      dsMockUtils.createQueryMock('statistics', 'assetTransferCompliances', {
        returnValue: {
          requirements: [rawCountRestriction],
        },
      });
      queryMultiMock = dsMockUtils.getQueryMultiMock();

      when(assetToMeshAssetIdSpy).calledWith(asset, context).mockReturnValue(rawAssetId);
      when(transferConditionToTransferRestrictionSpy)
        .calledWith(rawCountRestriction, context)
        .mockReturnValue(countRestriction);
      when(transferRestrictionToPolymeshPrimitivesStatisticsStat1stKeySpy)
        .calledWith(asset, countRestriction, context)
        .mockReturnValue(stat1stKey);
      when(transferRestrictionToPolymeshPrimitivesStatisticsStat2ndKeySpy)
        .calledWith(countRestriction, context)
        .mockReturnValue(stat2ndKey);
      queryMultiMock.mockResolvedValue([rawValue]);
    });

    afterAll(() => {
      dsMockUtils.cleanup();
      procedureMockUtils.cleanup();
    });

    it('should return the values of all active transfer restrictions for this Asset', async () => {
      const result = await asset.transferRestrictions.getValues();

      expect(result).toEqual([
        {
          restriction: countRestriction,
          value,
        },
      ]);
    });
  });
});
