import type { AreAllOptional } from '@openapi-qraft/tanstack-query-react-types';
import type { DeepReadonly } from './DeepReadonly.js';

interface QueryFnBaseUrlOptions {
  /**
   * Base URL to use for the request
   * @example 'https://api.example.com'
   */
  baseUrl?: string;
}

export type ServiceOperationMutationFnOptions<TBody, TParams> =
  AreAllOptional<TBody> extends true
    ? AreAllOptional<TParams> extends true
      ?
          | void // todo::try to move void to arguments
          | ({
              parameters?: DeepReadonly<TParams>;
              body?: TBody;
            } & QueryFnBaseUrlOptions)
      : {
          parameters: DeepReadonly<TParams>;
          body?: TBody;
        } & QueryFnBaseUrlOptions
    : AreAllOptional<TParams> extends true
      ? {
          parameters?: DeepReadonly<TParams>;
          body: TBody;
        } & QueryFnBaseUrlOptions
      : {
          parameters: DeepReadonly<TParams>;
          body: TBody;
        } & QueryFnBaseUrlOptions;
