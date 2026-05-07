import fs from 'node:fs/promises';
import path from 'node:path';

export type QraftResolver = (
  specifier: string,
  importer: string
) => Promise<string | null> | string | null;

export type ResolveRequest = {
  specifier: string;
  importer: string;
};

export type ResolveStrategy = (
  request: ResolveRequest
) => Promise<string | null> | string | null;

export type RollupLikeResolve = (
  source: string,
  importer?: string,
  options?: { skipSelf?: boolean }
) => Promise<{ id: string; external?: boolean } | null | undefined>;

export type EsbuildLikeBuild = {
  resolve: (
    path: string,
    options?: { resolveDir?: string; kind?: string; importer?: string }
  ) => Promise<{ path: string; errors?: unknown[] }>;
};

export type BundlerNativeBuildContext = {
  framework?: string;
  build?: EsbuildLikeBuild;
  compiler?: unknown;
  compilation?: unknown;
  loaderContext?: unknown;
  inputSourceMap?: unknown;
};

export type BundlerResolveContext = {
  resolve?: RollupLikeResolve;
  getNativeBuildContext?: () => BundlerNativeBuildContext | null;
};

export function createResolverChain(
  strategies: ResolveStrategy[]
): QraftResolver {
  const cache = new Map<string, Promise<string | null>>();

  return (specifier, importer) => {
    const key = `${specifier}\0${importer}`;
    let pending = cache.get(key);
    if (!pending) {
      pending = resolveWithStrategies(strategies, specifier, importer);
      cache.set(key, pending);
    }
    return pending;
  };
}

async function resolveWithStrategies(
  strategies: ResolveStrategy[],
  specifier: string,
  importer: string
): Promise<string | null> {
  for (const strategy of strategies) {
    try {
      const resolved = await strategy({ specifier, importer });
      if (resolved) return resolved;
    } catch {
      // Try the next strategy.
    }
  }

  return null;
}

export function createUserResolverStrategy(
  userResolve?: QraftResolver
): ResolveStrategy {
  return async ({ specifier, importer }) => {
    if (!userResolve) return null;
    const resolved = await userResolve(specifier, importer);
    return resolved || null;
  };
}

export async function realpathSafe(filePath: string): Promise<string> {
  try {
    return await fs.realpath(filePath);
  } catch {
    return path.normalize(filePath);
  }
}
