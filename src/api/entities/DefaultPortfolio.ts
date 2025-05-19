import BigNumber from 'bignumber.js';

import { Context, Portfolio } from '~/internal';

export interface UniqueIdentifiers {
  did: string;
}

/**
 * Represents the default Portfolio for an Identity
 */
export class DefaultPortfolio extends Portfolio {
  /**
   * @hidden
   */
  constructor(identifiers: UniqueIdentifiers, context: Context) {
    super({ ...identifiers, id: new BigNumber(0) }, context);
  }

  /**
   * Determine whether this Portfolio exists on chain
   */
  public exists(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
