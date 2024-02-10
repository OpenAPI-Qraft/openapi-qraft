import { createRecursiveProxy } from './createRecursiveProxy.js';

/**
 * Create proxy for decorating procedures
 */
export function createCallbackProxyDecoration<
  Functions extends string[] | Readonly<string[]>,
>(
  functions: Functions,
  callback: (
    path: string[],
    functionName: Functions[number],
    args: unknown[]
  ) => unknown
) {
  return createRecursiveProxy((opts) => {
    const path = opts.path.slice(0, -1);

    // The last arg is for instance `.useMutation` or `.useQuery()`
    const functionName = opts.path[opts.path.length - 1];

    if (functionName === '_def') {
      return {
        path: path,
      };
    }

    if (!functions.includes(functionName)) {
      throw new Error(`Function ${functionName} is not supported`);
    }

    return callback(path, functionName, opts.args);
  }, []);
}
