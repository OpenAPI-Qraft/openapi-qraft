import type {
  BundlerResolveContext,
  QraftResolver,
  ResolveStrategy,
} from './common.js';
import path from 'node:path';
import { createResolverChain, createUserResolverStrategy } from './common.js';

function createEsbuildResolveStrategy(
  ctx: BundlerResolveContext
): ResolveStrategy {
  return async ({ specifier, importer }) => {
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
  };
}

export function createEsbuildResolver(
  ctx: BundlerResolveContext,
  userResolve?: QraftResolver
): QraftResolver {
  return createResolverChain([
    createEsbuildResolveStrategy(ctx),
    createUserResolverStrategy(userResolve),
  ]);
}
