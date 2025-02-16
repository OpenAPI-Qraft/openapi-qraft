import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientFetchMethod.js';

describe('callQueryClientFetchMethod', () => {
  it('should throw and error when parameters and queryKey are both provided', () => {
    const queryClient = new QueryClient();

    expect(() => {
      callQueryClientMethodWithQueryKey(
        {
          queryClient,
          requestFn: () => Promise.resolve({} as never),
          baseUrl: 'https://example.com',
        },
        'fetchQuery',
        { url: 'https://example.com', method: 'get' },
        false,
        [
          {
            parameters: { key: 'value' },
            queryKey: ['key'],
            requestFn: () =>
              Promise.resolve({
                data: {},
                response: new Response(),
              }),
            baseUrl: 'https://example.com',
          },
          queryClient,
        ]
      );
    }).toThrow(
      'callQueryClientMethodWithQueryKey: options.queryKey and options.parameters are mutually exclusive'
    );
  });

  it('should throw and error when requestFn and queryFn are both provided', () => {
    const queryClient = new QueryClient();

    expect(() => {
      callQueryClientMethodWithQueryKey(
        {
          queryClient,
          requestFn: () => Promise.resolve({} as never),
          baseUrl: 'https://example.com',
        },
        'fetchQuery',
        { url: 'https://example.com', method: 'get' },
        false,
        [
          {
            queryKey: ['key'],
            requestFn: () =>
              Promise.resolve({
                data: {},
                response: new Response(),
              }),
            queryFn: () => Promise.resolve({}),
          },
          queryClient,
        ]
      );
    }).toThrow(
      'callQueryClientMethodWithQueryKey: options.queryFn and options.requestFn are mutually exclusive'
    );
  });
});
