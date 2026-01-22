type ArgsCache = WeakMap<WeakKey, ArgsCacheItem>;
type ArgsCacheItem =
  | {
      result: unknown;
      args?: ArgsCache;
    }
  | { args?: ArgsCache; result?: never };

type MemoCache = WeakMap<WeakKey, ArgsCache>;

/**
 * Memoizes function call results using object arguments as a composite key.
 * Uses nested WeakMaps to allow garbage collection when args are dereferenced.
 * Supports calls with different argument counts (e.g., optional arguments).
 */
export function memoizeFunctionCall<
  Factory extends (...args: Args) => FactoryResult,
  const Args extends object[],
  FactoryResult,
>(memoCache: MemoCache, factory: Factory, ...args: Args): FactoryResult {
  let cache: ArgsCache | undefined = memoCache.get(factory);
  if (!cache) {
    cache = new WeakMap();
    memoCache.set(factory, cache);
  }

  let currentItem: ArgsCacheItem | undefined;

  for (const arg of args) {
    let item: ArgsCacheItem | undefined = cache.get(arg);
    if (!item) {
      item = {};
      cache!.set(arg, item);
    }
    currentItem = item;

    if (!item.args) {
      item.args = new WeakMap();
    }
    cache = item.args;
  }

  if (!currentItem) {
    throw new Error('memoizeFunctionCall requires at least one argument');
  }

  if ('result' in currentItem) {
    return currentItem.result as ReturnType<Factory>;
  }

  const result = factory(...args) as ReturnType<Factory>;
  (currentItem satisfies ArgsCacheItem as ArgsCacheItem).result = result;

  return result;
}
