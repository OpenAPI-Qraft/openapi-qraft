/**
 * Shallow partial 'parameters'.
 * @example
 * ```ts
 * {query?: {page: number, nested: {still: 'not_partial'}}}
 * // =>
 * {query?: {page?: number, nested?: {still: 'not_partial'}}}
 * ```
 */
export type PartialParameters<T> = T extends object
  ? { [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K] }
  : T;
