export type RequestClient = <T>(
  schema: RequestSchema,
  info: RequestInfo
) => Promise<T>;

export type RequestSchema = {
  url: string;
  method:
    | 'get'
    | 'put'
    | 'post'
    | 'patch'
    | 'delete'
    | 'options'
    | 'head'
    | 'trace';
  mediaType?: string;
};

export type RequestInfo = {
  parameters?: RequestInfoParameters;
  body?: BodyInit | Record<string, unknown> | null;
  signal?: AbortSignal;
  meta?: Record<string, unknown>;
};

export type RequestInfoParameters = {
  header?: Record<string, any>;
  path?: Record<string, any>;
  query?: Record<string, any>;
  cookie?: Record<string, any>;
};
