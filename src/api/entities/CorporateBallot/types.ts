import BigNumber from 'bignumber.js';

export interface BallotMotion {
  /**
   * Title of the motion
   */
  title: string;

  /**
   * Link to more information about the motion
   */
  infoLink: string;

  /**
   * Choices for the motion excluding abstain.
   * @note Voting power not used is considered abstained.
   */
  choices: string[];
}

export interface BallotMeta {
  /**
   * Title of the Ballot
   */
  title: string;

  /**
   * All the motions of the Ballot, with their associated titles, choices, etc
   */
  motions: BallotMotion[];
}

export interface CorporateBallotDetails {
  /**
   * start date of the ballot
   */
  startDate: Date;

  /**
   * end date of the ballot
   */
  endDate: Date;

  /**
   * meta data for the ballot
   */
  meta: BallotMeta;

  /**
   * whether Ranked-Choice Voting (RCV) has been enabled
   *
   * Ranked-Choice Voting allows voters to select a fallback choice should their first
   * preference fail to reach a certain threshold or e.g., be eliminated in the top-2 run-off. whether rcv voting has been enabled
   */
  rcv: boolean;
}

export enum CorporateBallotStatus {
  Pending = 'Pending',
  Active = 'Active',
  Closed = 'Closed',
}

type ChoiceWithVotes = {
  /**
   * The choice of the motion for which the votes are cast
   */
  choice: string;

  /**
   * The number of votes for the choice
   */
  votes: BigNumber;
};

export type CorporateBallotMotionWithResults = Pick<BallotMotion, 'title' | 'infoLink'> & {
  /**
   * The motion choices with their associated votes
   */
  choices: ChoiceWithVotes[];

  /**
   * The total number of votes cast on the motion
   */
  total: BigNumber;
};

export type CorporateBallotMetaWithResults = Omit<BallotMeta, 'motions'> & {
  /**
   * The motions with their associated choices and votes
   */
  motions: CorporateBallotMotionWithResults[];
};

export type ChoiceWithParticipation = {
  /**
   * The choice of the motion for which the votes are cast
   */
  choice: string;

  /**
   * The power of the vote
   */
  power: BigNumber;

  /**
   * The fallback choice for the vote
   */
  fallback?: BigNumber;
};

export type CorporateBallotMotionWithParticipation = Pick<BallotMotion, 'title' | 'infoLink'> & {
  /**
   * The choices with their associated votes and fallback choices
   */
  choices: ChoiceWithParticipation[];
};

export type CorporateBallotWithParticipation = Omit<BallotMeta, 'motions'> & {
  /**
   * The motions with their associated choices and votes
   */
  motions: CorporateBallotMotionWithParticipation[];
};
