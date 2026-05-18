import type {
  BundlerResolveContext,
  LoadStrategy,
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
  ResolveStrategy,
} from './common.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  createQraftModuleAccess,
  createUserResolverStrategy,
  createUserSourceLoaderStrategy,
  stripQueryAndHash,
} from './common.js';

function createEsbuildResolveStrategy(
  ctx: BundlerResolveContext
): ResolveStrategy {
  return {
    name: 'native',
    async resolve({ specifier, importer }) {
      const native = ctx.getNativeBuildContext?.();
      if (native?.framework !== 'esbuild' || !native.build) return null;

      try {
        const resolved = await native.build.resolve(specifier, {
          resolveDir: path.dirname(importer),
          kind: 'import-statement',
          importer,
        });
        if (
          resolved &&
          resolved.path &&
          (!resolved.errors || resolved.errors.length === 0)
        ) {
          return resolved.path;
        }
      } catch {
        // fall through
      }

      return null;
    },
  };
}

// Esbuild exposes build.resolve but no arbitrary build.load API. Keep this
// fallback adapter-local; core transform must not read the filesystem directly.
function createEsbuildFileLoadStrategy(): LoadStrategy {
  return {
    name: 'adapter-fallback',
    async load({ id }) {
      try {
        return await fs.readFile(stripQueryAndHash(id), 'utf8');
      } catch {
        return null;
      }
    },
  };
}

export function createEsbuildModuleAccess(
  ctx: BundlerResolveContext,
  userAccess: QraftModuleAccessOptions = {}
): QraftModuleAccess {
  return createQraftModuleAccess(
    [
      createUserResolverStrategy(userAccess.resolve),
      createEsbuildResolveStrategy(ctx),
    ],
    [
      createUserSourceLoaderStrategy(userAccess.load),
      createEsbuildFileLoadStrategy(),
    ]
  );
}

export function createEsbuildResolver(
  ctx: BundlerResolveContext,
  userResolve?: QraftResolver
): QraftResolver {
  return createEsbuildModuleAccess(ctx, { resolve: userResolve }).resolve;
}
