import type { AreAllOptional } from '@openapi-qraft/tanstack-query-react-types';
import type { DeepReadonly } from './DeepReadonly.js';

interface QueryFnBaseUrlOptions<
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal,
> {
  /**
   * Base URL to use for the request
   * @example 'https://api.example.com'
   */
  baseUrl?: string;
  meta?: TMeta;
  signal?: TSignal;
}

export type ServiceOperationMutationFnOptions<
  TBody,
  TParams,
  TMeta extends Record<string, any>,
  TSignal extends AbortSignal = AbortSignal,
> =
  AreAllOptional<TBody> extends true
    ? AreAllOptional<TParams> extends true
      ?
          | void // todo::try to move void to arguments
          | ({
              parameters?: DeepReadonly<TParams>;
              body?: TBody;
            } & QueryFnBaseUrlOptions<TMeta, TSignal>)
      : {
          parameters: DeepReadonly<TParams>;
          body?: TBody;
        } & QueryFnBaseUrlOptions<TMeta, TSignal>
    : AreAllOptional<TParams> extends true
      ? {
          parameters?: DeepReadonly<TParams>;
          body: TBody;
        } & QueryFnBaseUrlOptions<TMeta, TSignal>
      : {
          parameters: DeepReadonly<TParams>;
          body: TBody;
        } & QueryFnBaseUrlOptions<TMeta, TSignal>;
