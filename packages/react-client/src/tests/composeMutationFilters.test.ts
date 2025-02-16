import { describe, expect, it } from 'vitest';
import { composeMutationFilters } from '../lib/composeMutationFilters.js';

describe('composeMutationFilters', () => {
  const predicate = (value: unknown): value is object =>
    typeof value === 'object';

  const schema = {
    url: '/files',
    method: 'post',
  } as const;

  it('should return filters with default mutationKey', () => {
    const result = composeMutationFilters(schema, undefined);

    expect(result).toEqual({
      mutationKey: [schema, {}],
    });
  });

  it('should return filters with default mutationKey and predicate', () => {
    const result = composeMutationFilters(schema, { predicate });

    expect(result).toEqual({
      mutationKey: [schema, {}],
      predicate,
    });
  });

  it('should return filters with predefined mutationKey', () => {
    const mutationKey = [
      {
        url: '/posts',
        method: 'post',
      },
      {},
    ];

    const result = composeMutationFilters(schema, { mutationKey, predicate });

    expect(result).toEqual({ mutationKey, predicate });
  });

  it('should return filters with predefined parameters', () => {
    const parameters = {
      path: {
        id: 1,
      },
    };

    const result = composeMutationFilters(schema, { parameters, predicate });

    expect(result).toEqual({ mutationKey: [schema, parameters], predicate });
  });

  it('should throw error if both mutationKey and parameters are provided', () => {
    expect(() =>
      composeMutationFilters(schema, {
        mutationKey: [schema, {}],
        parameters: {
          path: {
            id: 1,
          },
        },
      })
    ).toThrow(
      `'composeMutationFilters': 'mutationKey' and 'parameters' cannot be used together`
    );
  });
});
