import camelCase from 'camelcase';
import * as console from 'console';
import micromatch from 'micromatch';

import { getContentMediaType } from './getContent.js';
import { getOperationName } from './getOperationName.js';
import {
  getServiceNamesByOperationEndpoint,
  ServiceBaseNameByEndpointOption,
} from './getServiceNamesByOperationEndpoint.js';
import { getServiceNamesByOperationTags } from './getServiceNamesByOperationTags.js';
import type { OpenAPISchemaType } from './OpenAPISchemaType.js';

export type ServiceBaseName = ServiceBaseNameByEndpointOption | 'tags';

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
  mediaType: string | undefined;
  errors: Record<string, string | undefined>;
  success: Record<string, string | undefined>;
  parameters: Record<string, any> | undefined;
};

export const getServices = (
  openApiJson: OpenAPISchemaType,
  {
    postfixServices = 'Service',
    serviceNameBase = 'endpoint',
  }: { postfixServices?: string; serviceNameBase?: ServiceBaseName } = {},
  servicesGlob = ['**']
) => {
  const paths = openApiJson.paths;

  const services = new Map<string, Service>();

  const isPathMatch = createServicePathMatch(servicesGlob);

  for (const path in paths) {
    if (!paths.hasOwnProperty(path)) continue;

    for (const method in paths[path]) {
      if (!paths[path].hasOwnProperty(method)) continue;
      if (!isPathMatch(path)) continue;

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
          name: getOperationName(path, method, methodOperation.operationId),
          description: methodOperation.description,
          summary: methodOperation.summary,
          deprecated: methodOperation.deprecated,
          parameters:
            Array.isArray(methodOperation.parameters) &&
            !methodOperation.parameters.length
              ? undefined
              : methodOperation.parameters,
          mediaType: methodOperation.requestBody?.content
            ? getContentMediaType(methodOperation.requestBody.content)
            : undefined,
          success: success,
        });
      }
    }
  }

  return Array.from(services.values());
};

/**
 * Create a function to match service paths
 * @param servicesGlob
 */
export const createServicePathMatch = (servicesGlob: string[]) => {
  const servicePathGlobs = servicesGlob.reduce<
    Record<'match' | 'ignore', string[]>
  >(
    (acc, glob) => {
      glob.startsWith('!')
        ? acc.ignore.push(glob.slice(1))
        : acc.match.push(glob);
      return acc;
    },
    {
      match: [],
      ignore: [],
    }
  );

  return function isServicePatchMatch(path: string) {
    return micromatch.isMatch(path, servicePathGlobs.match, {
      ignore: servicePathGlobs.ignore,
    });
  };
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
