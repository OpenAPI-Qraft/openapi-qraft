export type AreAllOptional<T> =
  NonNullable<T> extends never
    ? true
    : {
          [K in keyof T]-?: undefined extends T[K] ? never : K;
        }[keyof T] extends never
      ? true
      : false;
