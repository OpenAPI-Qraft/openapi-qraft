import type { QraftModuleAccess, QraftModuleAccessOptions } from './common.js';
import {
  createQraftModuleAccess,
  createUserResolverStrategy,
  createUserSourceLoaderStrategy,
} from './common.js';

export function createAgnosticModuleAccess(
  userAccess: QraftModuleAccessOptions = {}
): QraftModuleAccess {
  return createQraftModuleAccess(
    [createUserResolverStrategy(userAccess.resolve)],
    [createUserSourceLoaderStrategy(userAccess.load)]
  );
}
