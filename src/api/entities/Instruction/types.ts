import BigNumber from 'bignumber.js';

import {
  DefaultPortfolio,
  FungibleAsset,
  Identity,
  Instruction,
  Nft,
  NumberedPortfolio,
  Venue,
} from '~/internal';
import { EventIdentifier, NftCollection } from '~/types';

export enum InstructionStatus {
  Pending = 'Pending',
  Failed = 'Failed',
  Success = 'Success',
  Rejected = 'Rejected',
  LockedForExecution = 'LockedForExecution',
}

export enum InstructionType {
  SettleOnAffirmation = 'SettleOnAffirmation',
  SettleOnBlock = 'SettleOnBlock',
  SettleManual = 'SettleManual',
  SettleAfterLock = 'SettleAfterLock',
}

export type InstructionEndCondition =
  | {
      type: InstructionType.SettleOnAffirmation;
    }
  | {
      type: InstructionType.SettleOnBlock;
      endBlock: BigNumber;
    }
  | {
      type: InstructionType.SettleManual;
      endAfterBlock: BigNumber;
    }
  | {
      type: InstructionType.SettleAfterLock;
    };

export type InstructionDetails = {
  status: InstructionStatus;
  /**
   * Date at which the instruction was created
   * @note From 7.x chain, this value becomes null when instruction has been executed.
   */
  createdAt: Date | null;
  /**
   * Date at which the trade was agreed upon (optional, for offchain trades)
   */
  tradeDate: Date | null;
  /**
   * Date at which the trade was executed (optional, for offchain trades)
   */
  valueDate: Date | null;
  /**
   * Venue to which the Instruction belongs to
   * @note From 7.x chain, Instructions can be created without a Venue. Hence the possible null value.
   */
  venue: Venue | null;
  memo: string | null;
} & InstructionEndCondition;

export interface FungibleLeg {
  from: DefaultPortfolio | NumberedPortfolio;
  to: DefaultPortfolio | NumberedPortfolio;
  amount: BigNumber;
  asset: FungibleAsset;
}

export interface NftLeg {
  from: DefaultPortfolio | NumberedPortfolio;
  to: DefaultPortfolio | NumberedPortfolio;
  nfts: Nft[];
  asset: NftCollection;
}

export interface OffChainLeg {
  from: Identity;
  to: Identity;
  offChainAmount: BigNumber;
  /**
   * the ticker of the off chain asset
   */
  asset: string;
}

export type Leg = FungibleLeg | NftLeg | OffChainLeg;

export enum AffirmationStatus {
  Unknown = 'Unknown',
  Pending = 'Pending',
  Affirmed = 'Affirmed',
  Rejected = 'Rejected',
}

export interface InstructionAffirmation {
  identity: Identity;
  status: AffirmationStatus;
}

export interface OffChainAffirmation {
  legId: BigNumber;
  status: AffirmationStatus;
}

export type InstructionStatusResult =
  | {
      status: InstructionStatus.Pending;
    }
  | {
      status: Exclude<InstructionStatus, InstructionStatus.Pending>;
      eventIdentifier: EventIdentifier;
    };

export type MediatorAffirmation = {
  identity: Identity;
  status: AffirmationStatus;
  /**
   * Affirmations may have an expiration time
   */
  expiry?: Date;
};

export interface GroupedInstructions {
  /**
   * Instructions that have already been affirmed by the Identity
   */
  affirmed: Instruction[];
  /**
   * Instructions that still need to be affirmed/rejected by the Identity
   */
  pending: Instruction[];
  /**
   * Instructions that failed in their execution (can be rescheduled).
   *   This group supersedes the other three, so for example, a failed Instruction
   *   might also belong in the `affirmed` group, but it will only be included in this one
   */
  failed: Instruction[];
}

export type InstructionsByStatus = GroupedInstructions & {
  /**
   * Instructions that have one or more legs already affirmed, but still need to be one or more legs to be affirmed/rejected by the Identity
   */
  partiallyAffirmed: Instruction[];
};

export interface GroupedInvolvedInstructions {
  /**
   * Instructions where the Identity is the custodian of the leg portfolios
   */
  custodied: GroupedInstructions;
  /**
   * Instructions where the Identity is the owner of the leg portfolios
   */
  owned: Omit<GroupedInstructions, 'affirmed'>;
}

export interface InstructionLockedInfo {
  /**
   * Whether the instruction is locked for execution
   */
  isLocked: boolean;
  /**
   * The date and time when the instruction was locked for execution
   */
  lockedAt: Date | null;
  /**
   * Time in milliseconds after which the instruction will no longer be locked for execution
   */
  expiry: BigNumber | null;
  /**
   * The date when the instruction will no longer be locked for execution
   */
  unlocksAt: Date | null;
}
