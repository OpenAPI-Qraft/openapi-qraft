export type QraftResolver = (
  specifier: string,
  importer: string
) => Promise<string | null> | string | null;

export type QraftSourceLoader = (
  resolvedId: string
) => Promise<string | null> | string | null;

export type QraftModuleAccess = {
  resolve: QraftResolver;
  load: QraftSourceLoader;
};

export type QraftModuleAccessOptions = {
  resolve?: QraftResolver;
  load?: QraftSourceLoader;
};

export type QraftModuleAccessFactory<TRuntimeContext = unknown> = (
  ctx: TRuntimeContext,
  userAccess?: QraftModuleAccessOptions
) => QraftModuleAccess;

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

export type RollupLikeFs = {
  readFile?: (
    path: string,
    encoding: 'utf8'
  ) => Promise<string | Uint8Array> | string | Uint8Array;
};

export type LoadRequest = {
  id: string;
};

export type LoadStrategy = (
  request: LoadRequest
) => Promise<string | null> | string | null;

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
  fs?: RollupLikeFs;
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

export function createSourceLoaderChain(
  strategies: LoadStrategy[]
): QraftSourceLoader {
  const cache = new Map<string, Promise<string | null>>();

  return (id) => {
    let pending = cache.get(id);
    if (!pending) {
      pending = loadWithStrategies(strategies, id).catch((error) => {
        cache.delete(id);
        throw error;
      });
      cache.set(id, pending);
    }
    return pending;
  };
}

async function loadWithStrategies(
  strategies: LoadStrategy[],
  id: string
): Promise<string | null> {
  for (const strategy of strategies) {
    const loaded = await strategy({ id });
    if (loaded !== null && loaded !== undefined) return loaded;
  }

  return null;
}

export function createUserSourceLoaderStrategy(
  userLoad?: QraftSourceLoader
): LoadStrategy {
  return async ({ id }) => {
    if (!userLoad) return null;
    const loaded = await userLoad(id);
    return loaded ?? null;
  };
}
