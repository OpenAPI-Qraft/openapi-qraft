import type { TsconfigOptions } from '@rspack/resolver';
import type {
  BundlerResolveContext,
  LoadStrategy,
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
  ResolveStrategy,
} from './common.js';
import path from 'node:path';
import { ResolverFactory } from '@rspack/resolver';
import {
  createResolverChain,
  createSourceLoaderChain,
  createUserResolverStrategy,
  createUserSourceLoaderStrategy,
} from './common.js';

type RspackResolveOptions = ConstructorParameters<typeof ResolverFactory>[0];

type RspackCompilerLike = {
  options?: {
    resolve?: RspackBundlerResolveOptions;
  };
};

type RspackBundlerResolveOptions = RspackResolveOptions & {
  tsConfig?: string | TsconfigOptions;
};

type RspackInputFileSystem = {
  readFile?: (
    path: string,
    callback: (
      error: Error | null,
      source?: string | Buffer | Uint8Array
    ) => void
  ) => void;
};

function getRspackInputFileSystem(
  loaderContext: unknown
): RspackInputFileSystem | null {
  if (
    typeof loaderContext !== 'object' ||
    loaderContext === null ||
    !('fs' in loaderContext)
  ) {
    return null;
  }

  const { fs } = loaderContext;
  if (typeof fs !== 'object' || fs === null || !('readFile' in fs)) {
    return null;
  }

  const readFile = fs.readFile;
  if (typeof readFile !== 'function') {
    return null;
  }

  return {
    readFile(path, callback) {
      readFile(path, callback);
    },
  } satisfies RspackInputFileSystem;
}

const resolverCache = new WeakMap<RspackCompilerLike, ResolverFactory>();

function normalizeRspackResolveOptions(
  resolveOptions: RspackBundlerResolveOptions
): RspackResolveOptions {
  const { tsConfig, ...rest } = resolveOptions;

  if (rest.tsconfig || !tsConfig) {
    return rest;
  }

  return {
    ...rest,
    tsconfig:
      typeof tsConfig === 'string' ? { configFile: tsConfig } : tsConfig,
  };
}

function createRspackResolveStrategy(
  ctx: BundlerResolveContext
): ResolveStrategy {
  return async ({ specifier, importer }) => {
    const native = ctx.getNativeBuildContext?.();
    if (native?.framework !== 'rspack') return null;

    const compiler = native.compiler as RspackCompilerLike | undefined;
    if (!compiler?.options?.resolve) return null;

    const cached = resolverCache.get(compiler);
    const normalizedResolveOptions = normalizeRspackResolveOptions(
      compiler.options.resolve
    );
    const resolver = cached ?? new ResolverFactory(normalizedResolveOptions);
    if (!cached) {
      resolverCache.set(compiler, resolver);
    }

    try {
      const resolved = await resolver.async(path.dirname(importer), specifier);
      if (resolved && typeof resolved.path === 'string') {
        return resolved.path;
      }
    } catch {
      // fall through
    }

    return null;
  };
}

function createRspackLoadStrategy(ctx: BundlerResolveContext): LoadStrategy {
  return async ({ id }) => {
    const loaderContext = ctx.getNativeBuildContext?.()?.loaderContext;
    const loadModule =
      typeof loaderContext === 'object' &&
      loaderContext !== null &&
      'loadModule' in loaderContext &&
      typeof loaderContext.loadModule === 'function'
        ? loaderContext.loadModule
        : null;
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

function createRspackInputFileSystemLoadStrategy(
  ctx: BundlerResolveContext
): LoadStrategy {
  return async ({ id }) => {
    const loaderContext = ctx.getNativeBuildContext?.()?.loaderContext;
    const inputFileSystem = getRspackInputFileSystem(loaderContext);
    if (typeof inputFileSystem?.readFile !== 'function') {
      return null;
    }

    return new Promise<string | null>((resolve) => {
      inputFileSystem.readFile?.(id, (error, source) => {
        if (error || source === null || source === undefined) {
          resolve(null);
          return;
        }

        resolve(
          Buffer.isBuffer(source) ? source.toString('utf8') : String(source)
        );
      });
    });
  };
}

export function createRspackModuleAccess(
  ctx: BundlerResolveContext,
  userAccess: QraftModuleAccessOptions = {}
): QraftModuleAccess {
  return {
    resolve: createResolverChain([
      createRspackResolveStrategy(ctx),
      createUserResolverStrategy(userAccess.resolve),
    ]),
    load: createSourceLoaderChain([
      createRspackLoadStrategy(ctx),
      createUserSourceLoaderStrategy(userAccess.load),
      createRspackInputFileSystemLoadStrategy(ctx),
    ]),
  };
}

export function createRspackResolver(
  ctx: BundlerResolveContext,
  userResolve?: QraftResolver
): QraftResolver {
  return createRspackModuleAccess(ctx, { resolve: userResolve }).resolve;
}
