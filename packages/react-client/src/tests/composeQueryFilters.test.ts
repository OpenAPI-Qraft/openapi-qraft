import { composeQueryFilters } from '../lib/composeQueryFilters.js';

describe('composeQueryFilters', () => {
  const predicate = (value: unknown): value is object =>
    typeof value === 'object';

  const schema = {
    url: '/files',
    method: 'get',
  } as const;

  it('should return filters with default queryKey', () => {
    const result = composeQueryFilters(schema, undefined);

    expect(result).toEqual({
      queryKey: [{ ...schema, infinite: false }, {}],
    });
  });

  it('should return filters with default queryKey and predicate', () => {
    const result = composeQueryFilters(schema, { predicate, infinite: false });

    expect(result).toEqual({
      queryKey: [{ ...schema, infinite: false }, {}],
      predicate,
    });
  });

  it('should return filters with predefined queryKey', () => {
    const queryKey = [
      {
        url: '/posts',
        method: 'get',
      },
      {},
    ];

    const result = composeQueryFilters(schema, {
      queryKey,
      predicate,
      infinite: false,
    });

    expect(result).toEqual({ queryKey, predicate });
  });

  it('should return filters with predefined parameters', () => {
    const parameters = {
      path: {
        id: 1,
      },
    };

    const result = composeQueryFilters(schema, {
      parameters,
      predicate,
      infinite: false,
    });

    expect(result).toEqual({
      queryKey: [{ ...schema, infinite: false }, parameters],
      predicate,
    });
  });

  it('should throw error if both queryKey and parameters are provided', () => {
    expect(() =>
      composeQueryFilters(schema, {
        infinite: false,
        queryKey: [schema, {}],
        parameters: {
          path: {
            id: 1,
          },
        },
      })
    ).toThrow(
      `'composeQueryFilters': 'queryKey' and 'parameters' cannot be used together`
    );
  });
});
