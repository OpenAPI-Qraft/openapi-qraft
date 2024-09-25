import type { OpenAPISchemaType } from './OpenAPISchemaType.js';
import camelCase from 'camelcase';
import { getContentMediaType } from './getContent.js';
import { getOperationName } from './getOperationName.js';
import {
  getServiceNamesByOperationEndpoint,
  ServiceBaseNameByEndpointOption,
} from './getServiceNamesByOperationEndpoint.js';
import { getServiceNamesByOperationTags } from './getServiceNamesByOperationTags.js';

export type ServiceBaseName = ServiceBaseNameByEndpointOption | 'tags';

/**
 * @deprecated move to separate file
 */
export type Service = {
  name: string;
  variableName: string;
  typeName: string;
  fileBaseName: string;
  operations: ServiceOperation[];
};

export type ServiceOperation = {
  method:
    | 'get'
    | 'put'
    | 'post'
    | 'patch'
    | 'delete'
    | 'options'
    | 'head'
    | 'trace';
  path: string;
  name: string;
  description: string | undefined;
  summary: string | undefined;
  deprecated: boolean | undefined;
  errors: Record<string, string | undefined>;
  requestBody: OpenAPISchemaType['paths'][string]['post']['requestBody'];
  success: Record<string, string | undefined>;
  parameters:
    | {
        name: string;
        in: 'header' | 'query' | 'cookie';
        description: string;
        required: boolean;
        schema: any;
        example: string | undefined;
      }[]
    | undefined;
  security: Array<Record<string, string[] | undefined>> | undefined;
};

export interface ServiceOutputOptions {
  postfixServices?: string; // todo::rename to `postfixService`
  serviceNameBase?: ServiceBaseName;
}

export const getServices = (
  openApiJson: OpenAPISchemaType,
  {
    postfixServices = 'Service',
    serviceNameBase = 'endpoint[0]',
  }: ServiceOutputOptions = {}
) => {
  const paths = openApiJson.paths;

  const services = new Map<string, Service>();

  for (const path in paths) {
    if (!Object.prototype.hasOwnProperty.call(paths, path)) continue;

    for (const method in paths[path]) {
      if (!Object.prototype.hasOwnProperty.call(paths[path], method)) continue;

      if (!supportedMethod(method)) {
        console.warn(
          `The path "${path}" HTTP method "${method}" is not supported`
        );
        continue;
      }

      const methodOperation = paths[path][method];

      const { success, errors } = Object.entries(
        methodOperation.responses
      ).reduce(
        (acc, [statusCode, response]) => {
          if (!response.content || typeof response.content !== 'object') {
            return acc;
          }

          const statusType =
            statusCode !== 'default' && // See "default" response https://swagger.io/docs/specification/describing-responses/#default
            Number(statusCode) < 400
              ? 'success'
              : 'errors';

          return {
            ...acc,
            [statusType]: {
              ...acc[statusType],
              [statusCode]: getContentMediaType(response.content),
            },
          };
        },
        {} as Record<'errors' | 'success', Record<string, string | undefined>>
      );

      const serviceFallbackBaseName = 'Default';

      const serviceNames =
        serviceNameBase === 'tags'
          ? getServiceNamesByOperationTags(
              paths[path][method]?.tags,
              serviceFallbackBaseName
            )
          : getServiceNamesByOperationEndpoint(
              path,
              serviceNameBase,
              serviceFallbackBaseName
            );

      for (const name of serviceNames) {
        if (!services.has(name)) {
          services.set(name, {
            name: camelCase(name),
            variableName: `${camelCase(name, {
              preserveConsecutiveUppercase: false,
            })}${postfixServices}`,
            typeName: `${name}${postfixServices}`,
            fileBaseName: `${name}${postfixServices}`,
            operations: [],
          });
        }
      }

      for (const name of serviceNames) {
        services.get(name)!.operations.push({
          method,
          path,
          errors,
          name: getOperationName(
            path,
            method,
            methodOperation.operationId,
            serviceNameBase
          ),
          description: methodOperation.description,
          summary: methodOperation.summary,
          deprecated: methodOperation.deprecated,
          parameters:
            Array.isArray(methodOperation.parameters) &&
            !methodOperation.parameters.length
              ? undefined
              : methodOperation.parameters,
          requestBody: methodOperation.requestBody,
          success: success,
          security: methodOperation.security,
        });
      }
    }
  }

  return Array.from(services.values());
};

export const supportedMethod = (
  method: unknown
): method is (typeof supportedHTTPMethods)[number] =>
  supportedHTTPMethods.includes(
    method as (typeof supportedHTTPMethods)[number]
  );

const supportedHTTPMethods = Object.values({
  get: 'get',
  put: 'put',
  post: 'post',
  patch: 'patch',
  delete: 'delete',
  options: 'options',
  head: 'head',
  trace: 'trace',
} satisfies { [key in ServiceOperation['method']]: key });
