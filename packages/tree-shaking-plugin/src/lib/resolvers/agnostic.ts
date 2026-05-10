import type {
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
} from './common.js';
import {
  createResolverChain,
  createSourceLoaderChain,
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
  return {
    resolve: createAgnosticResolver(userAccess.resolve),
    load: createSourceLoaderChain([
      createUserSourceLoaderStrategy(userAccess.load),
    ]),
  };
}
