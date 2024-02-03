export type ApiRequestInit = {
  readonly method:
    | 'get'
    | 'put'
    | 'post'
    | 'delete'
    | 'options'
    | 'head'
    | 'patch';
  readonly url: string;
  readonly parameters?: {
    readonly path?: Record<string, any>;
    readonly cookie?: Record<string, any>;
    readonly header?: Record<string, any>;
    readonly query?: Record<string, any>;
  };
  readonly body?: BodyInit | Record<string, unknown> | null;
  readonly mediaType?: string;
  readonly headers?: HeadersOptions;
} & Omit<RequestInit, 'headers' | 'method' | 'body'>;

// To have definitely typed headers without a conversion to stings
export type HeadersOptions =
  | HeadersInit
  | Record<string, string | number | boolean | null | undefined>;
