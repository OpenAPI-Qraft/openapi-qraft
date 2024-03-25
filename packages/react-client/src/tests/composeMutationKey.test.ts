import { composeMutationKey } from '../lib/composeMutationKey.js';

describe('composeMutationKey', () => {
  it('should return mutation key with parameters', () => {
    const schema = {
      url: 'https://example.com',
      method: 'get',
    } as const;

    const parameters = {
      body: 'body',
      requestBody: 'requestBody',
      other: 'other',
    };
    const result = composeMutationKey(schema, parameters);

    expect(result).toEqual([
      {
        url: schema.url,
        method: schema.method,
      },
      {
        other: 'other',
      },
    ]);
  });

  it('should return mutation key without parameters', () => {
    const schema = {
      url: 'https://example.com',
      method: 'get',
    } as const;

    const result = composeMutationKey(schema, undefined);

    expect(result).toEqual([
      {
        url: schema.url,
        method: schema.method,
      },
      {},
    ]);
  });
});
