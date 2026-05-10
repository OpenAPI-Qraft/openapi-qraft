import type {
  BundlerResolveContext,
  LoadStrategy,
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
  ResolveStrategy,
} from './common.js';
import path from 'node:path';
import {
  createResolverChain,
  createSourceLoaderChain,
  createUserResolverStrategy,
  createUserSourceLoaderStrategy,
} from './common.js';

type WebpackResolveFn = (
  context: string,
  request: string
) => Promise<string> | string;

type WebpackLoadModule = (
  request: string,
  callback: (
    error: Error | null,
    source: string | Buffer | null,
    sourceMap: unknown,
    module: unknown
  ) => void
) => void;

type WebpackLoaderContextLike = BundlerResolveContext & {
  getResolve?: (options?: { dependencyType?: string }) => WebpackResolveFn;
  loadModule?: WebpackLoadModule;
};

function createWebpackResolveStrategy(
  ctx: WebpackLoaderContextLike
): ResolveStrategy {
  return async ({ specifier, importer }) => {
    const loaderContext = ctx.getNativeBuildContext?.()?.loaderContext;
    const getResolve =
      typeof loaderContext === 'object' &&
      loaderContext !== null &&
      'getResolve' in loaderContext &&
      typeof loaderContext.getResolve === 'function'
        ? loaderContext.getResolve
        : ctx.getResolve;
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

function createWebpackLoadStrategy(
  ctx: WebpackLoaderContextLike
): LoadStrategy {
  return async ({ id }) => {
    const loaderContext = ctx.getNativeBuildContext?.()?.loaderContext;
    const loadModule =
      typeof loaderContext === 'object' &&
      loaderContext !== null &&
      'loadModule' in loaderContext &&
      typeof loaderContext.loadModule === 'function'
        ? loaderContext.loadModule
        : ctx.loadModule;
    if (typeof loadModule !== 'function') return null;

    return new Promise<string | null>((resolve) => {
      loadModule(id, (error: Error | null, source: string | Buffer | null) => {
        if (error || source === null || source === undefined) {
          resolve(null);
          return;
        }

        resolve(Buffer.isBuffer(source) ? source.toString('utf8') : source);
      });
    });
  };
}

export function createWebpackLikeModuleAccess(
  ctx: WebpackLoaderContextLike,
  userAccess: QraftModuleAccessOptions = {}
): QraftModuleAccess {
  return {
    resolve: createResolverChain([
      createWebpackResolveStrategy(ctx),
      createUserResolverStrategy(userAccess.resolve),
    ]),
    load: createSourceLoaderChain([
      createWebpackLoadStrategy(ctx),
      createUserSourceLoaderStrategy(userAccess.load),
    ]),
  };
}

export function createWebpackLikeResolver(
  ctx: WebpackLoaderContextLike,
  userResolve?: QraftResolver
): QraftResolver {
  return createWebpackLikeModuleAccess(ctx, { resolve: userResolve }).resolve;
}
