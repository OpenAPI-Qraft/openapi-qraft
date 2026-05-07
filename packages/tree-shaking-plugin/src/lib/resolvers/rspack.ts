import type { TsconfigOptions } from '@rspack/resolver';
import type {
  BundlerResolveContext,
  QraftResolver,
  ResolveStrategy,
} from './common.js';
import path from 'node:path';
import { ResolverFactory } from '@rspack/resolver';
import { createResolverChain, createUserResolverStrategy } from './common.js';

type RspackResolveOptions = ConstructorParameters<typeof ResolverFactory>[0];

type RspackCompilerLike = {
  options?: {
    resolve?: RspackBundlerResolveOptions;
  };
};

type RspackBundlerResolveOptions = RspackResolveOptions & {
  tsConfig?: string | TsconfigOptions;
};

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

export function createRspackResolver(
  ctx: BundlerResolveContext,
  userResolve?: QraftResolver
): QraftResolver {
  return createResolverChain([
    createRspackResolveStrategy(ctx),
    createUserResolverStrategy(userResolve),
  ]);
}
