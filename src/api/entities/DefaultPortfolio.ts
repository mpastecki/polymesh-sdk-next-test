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
    // NOTE @monitz87: this is necessary to remove `id` from the DefaultPortfolio constructor signature
    super({ ...identifiers, id: undefined }, context);
  }

  /**
   * Determine whether this Portfolio exists on chain
   */
  public exists(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
