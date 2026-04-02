import type { OpenAPISchemaType } from '@openapi-qraft/plugin/lib/open-api/OpenAPISchemaType';
import type { OpenAPIService } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';

export function applyRootSecurityToServices({
  services,
  schema,
}: {
  services: OpenAPIService[];
  schema: OpenAPISchemaType;
}) {
  return services.map((service) => ({
    ...service,
    operations: service.operations.map((operation) => ({
      ...operation,
      security: resolveOperationSecurity(
        schema,
        operation.path,
        operation.method
      ),
    })),
  }));
}

function resolveOperationSecurity(
  schema: OpenAPISchemaType,
  path: OpenAPIService['operations'][number]['path'],
  method: OpenAPIService['operations'][number]['method']
) {
  const methodOperation = schema.paths[path]?.[method];

  if (!methodOperation) {
    return undefined;
  }

  if ('security' in methodOperation) {
    return methodOperation.security;
  }

  return schema.security;
}
