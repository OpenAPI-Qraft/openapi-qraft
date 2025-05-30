/**
 * Allows you to override standard type imports by specifying custom paths for them.
 *
 * @example
 * ```ts
 * {
 *   services: {
 *     '@openapi-qraft/tanstack-query-react-types': {
 *       OperationError: '../custom/types/ErrorType.js',
 *       RequestFn: '../custom/types/ApiClient.js',
 *     },
 *     '@openapi-qraft/react': {
 *       Result: '../custom/types/ApiResult.js',
 *     },
 *   },
 *   'create-api-client': {
 *     '@openapi-qraft/react': {
 *       CreateAPIQueryClientOptions:
 *         '../custom/types/CreateAPIQueryClientOptions',
 *     },
 *   },
 * }
 **/
export type OverrideImportType = Record<
  string,
  Record<string, Record<string, string>>
>;
