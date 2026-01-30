import { describe, expect, it } from 'vitest';
import { parseConfigToArgs } from './parseConfigToArgs.js';

describe('configParser', () => {
  it('should parse simple key-value pairs', () => {
    expect(
      parseConfigToArgs({
        'explicit-import-extensions': '.js',
        'some-numeric-flag': 1,
      })
    ).toEqual([
      '--explicit-import-extensions',
      '.js',
      '--some-numeric-flag',
      '1',
    ]);
  });

  it('should parse simple boolean, null and undefined values as toggles', () => {
    expect(
      parseConfigToArgs({
        'some-boolean-flag': true,
        'some-disabled-boolean-flag': false,
        'some-null-boolean-flag': null,
        'some-undefined-boolean-flag': undefined,
      })
    ).toEqual(['--some-boolean-flag']);
  });

  it('should parse arrays', () => {
    expect(
      parseConfigToArgs({
        'filter-services': [
          '/approval_policies/**',
          '/entities/**',
          '/files/**',
        ],
      })
    ).toEqual([
      '--filter-services',
      '/approval_policies/**',
      '/entities/**',
      '/files/**',
    ]);
  });

  it('should parse not nested objects with key-value mappings', () => {
    expect(
      parseConfigToArgs({
        'operation-predefined-parameters': {
          '/approval_policies/{approval_policy_id}/**':
            'header.x-monite-entity-id',
          '/entities/{entity_id}/documents': 'header.x-monite-version',
        },
      })
    ).toEqual([
      '--operation-predefined-parameters',
      '/approval_policies/{approval_policy_id}/**',
      'header.x-monite-entity-id',
      '--operation-predefined-parameters',
      '/entities/{entity_id}/documents',
      'header.x-monite-version',
    ]);
  });

  it('should parse objects with boolean and string key-value mappings', () => {
    expect(
      parseConfigToArgs({
        plugin: {
          'openapi-typescript': true,
          'tanstack-query-react': true,
          'redocly-react': 'minimal',
          'tanstack-query-react-debug-disabled': null,
          'tanstack-query-react-debug-false': false,
          'tanstack-query-react-debug-none': undefined,
        },
      })
    ).toEqual([
      '--plugin',
      'openapi-typescript',
      '--plugin',
      'tanstack-query-react',
      '--plugin',
      'redocly-react',
      'minimal',
    ]);
  });

  it('should parse a config of mapped array values with nesting', () => {
    const args = parseConfigToArgs({
      array_of_maps: [
        { option_1: 'value_1' },
        { option_2: [{ level_1: 'level_value_1', level_2: 'level_value_2' }] },
      ],
    });

    expect(args).toEqual([
      '--array_of_maps',
      'option_1:value_1',
      '--array_of_maps',
      'option_2:level_1:level_value_1',
      'option_2:level_2:level_value_2',
    ]);
  });

  it('should parse complex nested structures', () => {
    expect(
      parseConfigToArgs({
        'create-api-client-fn': {
          createAPIClient: {
            filename: 'create-api-client',
            services: ['all'],
            callbacks: ['all'],
          },
          createUsersAPIClient: {
            services: ['users', 'profile'],
            callbacks: ['setQueryData', 'getQueryData', 'fetchQuery'],
          },
        },
      })
    ).toEqual([
      '--create-api-client-fn',
      'createAPIClient',
      'filename:create-api-client',
      'services:all',
      'callbacks:all',
      '--create-api-client-fn',
      'createUsersAPIClient',
      'services:users,profile',
      'callbacks:setQueryData,getQueryData,fetchQuery',
    ]);
  });

  it('should parse complex nested mappings', () => {
    expect(
      parseConfigToArgs({
        'override-import-type': {
          services: {
            '@openapi-qraft/tanstack-query-react-types': {
              ResultError: '../ResponseError',
              ResultSuccess: '../ResultSuccess',
            },
            '@openapi-qraft/react': {
              UseQueryOperation: '../UseQueryOperation',
            },
          },
          'create-client': {
            '@openapi-qraft/react': {
              UseQueryOperation: '../UseQueryOperation',
            },
          },
        },
      })
    ).toEqual([
      '--override-import-type',
      'services',
      '@openapi-qraft/tanstack-query-react-types:ResultError:../ResponseError',
      '@openapi-qraft/tanstack-query-react-types:ResultSuccess:../ResultSuccess',
      '@openapi-qraft/react:UseQueryOperation:../UseQueryOperation',
      '--override-import-type',
      'create-client',
      '@openapi-qraft/react:UseQueryOperation:../UseQueryOperation',
    ]);
  });
});
