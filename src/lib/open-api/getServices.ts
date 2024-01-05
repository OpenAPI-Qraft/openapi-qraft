import { getContentMediaType } from './getContent.js';
import { getOperationName } from './getOperationName.js';
import { getServiceName } from './getServiceName.js';
import type { OpenAPISchemaType } from './OpenAPISchemaType';

export type ServiceOperation = {
  method: string;
  path: string;
  name: string;
  description: string | undefined;
  deprecated: boolean | undefined;
  mediaType: string | undefined;
  errors: Record<string, string | undefined>;
  success: Record<string, string | undefined>;
};

export const getServices = (openApiJson: OpenAPISchemaType) => {
  const paths = openApiJson.paths;

  const services: Record<string, ServiceOperation[]> = {};

  for (const path in paths) {
    for (const method in paths[path]) {
      const methodOperation = paths[path][method];

      const serviceName = getServiceName(path.split('/')[1]);

      if (!services[serviceName]) services[serviceName] = [];

      // todo:: add response multiple statuses success support and media typeName
      const { success, errors } = Object.entries(
        methodOperation.responses
      ).reduce(
        (acc, [statusCode, response]) => {
          if (!response.content || typeof response.content !== 'object')
            return acc;
          const statusType = Number(statusCode) < 400 ? 'success' : 'errors';
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

      services[serviceName].push({
        method,
        path,
        errors,
        name: getOperationName(path, method, methodOperation.operationId),
        description: methodOperation.description,
        deprecated: methodOperation.deprecated,
        mediaType: methodOperation.requestBody?.content
          ? getContentMediaType(methodOperation.requestBody.content)
          : undefined,
        success: success,
      });
    }
  }

  return services;
};
