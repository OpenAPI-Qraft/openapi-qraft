import camelCase from 'camelcase';

import { getContentMediaType } from './getContent.js';
import { getOperationName } from './getOperationName.js';
import { getServiceName } from './getServiceName.js';
import type { OpenAPISchemaType } from './OpenAPISchemaType.ts';

export type Service = {
  name: string;
  variableName: string;
  typeName: string;
  fileBaseName: string;
  operations: ServiceOperation[];
};

export type ServiceOperation = {
  method: string;
  path: string;
  name: string;
  description: string | undefined;
  deprecated: boolean | undefined;
  mediaType: string | undefined;
  errors: Record<string, string | undefined>;
  success: Record<string, string | undefined>;
  parameters: Record<string, never> | undefined;
};

export const getServices = (
  openApiJson: OpenAPISchemaType,
  { postfixServices = 'Service' }: { postfixServices?: string } = {}
) => {
  const paths = openApiJson.paths;

  const services = new Map<string, Service>();

  for (const path in paths) {
    for (const method in paths[path]) {
      const methodOperation = paths[path][method];

      const serviceName = getServiceName(path.split('/')[1]);

      const { success, errors } = Object.entries(
        methodOperation.responses
      ).reduce(
        (acc, [statusCode, response]) => {
          if (!response.content || typeof response.content !== 'object')
            return acc;
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

      if (!services.has(serviceName)) {
        services.set(serviceName, {
          name: camelCase(serviceName),
          variableName: `${camelCase(serviceName, {
            preserveConsecutiveUppercase: false,
          })}${postfixServices}`,
          typeName: `${serviceName}${postfixServices}`,
          fileBaseName: `${serviceName}${postfixServices}`,
          operations: [],
        });
      }

      services.get(serviceName)!.operations.push({
        method,
        path,
        errors,
        name: getOperationName(path, method, methodOperation.operationId),
        description: methodOperation.description,
        deprecated: methodOperation.deprecated,
        parameters: methodOperation.parameters,
        mediaType: methodOperation.requestBody?.content
          ? getContentMediaType(methodOperation.requestBody.content)
          : undefined,
        success: success,
      });
    }
  }

  return Array.from(services.values());
};
