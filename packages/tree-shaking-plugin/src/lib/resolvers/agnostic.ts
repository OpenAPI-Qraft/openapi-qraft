import type { QraftResolver } from './common.js';
import {
  createResolverChain,
  createUserResolverStrategy,
  resolveLocalModuleStrategy,
} from './common.js';

export function createAgnosticResolver(
  userResolve?: QraftResolver
): QraftResolver {
  return createResolverChain([
    createUserResolverStrategy(userResolve),
    resolveLocalModuleStrategy,
  ]);
}
