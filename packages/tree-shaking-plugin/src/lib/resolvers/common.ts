export { stripQueryAndHash } from '../transform/path-rendering.js';

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

export type QraftModuleAccessStrategyName =
  | 'native'
  | 'user'
  | 'adapter-fallback';

export type QraftModuleAccessStrategyMetadata = {
  resolve: QraftModuleAccessStrategyName[];
  load: QraftModuleAccessStrategyName[];
};

const qraftModuleAccessStrategyMetadata = Symbol(
  'qraft.moduleAccessStrategyMetadata'
);

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

export type ResolveStrategy = {
  name: QraftModuleAccessStrategyName;
  resolve: (request: ResolveRequest) => Promise<string | null> | string | null;
};

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

export type LoadStrategy = {
  name: QraftModuleAccessStrategyName;
  load: (request: LoadRequest) => Promise<string | null> | string | null;
};

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

export function createQraftModuleAccess(
  resolveStrategies: ResolveStrategy[],
  loadStrategies: LoadStrategy[]
): QraftModuleAccess {
  const access = {
    resolve: createResolverChain(resolveStrategies),
    load: createSourceLoaderChain(loadStrategies),
  };

  Object.defineProperty(access, qraftModuleAccessStrategyMetadata, {
    value: {
      resolve: resolveStrategies.map((strategy) => strategy.name),
      load: loadStrategies.map((strategy) => strategy.name),
    } satisfies QraftModuleAccessStrategyMetadata,
  });

  return access;
}

export function getQraftModuleAccessStrategyMetadata(
  access: QraftModuleAccess
): QraftModuleAccessStrategyMetadata | null {
  if (!(qraftModuleAccessStrategyMetadata in access)) return null;

  const metadata = Reflect.get(access, qraftModuleAccessStrategyMetadata);
  if (!isQraftModuleAccessStrategyMetadata(metadata)) return null;

  return metadata;
}

function isQraftModuleAccessStrategyMetadata(
  metadata: unknown
): metadata is QraftModuleAccessStrategyMetadata {
  if (typeof metadata !== 'object' || metadata === null) return false;

  const resolve = Reflect.get(metadata, 'resolve');
  const load = Reflect.get(metadata, 'load');
  return (
    Array.isArray(resolve) &&
    resolve.every(isQraftModuleAccessStrategyName) &&
    Array.isArray(load) &&
    load.every(isQraftModuleAccessStrategyName)
  );
}

function isQraftModuleAccessStrategyName(
  name: unknown
): name is QraftModuleAccessStrategyName {
  return name === 'native' || name === 'user' || name === 'adapter-fallback';
}

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
      const resolved = await strategy.resolve({ specifier, importer });
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
  return {
    name: 'user',
    async resolve({ specifier, importer }) {
      if (!userResolve) return null;
      const resolved = await userResolve(specifier, importer);
      return resolved || null;
    },
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
    const loaded = await strategy.load({ id });
    if (loaded !== null && loaded !== undefined) return loaded;
  }

  return null;
}

export function createUserSourceLoaderStrategy(
  userLoad?: QraftSourceLoader
): LoadStrategy {
  return {
    name: 'user',
    async load({ id }) {
      if (!userLoad) return null;
      const loaded = await userLoad(id);
      return loaded ?? null;
    },
  };
}
