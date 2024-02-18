/**
 * Merges objects with provided depth
 * @param depth
 * @param args
 */
export function shelfMerge<T>(depth = 2, ...args: T[]): T {
  return args.reduce((acc, arg) => {
    if (!arg || typeof arg !== 'object') return acc;

    Object.entries(arg).forEach(([key, value]) => {
      if (typeof value !== 'object') {
        acc[key as never] = value as never;
        return;
      }

      if (Array.isArray(value)) {
        acc[key as never] = value as never;
        return;
      }

      if (depth > 1) {
        acc[key as never] = shelfMerge(
          depth - 1,
          acc[key as never],
          value
        ) as never;
        return;
      }

      acc[key as never] = value as never;
    });

    return acc;
  }, {} as T);
}
