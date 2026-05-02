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

export const resolveLocalModuleStrategy: ResolveStrategy = async ({
  importer,
  specifier,
}) => resolveLocalModule(importer, specifier);

export async function resolveLocalModule(
  importerId: string,
  importPath: string
): Promise<string | null> {
  return resolveLocalModuleFromBase(path.dirname(importerId), importPath);
}

export async function resolveLocalModuleFromBase(
  baseDir: string,
  importPath: string
): Promise<string | null> {
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) return null;

  const base = path.resolve(baseDir, importPath);
  const candidateBases = new Set([base]);
  const extension = path.extname(importPath);
  if (
    extension === '.js' ||
    extension === '.jsx' ||
    extension === '.mjs' ||
    extension === '.cjs'
  ) {
    candidateBases.add(base.slice(0, -extension.length));
  }

  const candidates = [...candidateBases].flatMap((candidateBase) => [
    candidateBase,
    `${candidateBase}.ts`,
    `${candidateBase}.tsx`,
    `${candidateBase}.js`,
    `${candidateBase}.jsx`,
    `${candidateBase}.mts`,
    `${candidateBase}.cts`,
    path.join(candidateBase, 'index.ts'),
    path.join(candidateBase, 'index.tsx'),
    path.join(candidateBase, 'index.js'),
    path.join(candidateBase, 'index.jsx'),
    path.join(candidateBase, 'index.mts'),
    path.join(candidateBase, 'index.cts'),
  ]);

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

export async function realpathSafe(filePath: string): Promise<string> {
  try {
    return await fs.realpath(filePath);
  } catch {
    return path.normalize(filePath);
  }
}
