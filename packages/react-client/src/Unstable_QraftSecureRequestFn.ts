'use client';

import { createElement, Fragment, ReactNode, useEffect, useMemo } from 'react';

import {
  QueryClient,
  type QueryFunctionContext,
  type QueryKey,
  useQueries,
} from '@tanstack/react-query';

import { jwtDecode } from './lib/jwt-decode/index.js';
import type {
  OperationSchema,
  RequestFnInfo,
  RequestFnOptions,
} from './lib/requestFn.js';

interface QraftSecureRequestFnBaseProps {
  requestFn<T>(
    schema: OperationSchema,
    requestInfo: RequestFnInfo,
    options?: RequestFnOptions
  ): Promise<T>;
  securitySchemes: SecuritySchemeHandlers<string>;
}

type RequestFn = QraftSecureRequestFnBaseProps['requestFn'];

export interface QraftSecureRequestFnProps
  extends QraftSecureRequestFnBaseProps {
  children(
    secureRequestFn: QraftSecureRequestFnBaseProps['requestFn']
  ): ReactNode;
  queryClient?: QueryClient;
}

export function QraftSecureRequestFn({
  children,
  requestFn,
  securitySchemes,
  queryClient: inQueryClient,
}: QraftSecureRequestFnProps) {
  const queryClient = useMemo(
    () =>
      inQueryClient ??
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 300_000,
            gcTime: 300_000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
          },
        },
      }),
    [inQueryClient]
  );

  useEffect(() => {
    queryClient.mount();
    return () => {
      return void queryClient.unmount();
    };
  }, [queryClient]);

  const secureRequestFn = useSecuritySchemeAuth({
    securitySchemes,
    requestFn,
    queryClient,
  });

  return createElement(Fragment, {
    children: children(secureRequestFn),
  });
}

export const useSecuritySchemeAuth = ({
  securitySchemes,
  requestFn,
  queryClient,
}: QraftSecureRequestFnBaseProps & {
  queryClient: QueryClient;
}): RequestFn => {
  useQueries(
    {
      queries: Object.entries(securitySchemes).map(([securitySchemeName]) => {
        const queryKey: QueryKey = [securitySchemeName];
        return {
          enabled: Boolean(queryClient.getQueryData(queryKey)),
          queryKey: queryKey as never,
          queryFn: ({
            signal,
          }: QueryFunctionContext<[keyof typeof securitySchemes]>) => {
            const securitySchemeHandler = securitySchemes[securitySchemeName];
            return securitySchemeHandler({ signal, isRefreshing: true });
          },
        };
      }),
    },
    queryClient
  );

  return useMemo(
    () => createSecureRequestFn(securitySchemes, requestFn, queryClient),
    [securitySchemes, requestFn, queryClient]
  );
};

/**
 * Create a secure `requestFn` that manages security schemes.
 * It will automatically fetch and refresh tokens when needed
 * using QueryClient and the provided security schemes.
 *
 * @param securitySchemes OpenAPI security schemes.
 * @param requestFn Qraft `requestFn`
 * @param queryClient QueryClient instance.
 */
export function createSecureRequestFn(
  securitySchemes: SecuritySchemeHandlers<string>,
  requestFn: RequestFn,
  queryClient: QueryClient
): RequestFn {
  return async function secureRequestFn(
    schema: OperationSchema,
    requestInfo: RequestFnInfo,
    options?: RequestFnOptions
  ) {
    const availableSecuritySchemes = Object.keys(securitySchemes) as Array<
      keyof typeof securitySchemes
    >;
    const securitySchemeName = schema.security?.find(
      (security): security is keyof typeof securitySchemes =>
        availableSecuritySchemes.includes(security)
    );

    if (!securitySchemeName) {
      return requestFn(schema, requestInfo, options);
    }

    const securitySchemeHandler = securitySchemes[securitySchemeName];

    return requestFn(
      schema,
      await createSecureRequestInfo(
        securitySchemeHandler,
        [securitySchemeName],
        requestInfo,
        queryClient
      ),
      options
    );
  };
}

/**
 * Calculate the interval at which a token should be refreshed.
 */
function getJwtTokenRefreshInterval(token: string) {
  const parsedToken = jwtDecode(token);
  if (!parsedToken.iat || !parsedToken.exp) {
    throw new Error("JWT token must contain both 'iat' and 'exp' fields.");
  }

  return (parsedToken.exp - parsedToken.iat) * 1000;
}

/**
 * Refresh the token if it is about to expire
 * @returns The string to be used as the `Authorization` header or the object to be used in the request.
 */
