import openAPI from '@openapi-qraft/test-fixtures/openapi.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';
import {
  assertIsOperationObject,
  assertIsParameterObjects,
  createPredefinedParametersGlobMap,
  parseOperationPredefinedParametersOption,
  predefineSchemaParameters,
} from './predefineSchemaParameters.js';

describe('predefineSchemaParameters utils', () => {
  describe('parseOperationPredefinedParametersOption', () => {
    it('should correctly parse a simple config string', () => {
      const configString = '/**:header.x-monite-version,query.x-api-key';

      const parsedConfig =
        parseOperationPredefinedParametersOption(configString);
      expect(parsedConfig).toEqual({
        '/**': [
          { in: 'header', name: 'x-monite-version' },
          { in: 'query', name: 'x-api-key' },
        ],
      });
    });

    it('should handle config strings with no options', () => {
      const configString = '/user/**,/post/**';
      const expectedOutput = {
        '/user/**,/post/**': [],
      };

      const parsedConfig =
        parseOperationPredefinedParametersOption(configString);
      expect(parsedConfig).toEqual(expectedOutput);
    });

    it('should handle config strings with multiple headers and queries', () => {
      const configString =
        '/**:query.x-session-id,header.x-monite-version,header.x-monite-entity-id,query.x-api-key,cookie.jwt';
      const expectedOutput = {
        '/**': [
          { in: 'header', name: 'x-monite-version' },
          { in: 'header', name: 'x-monite-entity-id' },
          { in: 'query', name: 'x-session-id' },
          { in: 'query', name: 'x-api-key' },
          { in: 'cookie', name: 'jwt' },
        ],
      };

      const parsedConfig =
        parseOperationPredefinedParametersOption(configString);
      expect(parsedConfig).toEqual(expectedOutput);
    });

    it('should handle config strings with multiple paths and no options', () => {
      const configString = '/foo,/bar';
      const expectedOutput = {
        '/foo,/bar': [],
      };

      const parsedConfig =
        parseOperationPredefinedParametersOption(configString);
      expect(parsedConfig).toEqual(expectedOutput);
    });

    it('should handle config strings with multiple paths and options', () => {
      const configString = [
        '/foo,/bar:header.x-monite-version,query.x-api-key',
        '/baz:header.x-monite-entity-id',
      ];
      const expectedOutput = {
        '/foo,/bar': [
          { in: 'header', name: 'x-monite-version' },
          { in: 'query', name: 'x-api-key' },
        ],
        '/baz': [{ in: 'header', name: 'x-monite-entity-id' }],
      };

      const parsedConfig = parseOperationPredefinedParametersOption(
        ...configString
      );
      expect(parsedConfig).toEqual(expectedOutput);
    });

    it('should throw an error for duplicate paths', () => {
      const configString = [
        '/foo:header.x-monite-version',
        '/foo:query.x-api-key',
      ];
      expect(() =>
        parseOperationPredefinedParametersOption(...configString)
      ).toThrow('Duplicate path: /foo in config string.');
    });

    it('should throw an error for invalid option type', () => {
      const configString = '/foo:invalid.x-monite-version';
      expect(() =>
        parseOperationPredefinedParametersOption(configString)
      ).toThrow(
        "Invalid option type: invalid in invalid.x-monite-version. Must be one of 'header', 'query', or 'cookie'"
      );
    });
  });

  describe('createPredefinedParametersGlobMap', () => {
    it('should correctly create a map of predefined parameters', () => {
      expect(
        createPredefinedParametersGlobMap(openAPI as never, {
          '/entities/**,/approval_policies/**': [
            { in: 'header', name: 'x-monite-version' },
          ],
        })
      ).toEqual({
        '/entities/**,/approval_policies/**': {
          errors: [],
          parameters: [
            {
              example: '2023-06-04',
              in: 'header',
              name: 'x-monite-version',
              required: true,
              schema: {
                format: 'date',
                type: 'string',
              },
            },
          ],
          paths: [
            '/entities/{entity_id}/documents',
            '/approval_policies/{approval_policy_id}',
          ],
        },
      });
    });

    it('should correctly create a map of predefined parameters with different type', () => {
      expect(
        createPredefinedParametersGlobMap(openAPI as never, {
          '/files/list': [
            { in: 'header', name: 'x-monite-version' },
            { in: 'query', name: 'id__in' },
          ],
        })
      ).toEqual({
        '/files/list': {
          errors: [],
          parameters: [
            {
              example: '2023-06-04',
              in: 'header',
              name: 'x-monite-version',
              required: false,
              schema: {
                format: 'date',
                type: 'string',
              },
            },
            {
              in: 'query',
              name: 'id__in',
              required: false,
              schema: {
                items: {
                  format: 'uuid',
                  type: 'string',
                },
                maxItems: 100,
                type: 'array',
              },
            },
          ],
          paths: ['/files/list'],
        },
      });
    });

    it('creates errors for paths with non existing parameters', () => {
      expect(
        createPredefinedParametersGlobMap(openAPI as never, {
          '/approval_policies/**': [
            { in: 'header', name: 'x-non-existing-parameter' },
            { in: 'header', name: 'x-monite-version' },
          ],
        })
      ).toEqual({
        '/approval_policies/**': {
          errors: [
            "Missing predefined parameter 'header' 'x-non-existing-parameter' in 'get /approval_policies/{approval_policy_id}' in '/approval_policies/**'",
            "Missing predefined parameter 'header' 'x-non-existing-parameter' in 'delete /approval_policies/{approval_policy_id}' in '/approval_policies/**'",
            "Missing predefined parameter 'header' 'x-non-existing-parameter' in 'patch /approval_policies/{approval_policy_id}' in '/approval_policies/**'",
          ],
          parameters: [
            {
              example: '2023-06-04',
              in: 'header',
              name: 'x-monite-version',
              required: true,
              schema: {
                format: 'date',
                type: 'string',
              },
            },
          ],
          paths: ['/approval_policies/{approval_policy_id}'],
        },
      });
    });

    it('creates multiple predefined parameters for different paths', () => {
      expect(
        createPredefinedParametersGlobMap(openAPI as never, {
          '/approval_policies/**': [
            { in: 'header', name: 'x-monite-entity-id' },
          ],
          '/approval_policies/{approval_policy_id}': [
            { in: 'header', name: 'x-monite-version' },
          ],
        })
      ).toEqual({
        '/approval_policies/**': {
          errors: [],
          parameters: [
            {
              in: 'header',
              name: 'x-monite-entity-id',
              required: true,
              schema: {
                format: 'uuid',
                type: 'string',
              },
            },
          ],
          paths: ['/approval_policies/{approval_policy_id}'],
        },
        '/approval_policies/{approval_policy_id}': {
          errors: [],
          parameters: [
            {
              in: 'header',
              name: 'x-monite-version',
              example: '2023-06-04',
              required: true,
              schema: {
                format: 'date',
                type: 'string',
              },
            },
          ],
          paths: ['/approval_policies/{approval_policy_id}'],
        },
      });
    });

    it('creates errors for paths with conflicting types', () => {
      expect(
        createPredefinedParametersGlobMap(
          {
            ...openAPI,
            paths: {
              ...openAPI.paths,
              '/approval_policies/{approval_policy_id}': {
                ...openAPI.paths['/approval_policies/{approval_policy_id}'],
                get: {
                  ...openAPI.paths['/approval_policies/{approval_policy_id}']
                    .get,
                  parameters: [
                    {
                      in: 'header',
                      name: 'x-monite-version',
                      required: true,
                      schema: {
                        type: 'number',
                      },
                    },
                  ],
                },
              },
            },
          } as never,
          {
            '/approval_policies/**': [
              { in: 'header', name: 'x-monite-version' },
            ],
          }
        )
      ).toEqual({
        '/approval_policies/**': {
          errors: [
            "Parameter 'header' 'x-monite-version' in 'delete /approval_policies/{approval_policy_id}' has conflicting types with predefined parameter 'x-monite-version' in '/approval_policies/**'",
            "Parameter 'header' 'x-monite-version' in 'patch /approval_policies/{approval_policy_id}' has conflicting types with predefined parameter 'x-monite-version' in '/approval_policies/**'",
          ],
          parameters: [
            {
              in: 'header',
              name: 'x-monite-version',
              required: true,
              schema: {
                type: 'number',
              },
            },
          ],
          paths: ['/approval_policies/{approval_policy_id}'],
        },
      });
    });

    it('creates an error for not matching paths', () => {
      expect(
        createPredefinedParametersGlobMap(openAPI as never, {
          '/non-existing-path/**': [{ in: 'header', name: 'x-monite-version' }],
        })
      ).toEqual({
        '/non-existing-path/**': {
          errors: ["No matching paths found for '/non-existing-path/**'"],
          parameters: [],
          paths: [],
        },
      });
    });
  });

  describe('predefineSchemaParameters', () => {
    it('should correctly predefine parameters in the schema', () => {
      const predefinedSchema = predefineSchemaParameters(
        openAPI as never,
        createPredefinedParametersGlobMap(openAPI as never, {
          '/approval_policies/**': [{ in: 'header', name: 'x-monite-version' }],
        })
      );

      const pathsItem =
        predefinedSchema.paths?.['/approval_policies/{approval_policy_id}'];

      if (!pathsItem || '$ref' in pathsItem)
        throw new Error('Unexpected pathsItem');

      Object.values(pathsItem).forEach((operation) => {
        assertIsOperationObject(operation);
        const parameters = operation.parameters;
        if (!parameters) throw new Error('Unexpected parameters');
        assertIsParameterObjects(parameters);

        expect(
          parameters.find((param) => param.name === 'x-monite-version')
        ).toEqual({
          example: '2023-06-04',
          in: 'header',
          name: 'x-monite-version',
          required: false,
          schema: {
            format: 'date',
            type: 'string',
          },
        });
      });
    });

    it('should keep already predefine parameters in the schema', () => {
      const predefinedSchema = predefineSchemaParameters(
        openAPI as never,
        createPredefinedParametersGlobMap(openAPI as never, {
          '/approval_policies/**': [
            { in: 'header', name: 'x-monite-entity-id' },
          ],
          '/approval_policies/{approval_policy_id}': [
            { in: 'header', name: 'x-monite-version' },
          ],
        })
      );

      const pathsItem =
        predefinedSchema.paths?.['/approval_policies/{approval_policy_id}'];

      if (!pathsItem || '$ref' in pathsItem)
        throw new Error('Unexpected pathsItem');

      Object.values(pathsItem).forEach((operation) => {
        assertIsOperationObject(operation);
        const parameters = operation.parameters;
        if (!parameters) throw new Error('Unexpected parameters');
        assertIsParameterObjects(parameters);

        expect(
          parameters.find((param) => param.name === 'x-monite-entity-id')
        ).toEqual({
          in: 'header',
          name: 'x-monite-entity-id',
          required: false,
          schema: {
            format: 'uuid',
            type: 'string',
          },
        });

        expect(
          parameters.find((param) => param.name === 'x-monite-version')
        ).toEqual({
          example: '2023-06-04',
          in: 'header',
          name: 'x-monite-version',
          required: false,
          schema: {
            format: 'date',
            type: 'string',
          },
        });
      });
    });

    it('should skip predefining parameters in the schema if not needed', () => {
      const predefinedSchema = predefineSchemaParameters(openAPI as never, {});

      const pathsItem =
        predefinedSchema.paths?.['/approval_policies/{approval_policy_id}'];

      if (!pathsItem || '$ref' in pathsItem)
        throw new Error('Unexpected pathsItem');

      Object.values(pathsItem).forEach((operation) => {
        assertIsOperationObject(operation);
        const parameters = operation.parameters;
        if (!parameters) throw new Error('Unexpected parameters');
        assertIsParameterObjects(parameters);

        expect(
          parameters.find((param) => param.name === 'x-monite-version')
        ).toEqual({
          example: '2023-06-04',
          in: 'header',
          name: 'x-monite-version',
          required: true,
          schema: {
            format: 'date',
            type: 'string',
          },
        });
      });
    });
  });
});
