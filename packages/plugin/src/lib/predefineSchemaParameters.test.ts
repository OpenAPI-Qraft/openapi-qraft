import openAPI from '@openapi-qraft/test-fixtures/openapi.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';
import {
  assertIsOperationObject,
  assertIsParameterObjects,
  createPredefinedParametersGlobs,
  parseOperationPredefinedParametersOption,
  predefineSchemaParameters,
} from './predefineSchemaParameters.js';

describe('predefineSchemaParameters utils', () => {
  describe('parseOperationPredefinedParametersOption', () => {
    it('parses a simple config string', () => {
      const configString = '/**:header.x-monite-version,query.x-api-key';

      const parsedConfig =
        parseOperationPredefinedParametersOption(configString);
      expect(parsedConfig).toEqual([
        {
          pathGlobs: '/**',
          parameters: [
            { in: 'header', name: 'x-monite-version' },
            { in: 'query', name: 'x-api-key' },
          ],
        },
      ]);
    });

    it('parses a config with methods', () => {
      const parsedConfig = parseOperationPredefinedParametersOption(
        'get /**:header.x-monite-version,query.x-api-key'
      );
      expect(parsedConfig).toEqual([
        {
          methods: ['get'],
          pathGlobs: '/**',
          parameters: [
            { in: 'header', name: 'x-monite-version' },
            { in: 'query', name: 'x-api-key' },
          ],
        },
      ]);
    });

    it('should handle config strings with no options', () => {
      const parsedConfig =
        parseOperationPredefinedParametersOption('/user/**,/post/**');
      expect(parsedConfig).toEqual([
        {
          pathGlobs: '/user/**,/post/**',
          parameters: [],
        },
      ]);
    });

    it('should handle config strings with multiple headers and queries', () => {
      const configString =
        '/**:query.x-session-id,header.x-monite-version,header.x-monite-entity-id,query.x-api-key,cookie.jwt';

      const parsedConfig =
        parseOperationPredefinedParametersOption(configString);
      expect(parsedConfig).toEqual([
        {
          pathGlobs: '/**',
          parameters: [
            { in: 'header', name: 'x-monite-version' },
            { in: 'header', name: 'x-monite-entity-id' },
            { in: 'query', name: 'x-session-id' },
            { in: 'query', name: 'x-api-key' },
            { in: 'cookie', name: 'jwt' },
          ],
        },
      ]);
    });

    it('should handle config strings with multiple paths and no options', () => {
      const configString = '/foo,/bar';

      const parsedConfig =
        parseOperationPredefinedParametersOption(configString);
      expect(parsedConfig).toEqual([
        {
          pathGlobs: '/foo,/bar',
          parameters: [],
        },
      ]);
    });

    it('should handle config strings with multiple paths and options', () => {
      const configString = [
        '/foo,/bar:header.x-monite-version,query.x-api-key',
        '/baz:header.x-monite-entity-id',
      ];

      const parsedConfig = parseOperationPredefinedParametersOption(
        ...configString
      );
      expect(parsedConfig).toEqual([
        {
          pathGlobs: '/foo,/bar',
          parameters: [
            { in: 'header', name: 'x-monite-version' },
            { in: 'query', name: 'x-api-key' },
          ],
        },
        {
          pathGlobs: '/baz',
          parameters: [{ in: 'header', name: 'x-monite-entity-id' }],
        },
      ]);
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
        createPredefinedParametersGlobs(openAPI as never, [
          {
            methods: undefined,
            pathGlobs: '/entities/**,/approval_policies/**',
            parameters: [{ in: 'header', name: 'x-monite-version' }],
          },
        ])
      ).toEqual([
        {
          errors: [],
          methods: ['post', 'get', 'delete', 'patch'],
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
      ]);
    });

    it('should correctly create a map of predefined parameters with different type', () => {
      expect(
        createPredefinedParametersGlobs(openAPI as never, [
          {
            methods: undefined,
            pathGlobs: '/files/list',
            parameters: [
              { in: 'header', name: 'x-monite-version' },
              { in: 'query', name: 'id__in' },
            ],
          },
        ])
      ).toEqual([
        {
          errors: [],
          methods: ['get'],
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
      ]);
    });

    it('creates errors for paths with non existing parameters', () => {
      expect(
        createPredefinedParametersGlobs(openAPI as never, [
          {
            methods: undefined,
            pathGlobs: '/approval_policies/**',
            parameters: [
              { in: 'header', name: 'x-non-existing-parameter' },
              { in: 'header', name: 'x-monite-version' },
            ],
          },
        ])
      ).toEqual([
        {
          methods: ['get', 'delete', 'patch'],
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
      ]);
    });

    it('creates multiple predefined parameters for different paths', () => {
      expect(
        createPredefinedParametersGlobs(openAPI as never, [
          {
            methods: undefined,
            pathGlobs: '/approval_policies/**',
            parameters: [{ in: 'header', name: 'x-monite-entity-id' }],
          },
          {
            methods: undefined,
            pathGlobs: '/approval_policies/{approval_policy_id}',
            parameters: [{ in: 'header', name: 'x-monite-version' }],
          },
        ])
      ).toEqual([
        {
          errors: [],
          methods: ['get', 'delete', 'patch'],
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
        {
          errors: [],
          methods: ['get', 'delete', 'patch'],
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
      ]);
    });

    it('creates errors for paths with conflicting types', () => {
      expect(
        createPredefinedParametersGlobs(
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
          [
            {
              parameters: [{ in: 'header', name: 'x-monite-version' }],
              pathGlobs: '/approval_policies/**',
              methods: undefined,
            },
          ]
        )
      ).toEqual([
        {
          methods: ['get', 'delete', 'patch'],
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
      ]);
    });

    it('creates an error for not matching paths', () => {
      expect(
        createPredefinedParametersGlobs(openAPI as never, [
          {
            methods: undefined,
            pathGlobs: '/non-existing-path/**',
            parameters: [{ in: 'header', name: 'x-monite-version' }],
          },
        ])
      ).toEqual([
        {
          errors: ["No matching paths found for '/non-existing-path/**'"],
          parameters: [],
          paths: [],
        },
      ]);
    });
  });

  describe('predefineSchemaParameters', () => {
    it('should correctly predefine parameters in the schema', () => {
      const predefinedSchema = predefineSchemaParameters(
        openAPI as never,
        createPredefinedParametersGlobs(openAPI as never, [
          {
            methods: undefined,
            pathGlobs: '/approval_policies/**',
            parameters: [{ in: 'header', name: 'x-monite-version' }],
          },
        ])
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
        createPredefinedParametersGlobs(openAPI as never, [
          {
            methods: undefined,
            pathGlobs: '/approval_policies/**',
            parameters: [{ in: 'header', name: 'x-monite-entity-id' }],
          },
          {
            methods: undefined,
            pathGlobs: '/approval_policies/{approval_policy_id}',
            parameters: [{ in: 'header', name: 'x-monite-version' }],
          },
        ])
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
      const predefinedSchema = predefineSchemaParameters(openAPI as never, []);

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
