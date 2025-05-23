import { ISubmittableResult } from '@polkadot/types/types';

import { Checkpoint, Context, FungibleAsset, Procedure } from '~/internal';
import { TxTags } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import { assetToMeshAssetId, u64ToBigNumber } from '~/utils/conversion';
import { filterEventRecords } from '~/utils/internal';

/**
 * @hidden
 */
export interface Params {
  asset: FungibleAsset;
}

/**
 * @hidden
 */
export const createCheckpointResolver =
  (assetId: string, context: Context) =>
  (receipt: ISubmittableResult): Checkpoint => {
    const [record] = filterEventRecords(receipt, 'checkpoint', 'CheckpointCreated');

    const id = u64ToBigNumber(record!.data[2]);

    return new Checkpoint({ id, assetId }, context);
  };

/**
 * @hidden
 */
export function prepareCreateCheckpoint(
  this: Procedure<Params, Checkpoint>,
  args: Params
): Promise<TransactionSpec<Checkpoint, ExtrinsicParams<'checkpoint', 'createCheckpoint'>>> {
  const { context } = this;
  const { asset } = args;

  const rawAssetId = assetToMeshAssetId(asset, context);

  return Promise.resolve({
    transaction: context.polymeshApi.tx.checkpoint.createCheckpoint,
    args: [rawAssetId],
    resolver: createCheckpointResolver(asset.id, context),
  });
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Checkpoint>,
  { asset }: Params
): ProcedureAuthorization {
  return {
    permissions: {
      transactions: [TxTags.checkpoint.CreateCheckpoint],
      assets: [asset],
      portfolios: [],
    },
  };
}

/**
 * @hidden
 */
export const createCheckpoint = (): Procedure<Params, Checkpoint> =>
  new Procedure(prepareCreateCheckpoint, getAuthorization);
