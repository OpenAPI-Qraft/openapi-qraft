/**
 * @deprecated Internal utility no longer used by Qraft; kept for backwards compatibility.
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
