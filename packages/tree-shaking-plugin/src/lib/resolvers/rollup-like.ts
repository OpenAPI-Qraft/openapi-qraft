import type {
  BundlerResolveContext,
  LoadStrategy,
  QraftModuleAccess,
  QraftModuleAccessOptions,
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
      createUserResolverStrategy(userAccess.resolve),
      createRollupResolveStrategy(ctx),
    ],
    [
      createUserSourceLoaderStrategy(userAccess.load),
      createRollupFsLoadStrategy(ctx),
    ]
  );
}
