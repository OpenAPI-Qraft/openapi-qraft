type ProxyCallback = (opts: { path: string[]; args: unknown[] }) => unknown;

export function createRecursiveProxy(callback: ProxyCallback, path: string[]) {
  const proxy: unknown = new Proxy(noop, {
    get(_obj, key) {
      if (typeof key !== 'string' || key === 'then') {
        // special case for if the proxy is accidentally treated
        // like a PromiseLike (like in `Promise.resolve(proxy)`)
        return undefined;
      }
      return createRecursiveProxy(callback, [...path, key]);
    },
    apply(_1, _2, args) {
      const isApply = path[path.length - 1] === 'apply';
      return callback({
        args: isApply ? (args.length >= 2 ? args[1] : []) : args,
        path: isApply ? path.slice(0, -1) : path,
      });
    },
  });

  return proxy;
}

function noop() {
  // noop
}
