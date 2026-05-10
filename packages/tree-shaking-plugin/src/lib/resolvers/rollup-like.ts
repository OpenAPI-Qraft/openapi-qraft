import type {
  BundlerResolveContext,
  LoadStrategy,
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
  ResolveStrategy,
} from './common.js';
import {
  createResolverChain,
  createSourceLoaderChain,
  createUserResolverStrategy,
  createUserSourceLoaderStrategy,
} from './common.js';

function stripQueryAndHash(id: string): string {
  const queryIndex = id.indexOf('?');
  const hashIndex = id.indexOf('#');
  const cutIndex =
    queryIndex === -1
      ? hashIndex
      : hashIndex === -1
        ? queryIndex
        : Math.min(queryIndex, hashIndex);

  return cutIndex >= 0 ? id.slice(0, cutIndex) : id;
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
        return resolved.id;
      }
    } catch {
      // fall through
    }

    return null;
  };
}

function createRollupFsLoadStrategy(ctx: BundlerResolveContext): LoadStrategy {
  return async ({ id }) => {
    if (typeof ctx.fs?.readFile !== 'function') return null;

    const fileId = stripQueryAndHash(id);
    try {
      const loaded = await ctx.fs.readFile(fileId, 'utf8');
      return typeof loaded === 'string'
        ? loaded
        : Buffer.from(loaded).toString('utf8');
    } catch {
      return null;
    }
  };
}

export function createRollupLikeModuleAccess(
  ctx: BundlerResolveContext,
  userAccess: QraftModuleAccessOptions = {}
): QraftModuleAccess {
  return {
    resolve: createResolverChain([
      createRollupResolveStrategy(ctx),
      createUserResolverStrategy(userAccess.resolve),
    ]),
    load: createSourceLoaderChain([
      createUserSourceLoaderStrategy(userAccess.load),
      createRollupFsLoadStrategy(ctx),
    ]),
  };
}

export function createRollupLikeResolver(
  ctx: BundlerResolveContext,
  userResolve?: QraftResolver
): QraftResolver {
  const resolve = createRollupLikeModuleAccess(ctx, {
    resolve: userResolve,
  }).resolve;

  return async (specifier, importer) => {
    const resolved = await resolve(specifier, importer);
    return resolved ? stripQueryAndHash(resolved) : null;
  };
}
