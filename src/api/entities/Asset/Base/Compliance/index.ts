import { Requirements } from '~/api/entities/Asset/Base/Compliance/Requirements';
import { TrustedClaimIssuers } from '~/api/entities/Asset/Base/Compliance/TrustedClaimIssuers';
import { BaseAsset, Context, Namespace } from '~/internal';

/**
 * Handles all Asset Compliance related functionality
 */
export class Compliance extends Namespace<BaseAsset> {
  public trustedClaimIssuers: TrustedClaimIssuers;
  public requirements: Requirements;

  /**
   * @hidden
   */
  constructor(parent: BaseAsset, context: Context) {
    super(parent, context);

    this.trustedClaimIssuers = new TrustedClaimIssuers(parent, context);
    this.requirements = new Requirements(parent, context);
  }
}
