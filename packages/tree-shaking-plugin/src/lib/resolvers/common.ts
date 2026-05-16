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

export type QraftModuleAccessTraceStage = {
  name: QraftModuleAccessStrategyName;
  result: 'hit' | 'miss' | 'error';
  value?: string;
  message?: string;
};

export type QraftModuleAccessTraceEntry =
  | {
      kind: 'resolve';
      target: string;
      importer: string;
      stages: QraftModuleAccessTraceStage[];
    }
  | {
      kind: 'load';
      target: string;
      stages: QraftModuleAccessTraceStage[];
    };

type QraftModuleAccessTraceState = {
  entries: Array<{ sequence: number; entry: QraftModuleAccessTraceEntry }>;
  nextSequence: number;
};

const qraftModuleAccessStrategyMetadata = Symbol(
  'qraft.moduleAccessStrategyMetadata'
);
const qraftModuleAccessTrace = Symbol('qraft.moduleAccessTrace');

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
  const trace = createModuleAccessTraceState();
  const recordTrace = (entry: QraftModuleAccessTraceEntry) =>
    recordModuleAccessTrace(trace, entry);
  const access = {
    resolve: createResolverChain(resolveStrategies, recordTrace),
    load: createSourceLoaderChain(loadStrategies, recordTrace),
  };

  Object.defineProperty(access, qraftModuleAccessStrategyMetadata, {
    value: {
      resolve: resolveStrategies.map((strategy) => strategy.name),
      load: loadStrategies.map((strategy) => strategy.name),
    } satisfies QraftModuleAccessStrategyMetadata,
  });
  Object.defineProperty(access, qraftModuleAccessTrace, {
    value: trace,
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

export function getQraftModuleAccessTrace(
  access: QraftModuleAccess
): QraftModuleAccessTraceEntry[] {
  const trace = getQraftModuleAccessTraceState(access);
  if (!trace) return [];

  return trace.entries.map(({ entry }) => cloneModuleAccessTraceEntry(entry));
}

export function getQraftModuleAccessTraceSnapshot(
  access: QraftModuleAccess
): number {
  return getQraftModuleAccessTraceState(access)?.nextSequence ?? 0;
}

export function getQraftModuleAccessTraceSince(
  access: QraftModuleAccess,
  snapshot: number
): QraftModuleAccessTraceEntry[] {
  const trace = getQraftModuleAccessTraceState(access);
  if (!trace) return [];

  return trace.entries
    .filter(({ sequence }) => sequence >= snapshot)
    .map(({ entry }) => cloneModuleAccessTraceEntry(entry));
}

export function createTraceableQraftModuleAccess(
  access: QraftModuleAccess
): QraftModuleAccess {
  if (qraftModuleAccessTrace in access) return access;

  const trace = createModuleAccessTraceState();
  const recordTrace = (entry: QraftModuleAccessTraceEntry) =>
    recordModuleAccessTrace(trace, entry);
  const traceableAccess = {
    async resolve(specifier: string, importer: string) {
      try {
        const resolved = await access.resolve(specifier, importer);
        recordTrace({
          kind: 'resolve',
          target: specifier,
          importer,
          stages: [
            resolved
              ? { name: 'user', result: 'hit', value: resolved }
              : { name: 'user', result: 'miss' },
          ],
        });
        return resolved;
      } catch (error) {
        recordTrace({
          kind: 'resolve',
          target: specifier,
          importer,
          stages: [
            {
              name: 'user',
              result: 'error',
              message: formatTraceError(error),
            },
          ],
        });
        throw error;
      }
    },
    async load(id: string) {
      try {
        const loaded = await access.load(id);
        recordTrace({
          kind: 'load',
          target: id,
          stages: [
            loaded !== null && loaded !== undefined
              ? { name: 'user', result: 'hit' }
              : { name: 'user', result: 'miss' },
          ],
        });
        return loaded;
      } catch (error) {
        recordTrace({
          kind: 'load',
          target: id,
          stages: [
            {
              name: 'user',
              result: 'error',
              message: formatTraceError(error),
            },
          ],
        });
        throw error;
      }
    },
  } satisfies QraftModuleAccess;

  Object.defineProperty(traceableAccess, qraftModuleAccessTrace, {
    value: trace,
  });

  return traceableAccess;
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
  strategies: ResolveStrategy[],
  onTrace?: (entry: QraftModuleAccessTraceEntry) => void
): QraftResolver {
  const cache = new Map<
    string,
    {
      pending: Promise<string | null>;
      traceEntry?: QraftModuleAccessTraceEntry;
    }
  >();

  return (specifier, importer) => {
    const key = `${specifier}\0${importer}`;
    const cached = cache.get(key);
    if (cached) {
      replayCachedTrace(cached, onTrace);
      return cached.pending;
    }

    const cacheEntry: {
      pending: Promise<string | null>;
      traceEntry?: QraftModuleAccessTraceEntry;
    } = {
      pending: Promise.resolve(null),
    };
    cacheEntry.pending = resolveWithStrategies(
      strategies,
      specifier,
      importer,
      (entry) => {
        cacheEntry.traceEntry = cloneModuleAccessTraceEntry(entry);
        onTrace?.(entry);
      }
    );
    cache.set(key, cacheEntry);
    return cacheEntry.pending;
  };
}

function replayCachedTrace(
  cacheEntry: {
    pending: Promise<string | null>;
    traceEntry?: QraftModuleAccessTraceEntry;
  },
  onTrace?: (entry: QraftModuleAccessTraceEntry) => void
) {
  if (!onTrace) return;
  if (cacheEntry.traceEntry) {
    onTrace(cloneModuleAccessTraceEntry(cacheEntry.traceEntry));
    return;
  }

  void cacheEntry.pending.then(
    () => {
      if (cacheEntry.traceEntry) {
        onTrace(cloneModuleAccessTraceEntry(cacheEntry.traceEntry));
      }
    },
    () => undefined
  );
}

async function resolveWithStrategies(
  strategies: ResolveStrategy[],
  specifier: string,
  importer: string,
  onTrace?: (entry: QraftModuleAccessTraceEntry) => void
): Promise<string | null> {
  const stages: QraftModuleAccessTraceStage[] = [];

  for (const strategy of strategies) {
    try {
      const resolved = await strategy.resolve({ specifier, importer });
      if (resolved) {
        stages.push({
          name: strategy.name,
          result: 'hit',
          value: resolved,
        });
        onTrace?.({
          kind: 'resolve',
          target: specifier,
          importer,
          stages,
        });
        return resolved;
      }
      stages.push({ name: strategy.name, result: 'miss' });
    } catch (error) {
      stages.push({
        name: strategy.name,
        result: 'error',
        message: formatTraceError(error),
      });
      // Try the next strategy.
    }
  }

  onTrace?.({
    kind: 'resolve',
    target: specifier,
    importer,
    stages,
  });
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
  strategies: LoadStrategy[],
  onTrace?: (entry: QraftModuleAccessTraceEntry) => void
): QraftSourceLoader {
  const cache = new Map<
    string,
    {
      pending: Promise<string | null>;
      traceEntry?: QraftModuleAccessTraceEntry;
    }
  >();

  return (id) => {
    const cached = cache.get(id);
    if (cached) {
      replayCachedTrace(cached, onTrace);
      return cached.pending;
    }

    const cacheEntry: {
      pending: Promise<string | null>;
      traceEntry?: QraftModuleAccessTraceEntry;
    } = {
      pending: Promise.resolve(null),
    };
    cacheEntry.pending = loadWithStrategies(strategies, id, (entry) => {
      cacheEntry.traceEntry = cloneModuleAccessTraceEntry(entry);
      onTrace?.(entry);
    }).catch((error) => {
      cache.delete(id);
      throw error;
    });
    cache.set(id, cacheEntry);
    return cacheEntry.pending;
  };
}

async function loadWithStrategies(
  strategies: LoadStrategy[],
  id: string,
  onTrace?: (entry: QraftModuleAccessTraceEntry) => void
): Promise<string | null> {
  const stages: QraftModuleAccessTraceStage[] = [];

  for (const strategy of strategies) {
    try {
      const loaded = await strategy.load({ id });
      if (loaded !== null && loaded !== undefined) {
        stages.push({ name: strategy.name, result: 'hit' });
        onTrace?.({
          kind: 'load',
          target: id,
          stages,
        });
        return loaded;
      }
      stages.push({ name: strategy.name, result: 'miss' });
    } catch (error) {
      stages.push({
        name: strategy.name,
        result: 'error',
        message: formatTraceError(error),
      });
      onTrace?.({
        kind: 'load',
        target: id,
        stages,
      });
      throw error;
    }
  }

  onTrace?.({
    kind: 'load',
    target: id,
    stages,
  });
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

function getQraftModuleAccessTraceState(
  access: QraftModuleAccess
): QraftModuleAccessTraceState | null {
  if (!(qraftModuleAccessTrace in access)) return null;

  const trace = Reflect.get(access, qraftModuleAccessTrace);
  if (!isQraftModuleAccessTraceState(trace)) return null;

  return trace;
}

function createModuleAccessTraceState(): QraftModuleAccessTraceState {
  return {
    entries: [],
    nextSequence: 0,
  };
}

function recordModuleAccessTrace(
  trace: QraftModuleAccessTraceState,
  entry: QraftModuleAccessTraceEntry
) {
  trace.entries.push({
    sequence: trace.nextSequence,
    entry: cloneModuleAccessTraceEntry(entry),
  });
  trace.nextSequence += 1;
  if (trace.entries.length > 50) trace.entries.shift();
}

function cloneModuleAccessTraceEntry(
  entry: QraftModuleAccessTraceEntry
): QraftModuleAccessTraceEntry {
  return {
    ...entry,
    stages: entry.stages.map((stage) => ({ ...stage })),
  };
}

function isQraftModuleAccessTraceState(
  trace: unknown
): trace is QraftModuleAccessTraceState {
  if (typeof trace !== 'object' || trace === null) return false;

  const entries = Reflect.get(trace, 'entries');
  const nextSequence = Reflect.get(trace, 'nextSequence');
  return (
    Array.isArray(entries) &&
    typeof nextSequence === 'number' &&
    entries.every(isQraftModuleAccessTraceRecord)
  );
}

function isQraftModuleAccessTraceRecord(record: unknown) {
  if (typeof record !== 'object' || record === null) return false;

  const sequence = Reflect.get(record, 'sequence');
  const entry = Reflect.get(record, 'entry');
  return typeof sequence === 'number' && isQraftModuleAccessTraceEntry(entry);
}

function isQraftModuleAccessTraceEntry(
  entry: unknown
): entry is QraftModuleAccessTraceEntry {
  if (typeof entry !== 'object' || entry === null) return false;

  const kind = Reflect.get(entry, 'kind');
  const target = Reflect.get(entry, 'target');
  const stages = Reflect.get(entry, 'stages');
  if (kind !== 'resolve' && kind !== 'load') return false;
  if (typeof target !== 'string') return false;
  if (kind === 'resolve' && typeof Reflect.get(entry, 'importer') !== 'string')
    return false;
  return Array.isArray(stages) && stages.every(isQraftModuleAccessTraceStage);
}

function isQraftModuleAccessTraceStage(
  stage: unknown
): stage is QraftModuleAccessTraceStage {
  if (typeof stage !== 'object' || stage === null) return false;

  const name = Reflect.get(stage, 'name');
  const result = Reflect.get(stage, 'result');
  const value = Reflect.get(stage, 'value');
  const message = Reflect.get(stage, 'message');
  return (
    isQraftModuleAccessStrategyName(name) &&
    (result === 'hit' || result === 'miss' || result === 'error') &&
    (value === undefined || typeof value === 'string') &&
    (message === undefined || typeof message === 'string')
  );
}

function formatTraceError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : String(error);
  return message.length > 120 ? `${message.slice(0, 117)}...` : message;
}
