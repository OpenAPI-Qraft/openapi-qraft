import type {
  BundlerResolveContext,
  QraftResolver,
  ResolveStrategy,
} from './common.js';
import path from 'node:path';
import { createResolverChain, createUserResolverStrategy } from './common.js';

type WebpackResolveFn = (
  context: string,
  request: string
) => Promise<string> | string;

type WebpackLoaderContextLike = BundlerResolveContext & {
  getResolve?: (options?: { dependencyType?: string }) => WebpackResolveFn;
};

function createWebpackResolveStrategy(
  ctx: WebpackLoaderContextLike
): ResolveStrategy {
  return async ({ specifier, importer }) => {
    const native = ctx.getNativeBuildContext?.();
    const loaderContext = native?.loaderContext as
      | {
          getResolve?: (options?: {
            dependencyType?: string;
          }) => WebpackResolveFn;
        }
      | undefined;
    const getResolve = loaderContext?.getResolve ?? ctx.getResolve;
    if (typeof getResolve !== 'function') return null;

    try {
      const resolve = getResolve({ dependencyType: 'esm' });
      const resolved = await resolve(path.dirname(importer), specifier);
      return typeof resolved === 'string' ? resolved : null;
    } catch {
      // fall through
    }

    return null;
  };
}

export function createWebpackLikeResolver(
  ctx: WebpackLoaderContextLike,
  userResolve?: QraftResolver
): QraftResolver {
  return createResolverChain([
    createWebpackResolveStrategy(ctx),
    createUserResolverStrategy(userResolve),
  ]);
}
