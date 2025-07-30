import BigNumber from 'bignumber.js';

export interface BallotMotion {
  /**
   * Title of the motion.
   */
  title: string;

  /**
   * Link to more information about the motion.
   */
  infoLink: string;

  /**
   * Choices for the motion excluding abstain.
   * @note Voting power not used is considered abstained.
   */
  choices: string[];
}

export type BallotVote = {
  /**
   * The power of the vote.
   */
  power: BigNumber;

  /**
   * The fallback vote to be used if the choice is not found in the ballot.
   * @note This is only allowed for RCV ballots.
   * @note Must point to a choice in a motion (index of the choice in the motion choices array).
   * @note Must not point to the same choice as the `vote` property (index != choiceIndex).
   */
  fallback?: BigNumber;
};

export interface BallotMeta {
  /**
   * Title of the ballot.
   */
  title: string;

  /**
   * All the motions of the ballot, with their associated titles, choices, etc.
   */
  motions: BallotMotion[];
}

export interface CorporateBallotDetails {
  /**
   * Start date of the ballot.
   */
  startDate: Date;

  /**
   * End date of the ballot.
   */
  endDate: Date;

  /**
   * Metadata for the ballot.
   */
  meta: BallotMeta;

  /**
   * Whether Ranked-Choice Voting (RCV) has been enabled.
   *
   * Ranked-Choice Voting allows voters to select a fallback choice should their first
   * preference fail to reach a certain threshold or, for example, be eliminated in the top-2 run-off.
   */
  rcv: boolean;
}

export enum CorporateBallotStatus {
  Pending = 'Pending',
  Active = 'Active',
  Closed = 'Closed',
}

export type ChoiceWithVotes = {
  /**
   * The choice of the motion for which the votes are cast.
   */
  choice: string;

  /**
   * The number of votes for the choice.
   */
  votes: BigNumber;
};

export type CorporateBallotMotionWithResults = Pick<BallotMotion, 'title' | 'infoLink'> & {
  /**
   * The motion choices and their associated votes.
   */
  choices: ChoiceWithVotes[];

  /**
   * The total number of votes cast for the motion.
   */
  total: BigNumber;
};

export type CorporateBallotMetaWithResults = Omit<BallotMeta, 'motions'> & {
  /**
   * The motions with their associated choices and votes.
   */
  motions: CorporateBallotMotionWithResults[];
};

export type ChoiceWithParticipation = {
  /**
   * The choice of the motion for which the votes are cast.
   */
  choice: string;

  /**
   * The power of the vote.
   */
  power: BigNumber;

  /**
   * The fallback choice for the vote.
   */
  fallback?: BigNumber | undefined;
};

export type CorporateBallotMotionWithParticipation = Pick<BallotMotion, 'title' | 'infoLink'> & {
  /**
   * The choices with their associated votes and fallback choices.
   */
  choices: ChoiceWithParticipation[];
};

export type CorporateBallotWithParticipation = Omit<BallotMeta, 'motions'> & {
  /**
   * The motions with their associated choices and votes.
   */
  motions: CorporateBallotMotionWithParticipation[];
};
