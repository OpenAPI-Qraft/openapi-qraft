export type RequestClient = <T>(
  schema: RequestClientSchema,
  options: RequestClientOptions
) => Promise<T>;

export type RequestClientSchema = {
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

export type RequestClientOptions = {
  body?: BodyInit | Record<string, unknown> | null;
  parameters?: RequestClientParams;
  signal?: AbortSignal;
  meta?: Record<string, unknown>;
};

export type RequestClientParams = {
  header?: Record<string, any>;
  path?: Record<string, any>;
  query?: Record<string, any>;
  cookie?: Record<string, any>;
};
