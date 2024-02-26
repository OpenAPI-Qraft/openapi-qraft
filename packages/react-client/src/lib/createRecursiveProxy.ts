type ProxyApplyCallback = (path: string[], args: unknown[]) => unknown;
/**
 * @internal
 * If returns `undefined | null`, the proxy will continue to create a new proxy for the next key.
 */
type ProxyGetCallback = (path: string[], key: string) => unknown | undefined;

export function createRecursiveProxy(
  getCallback: ProxyGetCallback,
  applyCallback: ProxyApplyCallback,
  path: string[]
): unknown {
  return new Proxy(noop, {
    get(_obj, key) {
      if (typeof key !== 'string' || key === 'then') {
        // special case for if the proxy is accidentally treated
        // like a PromiseLike (like in `Promise.resolve(proxy)`)
        return undefined;
      }

      return (
        getCallback(path, key) ??
        createRecursiveProxy(getCallback, applyCallback, [...path, key])
      );
    },
    apply(_1, _2, args) {
      const functionName = path[path.length - 1];

      const isCall = functionName === 'call';
      const isApply = isCall ? false : functionName === 'apply';

      return applyCallback(
        isApply || isCall ? path.slice(0, -1) : path,
        isApply
          ? args.length >= 2
            ? args[1]
            : []
          : isCall
            ? args.slice(1)
            : args
      );
    },
  });
}

function noop() {
  // noop
}
