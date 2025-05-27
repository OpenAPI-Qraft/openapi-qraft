import { type OpenAPI3 } from 'openapi-typescript';
import { createServicePathMatch } from './createServicePathMatch.js';

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
  schema: OpenAPI3,
  servicesGlob: string[]
): OpenAPI3 => {
  if (!servicesGlob.length) return schema;

  const isPathMatch = createServicePathMatch(servicesGlob);
  const paths: typeof schema.paths = {};

  for (const path in schema.paths) {
    if (!Object.prototype.hasOwnProperty.call(schema.paths, path)) continue;
    if (!isPathMatch(path)) continue;
    paths[path] = schema.paths[path];
  }

  return { ...schema, paths };
};
