import type {
  OpenAPIService,
  ServiceOperation,
} from './open-api/OpenAPIService.js';

export class ServiceOperationNameValidationError extends Error {
  override name = 'ServiceOperationNameValidationError';
}

export function validateServiceOperationNames(
  services: OpenAPIService[]
): void {
  const errors: string[] = [];

  for (const service of services) {
    const operationsByName = new Map<string, ServiceOperation[]>();

    for (const operation of service.operations) {
      const operations = operationsByName.get(operation.name) ?? [];
      operations.push(operation);
      operationsByName.set(operation.name, operations);
    }

    for (const [name, operations] of operationsByName) {
      const endpoints = operations
        .map(({ method, path }) => `${method.toUpperCase()} ${path}`)
        .join(', ');

      if (!name) {
        errors.push(
          `Empty normalized operation name in service "${service.name}": ${endpoints}. Use an operationId or operation name modifier that produces a non-empty name.`
        );
      } else if (operations.length > 1) {
        errors.push(
          `Operation name collision in service "${service.name}" for normalized name "${name}": ${endpoints}. Use distinct operationIds or operation name modifiers.`
        );
      }
    }
  }

  if (errors.length) {
    throw new ServiceOperationNameValidationError(errors.join('\n'));
  }
}
