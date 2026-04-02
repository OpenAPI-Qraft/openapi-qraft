import type { OpenAPISchemaType } from '@openapi-qraft/plugin/lib/open-api/OpenAPISchemaType';
import type { OpenAPIService } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import { describe, expect, test } from 'vitest';
import { applyRootSecurityToServices } from './applyRootSecurityToServices.js';

function createSchema(
  overrides: Partial<OpenAPISchemaType> = {}
): OpenAPISchemaType {
  return {
    openapi: '3.0.0',
    info: { title: 'API', version: '1' },
    paths: {},
    components: { parameters: undefined },
    ...overrides,
  };
}

function createOperation(
  path: string,
  method: OpenAPIService['operations'][number]['method'] = 'get'
): OpenAPIService['operations'][number] {
  return {
    method,
    path,
    name: 'op',
    description: undefined,
    summary: undefined,
    deprecated: undefined,
    errors: {},
    success: {},
    parameters: undefined,
    requestBody: undefined,
    security: undefined,
  };
}

function createService(
  operations: OpenAPIService['operations']
): OpenAPIService {
  return {
    name: 'svc',
    variableName: 'svc',
    typeName: 'Svc',
    fileBaseName: 'svc',
    operations,
  };
}

describe('applyRootSecurityToServices', () => {
  test('sets operation security from root schema when operation omits security', () => {
    const rootSecurity = [{ bearerAuth: [] as string[] | undefined }];
    const schema = createSchema({
      security: rootSecurity,
      paths: {
        '/items': {
          get: {
            responses: { 200: { description: 'ok' } },
          },
        },
      },
    });
    const services = [createService([createOperation('/items', 'get')])];

    const result = applyRootSecurityToServices({ services, schema });

    expect(result[0].operations[0].security).toEqual(rootSecurity);
  });

  test('keeps operation-level security and does not fall back to root', () => {
    const rootSecurity = [{ bearerAuth: [] as string[] | undefined }];
    const opSecurity = [{ apiKey: ['write'] }];
    const schema = createSchema({
      security: rootSecurity,
      paths: {
        '/items': {
          get: {
            security: opSecurity,
            responses: { 200: { description: 'ok' } },
          },
        },
      },
    });
    const services = [createService([createOperation('/items', 'get')])];

    const result = applyRootSecurityToServices({ services, schema });

    expect(result[0].operations[0].security).toEqual(opSecurity);
  });

  test('uses explicit empty security on operation instead of root', () => {
    const rootSecurity = [{ bearerAuth: [] as string[] | undefined }];
    const schema = createSchema({
      security: rootSecurity,
      paths: {
        '/public': {
          get: {
            security: [],
            responses: { 200: { description: 'ok' } },
          },
        },
      },
    });
    const services = [createService([createOperation('/public', 'get')])];

    const result = applyRootSecurityToServices({ services, schema });

    expect(result[0].operations[0].security).toEqual([]);
  });

  test('returns undefined security when path or method is missing in schema', () => {
    const schema = createSchema({
      security: [{ bearerAuth: [] as string[] | undefined }],
      paths: {
        '/other': {
          get: {
            responses: { 200: { description: 'ok' } },
          },
        },
      },
    });
    const services = [
      createService([
        createOperation('/unknown', 'get'),
        createOperation('/other', 'post'),
      ]),
    ];

    const result = applyRootSecurityToServices({ services, schema });

    expect(result[0].operations[0].security).toBeUndefined();
    expect(result[0].operations[1].security).toBeUndefined();
  });
});
