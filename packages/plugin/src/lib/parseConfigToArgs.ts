/**
 * Converts a parsed YAML configuration into command line arguments
 * @param config The parsed YAML configuration object
 * @returns Array of command line arguments
 */
export function parseConfigToArgs(config: Record<string, unknown>): string[] {
  const args: string[] = [];

  const isPrimitive = (val: any): val is string | number | boolean =>
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'boolean';

  function flattenMapping(node: any, prefixKeys: string[]): string[] {
    const results: string[] = [];

    if (isPrimitive(node)) {
      if (typeof node === 'boolean') {
        if (node) {
          results.push(prefixKeys.join(':'));
        }
      } else {
        results.push(`${prefixKeys.join(':')}:${node.toString()}`);
      }
      return results;
    }

    if (Array.isArray(node)) {
      if (node.every((el) => isPrimitive(el))) {
        const primitives = node.filter(
          (el) => el !== null && el !== undefined
        ) as (string | number | boolean)[];
        const joined = primitives.map((el) => el.toString()).join(',');
        if (joined) {
          results.push(`${prefixKeys.join(':')}:${joined}`);
        }
        return results;
      }

      for (const el of node) {
        if (el == null) {
          continue;
        }
        results.push(...flattenMapping(el, prefixKeys));
      }
      return results;
    }

    if (typeof node === 'object' && node !== null) {
      for (const [key, value] of Object.entries(node)) {
        results.push(...flattenMapping(value, [...prefixKeys, key]));
      }
      return results;
    }

    return results;
  }

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' || typeof value === 'number') {
      args.push(`--${key}`, value.toString());
    } else if (typeof value === 'boolean') {
      if (value) {
        args.push(`--${key}`);
      }
    } else if (value == null) {
      continue;
    } else if (Array.isArray(value)) {
      if (value.every((el) => isPrimitive(el))) {
        const primitives = value.filter(
          (el) => el !== null && el !== undefined
        ) as (string | number | boolean)[];
        args.push(`--${key}`, ...primitives.map((el) => el.toString()));
      } else {
        for (const el of value) {
          if (el == null) {
            continue;
          }
          if (typeof el === 'object') {
            const mappingPaths = flattenMapping(el, []);
            if (mappingPaths.length) {
              args.push(`--${key}`, ...mappingPaths);
            }
          } else if (isPrimitive(el)) {
            args.push(`--${key}`, el.toString());
          }
        }
      }
    } else if (typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(
        value as Record<string, unknown>
      )) {
        if (typeof childValue === 'string' || typeof childValue === 'number') {
          args.push(`--${key}`, childKey, childValue.toString());
        } else if (typeof childValue === 'boolean') {
          if (childValue) {
            args.push(`--${key}`, childKey);
          }
        } else if (childValue == null) {
          continue;
        } else if (Array.isArray(childValue)) {
          if (childValue.every((el) => isPrimitive(el))) {
            const primitives = childValue.filter(
              (el) => el !== null && el !== undefined
            ) as (string | number | boolean)[];
            const joined = primitives.map((el) => el.toString()).join(',');
            args.push(`--${key}`, childKey, joined);
          } else {
            for (const el of childValue) {
              if (el == null) {
                continue;
              }
              if (typeof el === 'object') {
                const mappingPaths = flattenMapping(el, [childKey]);
                if (mappingPaths.length) {
                  args.push(`--${key}`, ...mappingPaths);
                }
              } else if (isPrimitive(el)) {
                args.push(`--${key}`, childKey, el.toString());
              }
            }
          }
        } else if (typeof childValue === 'object') {
          const mappingPaths = flattenMapping(childValue, []);
          if (mappingPaths.length) {
            args.push(`--${key}`, childKey, ...mappingPaths);
          }
        }
      }
    }
  }

  return args;
}
