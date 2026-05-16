import type {
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
} from './common.js';
import {
  createQraftModuleAccess,
  createResolverChain,
  createUserResolverStrategy,
  createUserSourceLoaderStrategy,
} from './common.js';

export function createAgnosticResolver(
  userResolve?: QraftResolver
): QraftResolver {
  return createResolverChain([createUserResolverStrategy(userResolve)]);
}

export function createAgnosticModuleAccess(
  userAccess: QraftModuleAccessOptions = {}
): QraftModuleAccess {
  return createQraftModuleAccess(
    [createUserResolverStrategy(userAccess.resolve)],
    [createUserSourceLoaderStrategy(userAccess.load)]
  );
}
