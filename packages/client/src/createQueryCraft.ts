import { useContext } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';

import { createCallbackProxyDecoration } from './lib/createCallbackProxyDecoration.js';
import { QueryCraftContext, RequestSchema } from './QueryCraftContext.js';
import {
  ServiceOperationMutation,
  ServiceOperationMutationKey,
  ServiceOperationQuery,
  ServiceOperationQueryKey,
} from './ServiceOperation.js';

export const createQueryCraft = <
  Services extends {
    [service in keyof Services]: {
      [method in keyof Services[service]]: { schema: RequestSchema };
    };
  },
>(services: {
  [service in keyof Services]: {
    [method in keyof Services[service]]: {
      schema: Services[service][method]['schema'];
    };
  };
}) => {
  const catchFunctionList = [
    'queryFn',
    'useQuery',
    'getQueryKey',
    'mutationFn',
    'useMutation',
    'getMutationKey',
  ] as const;

  return createCallbackProxyDecoration(
    catchFunctionList,
    (path, functionName, args) => {
      const serviceOperation = getByPath(services, path);
      if (!isServiceOperation(serviceOperation))
        throw new Error(`Service operation not found: ${path.join('.')}`);

      if (functionName === 'getQueryKey') {
        const [params] = args as Parameters<
          ServiceOperationQuery<RequestSchema, unknown, unknown>['getQueryKey']
        >;
        const key: ServiceOperationQueryKey<RequestSchema, unknown> = [
          { url: serviceOperation.schema.url },
          params,
        ];
        return key;
      }

      if (functionName === 'getMutationKey') {
        const [parameters] = args as Parameters<
          ServiceOperationMutation<
            RequestSchema,
            unknown,
            unknown,
            unknown
          >['getMutationKey']
        >;

        const key: ServiceOperationMutationKey<RequestSchema, unknown> = [
          {
            url: serviceOperation.schema.url,
            method: serviceOperation.schema.method,
          },
          omitMutationPayload(parameters),
        ];

        return key;
      }

      if (functionName === 'useQuery') {
        const [params, options, ...restArgs] = args as Parameters<
          ServiceOperationQuery<RequestSchema, unknown, unknown>['useQuery']
        >;

        const client = useContext(QueryCraftContext)?.client;

        if (!client) throw new Error(`QueryCraftContext.client not found`);

        return useQuery(
          {
            ...options,
            queryKey: [
              { url: serviceOperation.schema.url },
              params as never,
            ] as const,
            queryFn:
              options?.queryFn ??
              function ({ queryKey: [, queryParams], signal, meta }) {
                return client(serviceOperation.schema, {
                  parameters: queryParams as never,
                  signal,
                  meta,
                });
              },
          },
          ...restArgs
        );
      }

      if (functionName === 'useMutation') {
        const [parameters, options, ...restArgs] = args as Parameters<
          ServiceOperationMutation<
            RequestSchema,
            object | undefined,
            unknown,
            unknown
          >['useMutation']
        >;

        if (
          parameters &&
          typeof parameters === 'object' &&
          options &&
          'mutationKey' in options
        )
          throw new Error(
            `'useMutation': parameters and 'options.mutationKey' cannot be used together`
          );

        const client = useContext(QueryCraftContext)?.client;

        if (!client) throw new Error(`QueryCraftContext.client not found`);

        const mutationKey =
          parameters && typeof parameters === 'object'
            ? ([
                {
                  url: serviceOperation.schema.url,
                  method: serviceOperation.schema.method,
                },
                parameters,
              ] as const)
            : options && 'mutationKey' in options
              ? (options.mutationKey as ServiceOperationMutationKey<
                  typeof serviceOperation.schema,
                  unknown
                >)
              : ([
                  {
                    url: serviceOperation.schema.url,
                    method: serviceOperation.schema.method,
                  },
                ] as const);

        return useMutation(
          {
            ...options,
            mutationKey,
            mutationFn:
              options?.mutationFn ??
              (parameters
                ? function (bodyPayload) {
                    return client(serviceOperation.schema, {
                      parameters,
                      body: bodyPayload as never,
                    });
                  }
                : function (parametersAndBodyPayload) {
                    const { body, ...parameters } =
                      parametersAndBodyPayload as { body: unknown };

                    return client(serviceOperation.schema, {
                      body,
                      parameters,
                    } as never);
                  }),
          },
          ...restArgs
        );
      }

      if (functionName === 'queryFn') {
        const [client, options] = args as Parameters<
          ServiceOperationQuery<RequestSchema, unknown, never>['queryFn']
        >;
        const parameters =
          'queryKey' in options ? options.queryKey[1] : options.parameters;
        return client(serviceOperation.schema, {
          parameters,
          meta: options.meta,
          signal: options.signal,
        });
      }

      if (functionName === 'mutationFn') {
        const [client, options] = args as Parameters<
          ServiceOperationMutation<
            RequestSchema,
            unknown,
            unknown,
            never
          >['mutationFn']
        >;
        return client(serviceOperation.schema, {
          parameters: options.parameters,
          body: options.body,
        });
      }

      throw new Error(`Not supported API method: ${String(functionName)}`);
    }
  ) as Services;
};

function omitMutationPayload<T>(params: T) {
  if (!params || typeof params !== 'object')
    throw new Error('`params` must be object');

  if ('body' in params || 'requestBody' in params) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { body, requestBody, ...paramsRest } = params as Record<
      'body' | 'requestBody',
      unknown
    >;
    return paramsRest;
  }

  return params as Omit<T, 'body' | 'requestBody'>;
}

function isServiceOperation(
  input: unknown
): input is { schema: RequestSchema } {
  return input !== null && typeof input === 'object' && 'schema' in input;
}

function getByPath(obj: Record<string, unknown>, path: string[]) {
  return path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc)
      return acc[key as keyof typeof acc];
  }, obj);
}
