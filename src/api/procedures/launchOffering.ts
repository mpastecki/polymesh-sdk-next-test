import { ISubmittableResult } from '@polkadot/types/types';
import BigNumber from 'bignumber.js';

import { assertPortfolioExists } from '~/api/procedures/utils';
import { Context, FungibleAsset, Identity, Offering, PolymeshError, Procedure } from '~/internal';
import { ErrorCode, LaunchOfferingParams, PortfolioId, RoleType, TxTags, VenueType } from '~/types';
import { ExtrinsicParams, ProcedureAuthorization, TransactionSpec } from '~/types/internal';
import {
  assetToMeshAssetId,
  bigNumberToBalance,
  bigNumberToU64,
  dateToMoment,
  offeringTierToPriceTier,
  portfolioIdToMeshPortfolioId,
  portfolioIdToPortfolio,
  portfolioLikeToPortfolioId,
  stringToBytes,
  u64ToBigNumber,
} from '~/utils/conversion';
import { asBaseAsset, filterEventRecords, optionize } from '~/utils/internal';

/**
 * @hidden
 */
export type Params = LaunchOfferingParams & {
  asset: FungibleAsset;
};

/**
 * @hidden
 */
export interface Storage {
  offeringPortfolioId: PortfolioId;
  raisingPortfolioId: PortfolioId;
}

/**
 * @hidden
 */
export const createOfferingResolver =
  (assetId: string, context: Context) =>
  (receipt: ISubmittableResult): Offering => {
    const [result] = filterEventRecords(receipt, 'sto', 'FundraiserCreated');

    const { data } = result!;
    const newFundraiserId = u64ToBigNumber(data[3]);

    return new Offering({ id: newFundraiserId, assetId }, context);
  };

/**
 * @hidden
 */
export async function prepareLaunchOffering(
  this: Procedure<Params, Offering, Storage>,
  args: Params
): Promise<TransactionSpec<Offering, ExtrinsicParams<'sto', 'createFundraiser'>>> {
  const {
    context: {
      polymeshApi: { tx },
    },
    context,
    storage: { offeringPortfolioId, raisingPortfolioId },
  } = this;
  const { asset, raisingCurrency, venue, name, tiers, start, end, minInvestment } = args;

  const portfolio = portfolioIdToPortfolio(offeringPortfolioId, context);

  const [, , [balanceResult]] = await Promise.all([
    assertPortfolioExists(offeringPortfolioId, context),
    assertPortfolioExists(raisingPortfolioId, context),
    portfolio.getAssetBalances({
      assets: [asset],
    }),
  ]);

  const { free } = balanceResult!;

  let venueId: BigNumber | undefined;

  if (venue) {
    const venueExists = await venue.exists();

    if (venueExists) {
      ({ id: venueId } = venue);
    }
  } else {
    const offeringPortfolioOwner = new Identity({ did: offeringPortfolioId.did }, context);
    const venues = await offeringPortfolioOwner.getVenues();

    const offeringVenues = await Promise.all(
      venues.map(async ownedVenue => {
        const { type } = await ownedVenue.details();

        return type === VenueType.Sto;
      })
    );

    if (offeringVenues.some(Boolean)) {
      const ownedVenue = venues.find(ownVenue => offeringVenues[venues.indexOf(ownVenue)]);

      if (ownedVenue) {
        ({ id: venueId } = ownedVenue);
      }
    }
  }

  if (!venueId) {
    throw new PolymeshError({
      code: ErrorCode.DataUnavailable,
      message: 'A valid Venue for the Offering was neither supplied nor found',
    });
  }

  const totalTierBalance = tiers.reduce<BigNumber>(
    (total, { amount }) => total.plus(amount),
    new BigNumber(0)
  );

  if (totalTierBalance.gt(free)) {
    throw new PolymeshError({
      code: ErrorCode.InsufficientBalance,
      message: "There isn't enough free balance in the offering Portfolio",
      data: {
        free,
      },
    });
  }

  const rawAssetId = assetToMeshAssetId(asset, context);
  const raisingAsset = await asBaseAsset(raisingCurrency, context);

  return {
    transaction: tx.sto.createFundraiser,
    args: [
      portfolioIdToMeshPortfolioId(offeringPortfolioId, context),
      rawAssetId,
      portfolioIdToMeshPortfolioId(raisingPortfolioId, context),
      assetToMeshAssetId(raisingAsset, context),
      tiers.map(tier => offeringTierToPriceTier(tier, context)),
      bigNumberToU64(venueId, context),
      optionize(dateToMoment)(start, context),
      optionize(dateToMoment)(end, context),
      bigNumberToBalance(minInvestment, context),
      stringToBytes(name, context),
    ],
    resolver: createOfferingResolver(asset.id, context),
  };
}

/**
 * @hidden
 */
export function getAuthorization(
  this: Procedure<Params, Offering, Storage>,
  { asset }: Params
): ProcedureAuthorization {
  const {
    storage: { offeringPortfolioId, raisingPortfolioId },
    context,
  } = this;

  return {
    roles: [
      { type: RoleType.PortfolioCustodian, portfolioId: offeringPortfolioId },
      { type: RoleType.PortfolioCustodian, portfolioId: raisingPortfolioId },
    ],
    permissions: {
      transactions: [TxTags.sto.CreateFundraiser],
      assets: [asset],
      portfolios: [
        portfolioIdToPortfolio(offeringPortfolioId, context),
        portfolioIdToPortfolio(raisingPortfolioId, context),
      ],
    },
  };
}

/**
 * @hidden
 */
export function prepareStorage(
  this: Procedure<Params, Offering, Storage>,
  { offeringPortfolio, raisingPortfolio }: Params
): Storage {
  return {
    offeringPortfolioId: portfolioLikeToPortfolioId(offeringPortfolio),
    raisingPortfolioId: portfolioLikeToPortfolioId(raisingPortfolio),
  };
}

/**
 * @hidden
 */
export const launchOffering = (): Procedure<Params, Offering, Storage> =>
  new Procedure(prepareLaunchOffering, getAuthorization, prepareStorage);
