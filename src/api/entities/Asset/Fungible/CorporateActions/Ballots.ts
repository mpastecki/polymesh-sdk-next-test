import BigNumber from 'bignumber.js';

import { createBallot } from '~/api/procedures/createBallot';
import { Context, CorporateBallot, FungibleAsset, Namespace } from '~/internal';
import { CorporateBallotWithDetails, CreateBallotParams, ProcedureMethod } from '~/types';
import {
  assetToMeshAssetId,
  meshCorporateActionToCorporateActionParams,
  u32ToBigNumber,
} from '~/utils/conversion';
import {
  createProcedureMethod,
  getCorporateActionWithDescription,
  getCorporateBallotDetailsOrNull,
  getCorporateBallotDetailsOrThrow,
} from '~/utils/internal';

/**
 * Handles all Asset Ballots related functionality
 */
export class Ballots extends Namespace<FungibleAsset> {
  /**
   * Create a Ballot for an Asset
   */
  public create: ProcedureMethod<CreateBallotParams, CorporateBallotWithDetails>;

  /**
   * @hidden
   */
  constructor(parent: FungibleAsset, context: Context) {
    super(parent, context);

    this.create = createProcedureMethod(
      { getProcedureAndArgs: args => [createBallot, { asset: parent, ...args }] },
      context
    );
  }

  /**
   * Retrieve a single Ballot associated to this Asset by its ID
   *
   * @throws if there is no Ballot assigned to the provided Corporate Action with the passed ID
   * @throws if the provided Corporate Action does not exist
   */
  public async getOne(args: { id: BigNumber }): Promise<CorporateBallotWithDetails> {
    const { parent, context } = this;
    const { id } = args;

    const details = await getCorporateBallotDetailsOrThrow(parent, id, context);
    const { corporateAction, description } = await getCorporateActionWithDescription(
      parent,
      id,
      context
    );

    return {
      ballot: new CorporateBallot(
        {
          id,
          assetId: parent.id,
          ...meshCorporateActionToCorporateActionParams(corporateAction, description, context),
        },
        context
      ),
      details,
    };
  }

  /**
   * Retrieve all Ballots associated to this Asset
   */
  public async get(): Promise<CorporateBallotWithDetails[]> {
    const {
      parent,
      context: {
        polymeshApi: { query },
      },
      context,
    } = this;

    const rawEntries = await query.corporateAction.corporateActions.entries(
      assetToMeshAssetId(parent, context)
    );

    const corporateActions = rawEntries
      .map(([rawCaId, rawCorporateAction]) => ({
        rawCaId,
        id: u32ToBigNumber(rawCaId.args[1]),
        corporateAction: rawCorporateAction.unwrap(),
      }))
      .filter(({ corporateAction }) => corporateAction.kind.isIssuerNotice);

    const caDetailsPromises = corporateActions.map(ca => query.corporateAction.details(ca.rawCaId));
    const ballotDetailsPromises = corporateActions.map(ca =>
      getCorporateBallotDetailsOrNull(parent, ca.id, context)
    );

    const [caDetails, ballotDetails] = await Promise.all([
      Promise.all(caDetailsPromises),
      Promise.all(ballotDetailsPromises),
    ]);

    const result: CorporateBallotWithDetails[] = [];

    ballotDetails.forEach((details, index) => {
      const corporateActionEntry = corporateActions[index];
      const caDetailsEntry = caDetails[index];

      if (!corporateActionEntry || !caDetailsEntry) {
        return;
      }

      if (details) {
        result.push({
          ballot: new CorporateBallot(
            {
              id: corporateActionEntry.id,
              assetId: parent.id,
              ...meshCorporateActionToCorporateActionParams(
                corporateActionEntry.corporateAction,
                caDetailsEntry,
                context
              ),
            },
            context
          ),
          details,
        });
      }
    });

    return result;
  }
}
