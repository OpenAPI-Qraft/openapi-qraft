import type { ServiceOperation } from '@openapi-qraft/plugin/lib/open-api/OpenAPIService';
import { describe, expect, test } from 'vitest';
import { shouldUseParametersWrapper } from './getServiceFactory.js';

describe('shouldUseParametersWrapper(...)', () => {
  const createMockOperation = (
    method: ServiceOperation['method'],
    path: string
  ): ServiceOperation => ({
    method,
    path,
    name: 'testOperation',
    description: undefined,
    summary: undefined,
    deprecated: undefined,
    errors: {},
    success: {},
    parameters: undefined,
    requestBody: undefined,
    security: undefined,
  });

  test('returns null when operationParametersTypeWrapper is undefined', () => {
    const operation = createMockOperation('get', '/api/users');
    expect(shouldUseParametersWrapper(operation, undefined)).toBeNull();
  });

  test('returns null when operationParametersTypeWrapper is empty object', () => {
    const operation = createMockOperation('get', '/api/users');
    expect(shouldUseParametersWrapper(operation, {})).toBeNull();
  });

  test('returns config when pattern matches path without method', () => {
    const operation = createMockOperation('get', '/api/users');
    const operationParametersTypeWrapper = {
      '/api/**': {
        type: 'ParametersWrapper',
        import: '../types/ParametersWrapper',
      },
    };

    const result = shouldUseParametersWrapper(
      operation,
      operationParametersTypeWrapper
    );
    expect(result).toEqual({
      type: 'ParametersWrapper',
      import: '../types/ParametersWrapper',
    });
  });

  test('returns config when pattern matches path with method', () => {
    const operation = createMockOperation('post', '/api/users');
    const operationParametersTypeWrapper = {
      'post /api/**': {
        type: 'WriteParametersWrapper',
        import: '../types/WriteParametersWrapper',
      },
    };

    const result = shouldUseParametersWrapper(
      operation,
      operationParametersTypeWrapper
    );
    expect(result).toEqual({
      type: 'WriteParametersWrapper',
      import: '../types/WriteParametersWrapper',
    });
  });

  test('returns null when method does not match', () => {
    const operation = createMockOperation('get', '/api/users');
    const operationParametersTypeWrapper = {
      'post /api/**': {
        type: 'WriteParametersWrapper',
        import: '../types/WriteParametersWrapper',
      },
    };

    expect(
      shouldUseParametersWrapper(operation, operationParametersTypeWrapper)
    ).toBeNull();
  });

  test('returns null when path does not match', () => {
    const operation = createMockOperation('post', '/api/users');
    const operationParametersTypeWrapper = {
      'post /api/admin/**': {
        type: 'AdminParametersWrapper',
        import: '../types/AdminParametersWrapper',
      },
    };

    expect(
      shouldUseParametersWrapper(operation, operationParametersTypeWrapper)
    ).toBeNull();
  });

  test('returns config when pattern matches with multiple methods', () => {
    const operation = createMockOperation('put', '/api/users');
    const operationParametersTypeWrapper = {
      'post,put /api/**': {
        type: 'WriteParametersWrapper',
        import: '../types/WriteParametersWrapper',
      },
    };

    const result = shouldUseParametersWrapper(
      operation,
      operationParametersTypeWrapper
    );
    expect(result).toEqual({
      type: 'WriteParametersWrapper',
      import: '../types/WriteParametersWrapper',
    });
  });

  test('returns config for first matching pattern', () => {
    const operation = createMockOperation('get', '/api/users');
    const operationParametersTypeWrapper = {
      '/api/admin/**': {
        type: 'AdminParametersWrapper',
        import: '../types/AdminParametersWrapper',
      },
      '/api/**': {
        type: 'ParametersWrapper',
        import: '../types/ParametersWrapper',
      },
    };

    const result = shouldUseParametersWrapper(
      operation,
      operationParametersTypeWrapper
    );
    // Should match the first pattern that matches
    expect(result).toEqual({
      type: 'ParametersWrapper',
      import: '../types/ParametersWrapper',
    });
  });

  test('returns null when path matches but method does not match in multiple method pattern', () => {
    const operation = createMockOperation('delete', '/api/users');
    const operationParametersTypeWrapper = {
      'post,put /api/**': {
        type: 'WriteParametersWrapper',
        import: '../types/WriteParametersWrapper',
      },
    };

    expect(
      shouldUseParametersWrapper(operation, operationParametersTypeWrapper)
    ).toBeNull();
  });

  test('handles specific path patterns', () => {
    const operation = createMockOperation(
      'delete',
      '/approval_policies/{approval_policy_id}'
    );
    const operationParametersTypeWrapper = {
      'delete /approval_policies/{approval_policy_id}': {
        type: 'ParametersWrapper',
        import: '../../type-overrides/parameters-wrapper.js',
      },
    };

    const result = shouldUseParametersWrapper(
      operation,
      operationParametersTypeWrapper
    );
    expect(result).toEqual({
      type: 'ParametersWrapper',
      import: '../../type-overrides/parameters-wrapper.js',
    });
  });

  test('handles patterns with wildcards in path', () => {
    const operation = createMockOperation('get', '/api/users/123');
    const operationParametersTypeWrapper = {
      'get /api/users/*': {
        type: 'UserParametersWrapper',
        import: '../types/UserParametersWrapper',
      },
    };

    const result = shouldUseParametersWrapper(
      operation,
      operationParametersTypeWrapper
    );
    expect(result).toEqual({
      type: 'UserParametersWrapper',
      import: '../types/UserParametersWrapper',
    });
  });

  test('returns null for exact path mismatch', () => {
    const operation = createMockOperation('get', '/api/users');
    const operationParametersTypeWrapper = {
      'get /api/posts': {
        type: 'PostParametersWrapper',
        import: '../types/PostParametersWrapper',
      },
    };

    expect(
      shouldUseParametersWrapper(operation, operationParametersTypeWrapper)
    ).toBeNull();
  });
});
