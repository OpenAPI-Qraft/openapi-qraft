export type ServiceOperationBaseQueryKey<
  S extends { url: string; method: string },
  Infinite extends boolean,
  T,
> = [S & { infinite: Infinite }, T];

export type ServiceOperationQueryKey<
  S extends { url: string; method: string },
  T,
> = ServiceOperationBaseQueryKey<S, false, T>;

export type ServiceOperationInfiniteQueryKey<
  S extends { url: string; method: string },
  T,
> = ServiceOperationBaseQueryKey<S, true, T>;

export type ServiceOperationMutationKey<
  S extends Record<'url' | 'method', string>,
  T extends unknown,
> = NonNullable<T> extends never ? [S] : [S, T];
