import type {
  BundlerResolveContext,
  QraftResolver,
  ResolveStrategy,
} from './common.js';
import { createResolverChain, createUserResolverStrategy } from './common.js';

function stripQuery(id: string): string {
  const queryIndex = id.indexOf('?');
  return queryIndex >= 0 ? id.slice(0, queryIndex) : id;
}

function createRollupResolveStrategy(
  ctx: BundlerResolveContext
): ResolveStrategy {
  return async ({ specifier, importer }) => {
    if (typeof ctx.resolve !== 'function') return null;

    try {
      const resolved = await ctx.resolve(specifier, importer, {
        skipSelf: true,
      });
      if (resolved && typeof resolved.id === 'string' && !resolved.external) {
        return stripQuery(resolved.id);
      }
    } catch {
      // fall through
    }

    return null;
  };
}

export function createRollupLikeResolver(
  ctx: BundlerResolveContext,
  userResolve?: QraftResolver
): QraftResolver {
  return createResolverChain([
    createRollupResolveStrategy(ctx),
    createUserResolverStrategy(userResolve),
  ]);
}
