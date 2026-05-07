import type { QraftResolver } from './common.js';
import { createResolverChain, createUserResolverStrategy } from './common.js';

export function createAgnosticResolver(
  userResolve?: QraftResolver
): QraftResolver {
  return createResolverChain([createUserResolverStrategy(userResolve)]);
}
