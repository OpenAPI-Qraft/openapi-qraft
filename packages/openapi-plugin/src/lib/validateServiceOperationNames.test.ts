import type {
  OpenAPIService,
  ServiceOperation,
} from './open-api/OpenAPIService.js';
import { describe, expect, it } from 'vitest';
import { validateServiceOperationNames } from './validateServiceOperationNames.js';

describe('validateServiceOperationNames', () => {
  it('reports every conflicting endpoint and normalized name per service', () => {
    const services = [
      createService('items', [
        { name: 'getItems', method: 'get', path: '/items' },
        { name: 'getItems', method: 'post', path: '/items/search' },
        { name: 'getItems', method: 'get', path: '/items/all' },
        { name: 'updateItems', method: 'put', path: '/items' },
        { name: 'updateItems', method: 'patch', path: '/items' },
      ]),
      createService('users', [
        { name: 'getUsers', method: 'get', path: '/users' },
        { name: 'getUsers', method: 'post', path: '/users/search' },
      ]),
    ];

    expect(() => validateServiceOperationNames(services)).toThrow(
      [
        'Operation name collision in service "items" for normalized name "getItems": GET /items, POST /items/search, GET /items/all. Use distinct operationIds or operation name modifiers.',
        'Operation name collision in service "items" for normalized name "updateItems": PUT /items, PATCH /items. Use distinct operationIds or operation name modifiers.',
        'Operation name collision in service "users" for normalized name "getUsers": GET /users, POST /users/search. Use distinct operationIds or operation name modifiers.',
      ].join('\n')
    );
  });

  it('allows the same name in different services without changing names', () => {
    const services = [
      createService('items', [
        { name: 'getItems', method: 'get', path: '/items' },
      ]),
      createService('users', [
        { name: 'getItems', method: 'get', path: '/users/items' },
      ]),
    ];
    const originalServices = structuredClone(services);

    expect(() => validateServiceOperationNames(services)).not.toThrow();
    expect(services).toEqual(originalServices);
  });

  it('rejects empty names and includes all affected endpoints', () => {
    expect(() =>
      validateServiceOperationNames([
        createService('items', [
          { name: '', method: 'get', path: '/items' },
          { name: '', method: 'post', path: '/items/search' },
        ]),
      ])
    ).toThrow(
      'Empty normalized operation name in service "items": GET /items, POST /items/search. Use an operationId or operation name modifier that produces a non-empty name.'
    );
  });
});

function createService(
  name: string,
  operations: Pick<ServiceOperation, 'name' | 'method' | 'path'>[]
): OpenAPIService {
  return {
    name,
    variableName: `${name}Service`,
    typeName: `${name}Service`,
    fileBaseName: `${name}Service`,
    operations: operations.map((operation) => ({
      ...operation,
      description: undefined,
      summary: undefined,
      deprecated: undefined,
      errors: {},
      requestBody: undefined,
      success: {},
      parameters: undefined,
      security: undefined,
    })),
  };
}
