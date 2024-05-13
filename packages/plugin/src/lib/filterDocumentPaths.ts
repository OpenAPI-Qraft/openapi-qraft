import micromatch from 'micromatch';

import type { OpenAPISchemaType } from './open-api/OpenAPISchemaType.js';

/**
 * Filter the schema to only include paths that match the servicesGlob
 * @param schema OpenAPI schema
 * @param servicesGlob Glob pattern to match services. E.g.: `['**']`
 *
 * @example
 * ```ts
 * filterDocumentPaths(schema, ['/user/**', '/post/**', '!/user/internal'])
 * ```
 */
export const filterDocumentPaths = (
  schema: OpenAPISchemaType,
  servicesGlob: string[] | undefined
) => {
  if (!servicesGlob) return schema;

  const isPathMatch = createServicePathMatch(servicesGlob);
  const paths: typeof schema.paths = {};

  for (const path in schema.paths) {
    if (!Object.prototype.hasOwnProperty.call(schema.paths, path)) continue;
    if (!isPathMatch(path)) continue;
    paths[path] = schema.paths[path];
  }

  return { ...schema, paths };
};

/**
 * Create a function to match service paths
 * @param servicesGlob
 */
export const createServicePathMatch = (servicesGlob: string[]) => {
  const servicePathGlobs = servicesGlob.reduce<
    Record<'match' | 'ignore', string[]>
  >(
    (acc, glob) => {
      glob.startsWith('!')
        ? acc.ignore.push(glob.slice(1))
        : acc.match.push(glob);
      return acc;
    },
    {
      match: [],
      ignore: [],
    }
  );

  return function isServicePatchMatch(path: string) {
    return micromatch.isMatch(path, servicePathGlobs.match, {
      ignore: servicePathGlobs.ignore,
    });
  };
};