async function createSecureRequestInfo(
  handler: SecuritySchemeHandler,
  queryKey: QueryKey,
  requestInfo: RequestFnInfo,
  queryClient: QueryClient
): Promise<RequestFnInfo> {
  const prevSecurityResult = queryClient.getQueryData<SecurityScheme>(queryKey);

  const securityResult = await queryClient.fetchQuery({
    queryKey,
    queryFn: ({ signal }) =>
      handler({
        signal,
        isRefreshing: Boolean(prevSecurityResult),
      }),
  });

  if (!shallowEqualObjects(securityResult, prevSecurityResult)) {
    const securityRefreshInterval = getSecurityRefreshInterval(securityResult);

    if (securityRefreshInterval !== undefined && securityRefreshInterval > 0) {
      // remove the already fetched query, before setting new defaults
      queryClient.removeQueries({ queryKey, exact: true });

      // set query new defaults (staleTime and gcTime)
      setSecurityQueryDefaults(queryClient, queryKey, securityRefreshInterval);

      // Set query data with the new token, since the old one was removed.
      // New query data will follow the new defaults staleTime and gcTime.
      queryClient.setQueryData(queryKey, securityResult);
    }
  }

  const securityParameters = createSecureRequestParameters(securityResult);

  if (!securityParameters) return requestInfo;

  return {
    ...requestInfo,
    parameters: {
      ...requestInfo.parameters,
      [securityParameters.in]: {
        [securityParameters.name]: securityParameters.value,
        ...requestInfo.parameters?.[securityParameters.in],
      },
    },
  };
}

function setSecurityQueryDefaults(
  queryClient: QueryClient,
  queryKey: QueryKey,
  refreshInterval: number
) {
  // set staleTime and gcTime based on token lifetime
  queryClient.setQueryDefaults(queryKey, {
    // stale the token 90% before it expires
    staleTime: isFinite(refreshInterval)
      ? refreshInterval * 0.9
      : refreshInterval,
    // garbage collect the token after it expires
    gcTime: isFinite(refreshInterval) ? refreshInterval : refreshInterval,
    // refetch the token 80% before it expires
    refetchInterval: isFinite(refreshInterval)
      ? refreshInterval * 0.8
      : refreshInterval,
    // always refetch the token, even in the background
    refetchIntervalInBackground: true,
  });
}

function createSecureRequestParameters(securityResult: SecurityScheme) {
  if (typeof securityResult === 'string' || 'token' in securityResult) {
    return {
      in: 'header',
      name: 'Authorization',
      value: `Bearer ${typeof securityResult === 'string' ? securityResult : securityResult.token}`,
    } as const;
  }

  if ('credentials' in securityResult) {
    return {
      in: 'header',
      name: 'Authorization',
      value: `Basic ${securityResult.credentials}`,
    } as const;
  }

  if ('in' in securityResult && securityResult.in !== 'cookie') {
    return securityResult;
  }

  throw new Error(
    'Security scheme must be a string, an object with a token property, an object with a credentials property, or an object with an in property that is not equal to "cookie".'
  );
}

function getSecurityRefreshInterval(securityResult: SecurityScheme) {
  if (typeof securityResult === 'string') {
    return getJwtTokenRefreshInterval(securityResult);
  }

  if ('refreshInterval' in securityResult) {
    return securityResult.refreshInterval;
  }
}

/**
 * @internal
 */
export function shallowEqualObjects(
  newObj: Record<string, any> | string,
  prevObj: Record<string, any> | string | undefined
) {
  if (typeof newObj !== typeof prevObj) return false;
  if (typeof newObj === 'string') return newObj === prevObj;
  if (
    typeof newObj !== 'object' ||
    newObj === null ||
    typeof prevObj !== 'object' ||
    prevObj === null ||
    prevObj === undefined
  )
    return false;
  if (Object.keys(newObj).length !== Object.keys(prevObj).length) return false;

  for (const key in newObj) {
    if (!Object.prototype.hasOwnProperty.call(newObj, key)) return false;
    if (newObj[key] !== prevObj[key]) return false;
  }
  return true;
}

type SecurityScheme =
  | SecuritySchemeBearer
  | SecuritySchemeBasic
  | SecuritySchemeAPIKey
  | SecuritySchemeCookie;

export type SecuritySchemeBearer =
  | string /** JWT Bearer token. **/
  | {
      /** Refresh interval in milliseconds. */
      refreshInterval: number;
      /** Token to be used for authentication. */
      token: string;
    };

export interface SecuritySchemeBasic {
  /** Credentials to be used for authentication. */
  credentials: string;

  /** Refresh interval in milliseconds. */
  refreshInterval: number;
}

export type SecuritySchemeAPIKey = {
  /** Where the secret should be placed. */
  in: 'header' | 'query';
  /** Name of the secret key. */
  name: string;
  /** Secret to be used for authentication. */
  value: string;
  /** Refresh interval in milliseconds. */
  refreshInterval?: number;
};

export type SecuritySchemeCookie = {
  /** Where the secret should be placed. */
  in: 'cookie';
  /** Refresh interval in milliseconds. */
  refreshInterval?: number;
};

/**
 * Type definition for a handler function that manages security schemes.
 * This function is invoked when a token needs to be fetched or refreshed.
 *
 * @param props - The properties for the handler function.
 * @param props.isRefreshing - A boolean indicating the state of the token.
 *    It's `false` on the initial "fetch token" request, and `true` if the token is stale or updating using `refreshInterval`.
 * @param props.signal - An AbortSignal that can be used to abort the request.
 *
 * @returns A SecurityScheme, which contains the necessary data for authentication.
 */
type SecuritySchemeHandler = (props: {
  isRefreshing: boolean;
  signal: AbortSignal;
}) => SecurityScheme | Promise<SecurityScheme>;

export type SecuritySchemeHandlers<SecuritySchemeName extends string> = {
  [key in SecuritySchemeName]: SecuritySchemeHandler;
};
