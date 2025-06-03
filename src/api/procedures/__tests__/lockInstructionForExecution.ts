import { u64 } from '@polkadot/types';
import { DispatchError } from '@polkadot/types/interfaces/system';
import BigNumber from 'bignumber.js';
import { when } from 'jest-when';

import {
  getAuthorization,
  Params,
  prepareLockInstructionForExecution,
} from '~/api/procedures/lockInstructionForExecution';
import * as procedureUtilsModule from '~/api/procedures/utils';
import { Context, Instruction } from '~/internal';
import { dsMockUtils, entityMockUtils, procedureMockUtils } from '~/testUtils/mocks';
import { Mocked } from '~/testUtils/types';
import { AffirmationStatus, InstructionAffirmationOperation, TxTags } from '~/types';
import * as utilsConversionModule from '~/utils/conversion';

jest.mock(
  '~/api/entities/Instruction',
  require('~/testUtils/mocks/entities').mockInstructionModule('~/api/entities/Instruction')
);

describe('lockInstructionForExecution procedure', () => {
  const id = new BigNumber(1);
  const rawInstructionId = dsMockUtils.createMockU64(id);

  const consumedWeight = dsMockUtils.createMockWeight({
    refTime: dsMockUtils.createMockCompact(dsMockUtils.createMockU64(new BigNumber(0))),
    proofSize: dsMockUtils.createMockCompact(
      dsMockUtils.createMockU64(new BigNumber('9455603734'))
    ),
  });

  let mockContext: Mocked<Context>;
  let bigNumberToU64Spy: jest.SpyInstance<u64, [BigNumber, Context]>;
  let lockInstructionWeightMock: jest.Mock;

  let lockInstructionTxMock: jest.Mock;

  beforeAll(() => {
    dsMockUtils.initMocks();
    procedureMockUtils.initMocks();
    entityMockUtils.initMocks();

    bigNumberToU64Spy = jest.spyOn(utilsConversionModule, 'bigNumberToU64');

    jest.spyOn(procedureUtilsModule, 'assertInstructionValidForLocking').mockImplementation();
  });

  beforeEach(() => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        getMediators: [
          { identity: entityMockUtils.getIdentityInstance(), status: AffirmationStatus.Affirmed },
        ],
      },
    });

    lockInstructionWeightMock = dsMockUtils.createCallMock(
      'settlementApi',
      'lockInstructionWeight'
    );
    lockInstructionWeightMock.mockReturnValue(
      dsMockUtils.createMockLockInstructionWeight({
        Ok: consumedWeight,
      })
    );

    lockInstructionTxMock = dsMockUtils.createTxMock('settlement', 'lockInstruction');

    mockContext = dsMockUtils.getContextInstance();
    when(bigNumberToU64Spy).calledWith(id, mockContext).mockReturnValue(rawInstructionId);
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

  it('should throw an error pending affirmation count is not zero', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        getPendingAffirmationCount: new BigNumber(1),
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    return expect(
      prepareLockInstructionForExecution.call(proc, {
        id,
      })
    ).rejects.toThrow(
      'Instruction needs to be affirmed by all parties before it can be locked for execution'
    );
  });

  it('should throw an error if signer is not a mediator', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        getMediators: [
          {
            identity: entityMockUtils.getIdentityInstance({ did: 'randomDid' }),
            status: AffirmationStatus.Affirmed,
          },
        ],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    return expect(
      prepareLockInstructionForExecution.call(proc, {
        id,
      })
    ).rejects.toThrow('Only mediators can lock instructions for execution');
  });

  it('should throw an error if mediator affirmation has expired', () => {
    entityMockUtils.configureMocks({
      instructionOptions: {
        getMediators: [
          {
            identity: entityMockUtils.getIdentityInstance(),
            status: AffirmationStatus.Affirmed,
            expiry: new Date('2022/01/01'),
          },
        ],
      },
    });

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    return expect(
      prepareLockInstructionForExecution.call(proc, {
        id,
      })
    ).rejects.toThrow('Mediator affirmation has expired');
  });

  it('should return an throw an error if runtime API throws an error while fetching lock weight', () => {
    lockInstructionWeightMock.mockReturnValue(
      dsMockUtils.createMockLockInstructionWeight({
        Err: 'errorResponse' as unknown as DispatchError,
      })
    );

    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    return expect(
      prepareLockInstructionForExecution.call(proc, {
        id,
      })
    ).rejects.toThrow('Instruction cannot be locked for execution');
  });

  it('should return a transaction spec on successful locking', async () => {
    const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext);

    const result = await prepareLockInstructionForExecution.call(proc, {
      id,
      operation: InstructionAffirmationOperation.Affirm,
    });

    expect(result).toEqual({
      transaction: lockInstructionTxMock,
      args: [rawInstructionId, consumedWeight],
      resolver: expect.objectContaining({ id }),
    });
  });

  describe('getAuthorization', () => {
    it('should return the appropriate roles and permissions', () => {
      const proc = procedureMockUtils.getInstance<Params, Instruction>(mockContext, { id });
      const boundFunc = getAuthorization.bind(proc);

      const result = boundFunc();

      expect(result).toEqual({
        permissions: {
          assets: [],
          portfolios: [],
          transactions: [TxTags.settlement.LockInstruction],
        },
      });
    });
  });
});
