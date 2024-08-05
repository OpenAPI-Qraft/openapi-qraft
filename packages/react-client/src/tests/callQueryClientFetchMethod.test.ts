import { QueryClient } from '@tanstack/react-query';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';

describe('callQueryClientFetchMethod', () => {
  it('should throw and error when parameters and queryKey are both provided', () => {
    const queryClient = new QueryClient();

    expect(() => {
      callQueryClientMethodWithQueryKey(
        'fetchQuery',
        { url: 'https://example.com', method: 'get' },
        false,
        [
          {
            parameters: { key: 'value' },
            queryKey: ['key'],
            requestFn: () => Promise.resolve({}),
            baseUrl: 'https://example.com',
          },
          queryClient,
        ]
      );
    }).toThrow(
      'callQueryClientMethodWithQueryKey: options.queryKey and options.parameters are mutually exclusive'
    );
  });

  it('should throw and error when QueryClient is not provided', () => {
    expect(() => {
      callQueryClientMethodWithQueryKey(
        'fetchQuery',
        { url: 'https://example.com', method: 'get' },
        false,
        [{ queryKey: ['key'] }, undefined as never]
      );
    }).toThrow('queryClient is required');
  });

  it('should throw and error when requestFn and queryFn are both provided', () => {
    const queryClient = new QueryClient();

    expect(() => {
      callQueryClientMethodWithQueryKey(
        'fetchQuery',
        { url: 'https://example.com', method: 'get' },
        false,
        [
          {
            queryKey: ['key'],
            requestFn: () => Promise.resolve({}),
            queryFn: () => Promise.resolve({}),
            baseUrl: 'https://example.com',
          },
          queryClient,
        ]
      );
    }).toThrow(
      'callQueryClientMethodWithQueryKey: options.queryFn and requestFn are mutually exclusive'
    );
  });

  it('should not set queryFn, when requestFn and queryFn are both not provided', async () => {
    const queryClient = new QueryClient();

    await expect(
      new Promise((resolve, reject) => {
        try {
          resolve(
            callQueryClientMethodWithQueryKey(
              'fetchQuery',
              { url: 'https://example.com', method: 'get' },
              false,
              [{ queryKey: ['dummy'] }, queryClient]
            )
          );
        } catch (error) {
          reject(error);
        }
      })
    ).rejects.toThrow(`Missing queryFn: '["dummy"]'`);
  });

  it('should throw and error when query client is invalid', () => {
    expect(() => {
      callQueryClientMethodWithQueryKey(
        'fetchQuery',
        { url: 'https://example.com', method: 'get' },
        false,
        [
          {
            queryKey: ['key'],
            requestFn: () => Promise.resolve({}),
            queryFn: () => Promise.resolve({}),
            baseUrl: 'https://example.com',
          },
          {} as never,
        ]
      );
    }).toThrow('queryClient is invalid, fetchQuery method does not exist');
  });
});
