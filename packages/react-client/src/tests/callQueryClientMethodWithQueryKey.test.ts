import { callQueryClientMethodWithQueryKey } from '../lib/callQueryClientMethodWithQueryKey.js';

describe('callQueryClientMethodWithQueryKey', () => {
  it('should throw and error when QueryClient is not provided', () => {
    expect(() => {
      callQueryClientMethodWithQueryKey(
        'getQueryData',
        { url: 'https://example.com', method: 'get' },
        false,
        [[], undefined as never]
      );
    }).toThrow('queryClient is required');
  });

  it('should throw and error when query client is invalid', () => {
    expect(() => {
      callQueryClientMethodWithQueryKey(
        'getQueryData',
        { url: 'https://example.com', method: 'get' },
        false,
        [[], {} as never]
      );
    }).toThrow('queryClient is invalid, getQueryData method does not exist');
  });
});
