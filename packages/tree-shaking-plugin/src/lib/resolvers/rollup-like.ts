import type {
  BundlerResolveContext,
  LoadStrategy,
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
  ResolveStrategy,
} from './common.js';
import {
  createQraftModuleAccess,
  createUserResolverStrategy,
  createUserSourceLoaderStrategy,
  stripQueryAndHash,
} from './common.js';

function createRollupResolveStrategy(
  ctx: BundlerResolveContext
): ResolveStrategy {
  return {
    name: 'native',
    async resolve({ specifier, importer }) {
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
    },
  };
}

function createRollupFsLoadStrategy(ctx: BundlerResolveContext): LoadStrategy {
  return {
    name: 'adapter-fallback',
    async load({ id }) {
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
    },
  };
}

export function createRollupLikeModuleAccess(
  ctx: BundlerResolveContext,
  userAccess: QraftModuleAccessOptions = {}
): QraftModuleAccess {
  return createQraftModuleAccess(
    [
      createRollupResolveStrategy(ctx),
      createUserResolverStrategy(userAccess.resolve),
    ],
    [
      createUserSourceLoaderStrategy(userAccess.load),
      createRollupFsLoadStrategy(ctx),
    ]
  );
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
