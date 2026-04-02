import type { OpenAPISchemaType } from './OpenAPISchemaType.js';
import openAPI from '@openapi-qraft/test-fixtures/openapi.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';
import { filterDocumentPaths } from '../filterDocumentPaths.js';
import { getServices } from './getServices.js';

describe('getServices', () => {
  it('matches snapshot with default options', () => {
    expect(getServices(openAPI)).toMatchSnapshot();
  });

  it('matches snapshot with custom `postfixServices`', () => {
    expect(getServices(openAPI, { postfixServices: 'Srv' })).toMatchSnapshot();
  });

  it('matches snapshot with custom `servicesGlob`', () => {
    expect(
      // @ts-expect-error - JSON OpenAPI schema does not match to OpenAPI3
      getServices(filterDocumentPaths(openAPI, ['/files/**']), {
        serviceNameBase: 'endpoint[0]',
        postfixServices: 'Service',
      })
    ).toMatchSnapshot();
  });

  it('matches snapshot with "serviceNameBase: endpoint"', () => {
    expect(
      getServices(openAPI, { serviceNameBase: 'endpoint[0]' })
    ).toMatchSnapshot();
  });

  it('matches snapshot with "serviceNameBase: tags"', () => {
    expect(getServices(openAPI, { serviceNameBase: 'tags' })).toMatchSnapshot();
  });

  it('inherits root-level security when `rootSecurity` is enabled and operation-level security is omitted', () => {
    const document: OpenAPISchemaType = {
      openapi: '3.1.0',
      info: {
        title: 'Fixture API',
        version: '1.0.0',
      },
      security: [{ jwtUserToken: [] }],
      paths: {
        '/accounts': {
          get: {
            operationId: 'getAccounts',
            responses: {
              200: {
                description: 'Successful response',
              },
            },
          },
        },
      },
      components: {
        parameters: undefined,
      },
    };

    expect(
      getServices(document, { rootSecurity: true })[0]?.operations[0]?.security
    ).toEqual([{ jwtUserToken: [] }]);
  });

  it('does not inherit root-level security when `rootSecurity` is disabled', () => {
    const document: OpenAPISchemaType = {
      openapi: '3.1.0',
      info: {
        title: 'Fixture API',
        version: '1.0.0',
      },
      security: [{ jwtUserToken: [] }],
      paths: {
        '/accounts': {
          get: {
            operationId: 'getAccounts',
            responses: {
              200: {
                description: 'Successful response',
              },
            },
          },
        },
      },
      components: {
        parameters: undefined,
      },
    };

    expect(
      getServices(document, { rootSecurity: false })[0]?.operations[0]?.security
    ).toBeUndefined();
  });

  it('prefers operation-level security over root-level security when `rootSecurity` is enabled', () => {
    const document: OpenAPISchemaType = {
      openapi: '3.1.0',
      info: {
        title: 'Fixture API',
        version: '1.0.0',
      },
      security: [{ jwtUserToken: [] }],
      paths: {
        '/accounts': {
          get: {
            operationId: 'getAccounts',
            security: [{ apiKey: [] }],
            responses: {
              200: {
                description: 'Successful response',
              },
            },
          },
        },
      },
      components: {
        parameters: undefined,
      },
    };

    expect(
      getServices(document, { rootSecurity: true })[0]?.operations[0]?.security
    ).toEqual([{ apiKey: [] }]);
  });

  it('treats empty operation-level security as an explicit override when `rootSecurity` is enabled', () => {
    const document: OpenAPISchemaType = {
      openapi: '3.1.0',
      info: {
        title: 'Fixture API',
        version: '1.0.0',
      },
      security: [{ jwtUserToken: [] }],
      paths: {
        '/health': {
          get: {
            operationId: 'getHealth',
            security: [],
            responses: {
              200: {
                description: 'Successful response',
              },
            },
          },
        },
      },
      components: {
        parameters: undefined,
      },
    };

    expect(
      getServices(document, { rootSecurity: true })[0]?.operations[0]?.security
    ).toEqual([]);
  });
});
