import { Compliance } from '~/api/entities/Asset/Base/Compliance';
import { Namespace } from '~/internal';

describe('Compliance class', () => {
  it('should extend namespace', () => {
    expect(Compliance.prototype instanceof Namespace).toBe(true);
  });
});
