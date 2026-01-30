import { ServiceOperation } from './open-api/OpenAPIService.js';
import { splitCommaSeparatedGlobs } from './splitCommaSeparatedGlobs.js';

/**
 *
 * @param operationFullGlobs - Example: `post /**`, `/**,/foo/bar`
 * @returns `pathGlobs`, and `methods` as an array if methods are specified, or `undefined`
 * @example
 * ```ts
 * parseOperationGlobs('post /**');
 * parseOperationGlobs('patch,put /foo/bar');
 * ```
 */
export const parseOperationGlobs = (operationFullGlobs: string) => {
  const methodsGlobsRaw = operationFullGlobs.slice(
    0,
    Math.max(0, operationFullGlobs.indexOf('/'))
  );

  const methods = methodsGlobsRaw
    .split(',')
    .map((method) => method.trim().toLowerCase())
    .filter(isSupportedOperationMethod);

  methods.sort(sortSupportedMethods);

  return {
    methods: methods.length ? methods : undefined,
    pathGlobs: splitCommaSeparatedGlobs(
      operationFullGlobs.slice(methodsGlobsRaw.length)
    ).join(','),
  };
};

const supportedOperationMethods = Object.values({
  get: 'get',
  post: 'post',
  put: 'put',
  patch: 'patch',
  delete: 'delete',
  options: 'options',
  head: 'head',
  trace: 'trace',
} satisfies { [Method in OperationGlobMethods]: Method });

const isSupportedOperationMethod = (
  operationRaw: string
): operationRaw is OperationGlobMethods =>
  supportedOperationMethods.includes(operationRaw as OperationGlobMethods);

const sortSupportedMethods = (a: string, b: string) =>
  supportedOperationMethods.indexOf(a as OperationGlobMethods) -
  supportedOperationMethods.indexOf(b as OperationGlobMethods);

export type OperationGlobMethods = ServiceOperation['method'];
