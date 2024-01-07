export type ApiRequestOptions = {
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
  readonly body?: any;
  readonly mediaType?: string;
  readonly responseHeader?: string;
  readonly errors?: number[];
  readonly signal?: AbortSignal;
};
