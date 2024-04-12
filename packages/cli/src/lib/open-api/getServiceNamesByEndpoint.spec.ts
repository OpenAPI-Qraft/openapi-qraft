import { describe, expect, it } from 'vitest';

import {
  getEndpointPartIndex,
  getServiceBaseNameByOperationEndpoint,
  getServiceNamesByOperationEndpoint,
} from './getServiceNamesByOperationEndpoint.js';

describe('getEndpointPartIndex(...)', () => {
  it('parses valid index', () => {
    expect(getEndpointPartIndex('endpoint[1]')).toEqual(1);
    expect(getEndpointPartIndex('endpoint[123]')).toEqual(123);
  });

  it('should throw on invalid cases', () => {
    // @ts-expect-error
    expect(() => getEndpointPartIndex('endpoint')).toThrow();
    // @ts-expect-error
    expect(() => getEndpointPartIndex('endpoints')).toThrow();
    // @ts-expect-error
    expect(() => getEndpointPartIndex('endpoints[1]')).toThrow();
    // @ts-expect-error
    expect(() => getEndpointPartIndex('endpoint[1')).toThrow();
    // @ts-expect-error
    expect(() => getEndpointPartIndex('endpoint1]')).toThrow();
    // @ts-expect-error
    expect(() => getEndpointPartIndex('[1]')).toThrow();
  });
});

describe('getServiceBaseNameByOperationEndpoint(...)', () => {
  it('returns valid endpoint base name', () => {
    expect(
      getServiceBaseNameByOperationEndpoint('foo/bar', 'endpoint[0]')
    ).toEqual('foo');
    expect(
      getServiceBaseNameByOperationEndpoint('foo/bar', 'endpoint[1]')
    ).toEqual('bar');
    expect(
      getServiceBaseNameByOperationEndpoint('foo/bar', 'endpoint[2]')
    ).toEqual('bar');
    expect(
      getServiceBaseNameByOperationEndpoint('foo/bar/baz', 'endpoint[3]')
    ).toEqual('baz');
  });

  it('should throw on invalid cases', () => {
    expect(() =>
      // @ts-expect-error
      getServiceBaseNameByOperationEndpoint('foo/bar', '[1]')
    ).toThrow();
  });
});

describe('getServiceNamesByOperationEndpoint(...)', () => {
  it('returns fallback service name', () => {
    expect(
      getServiceNamesByOperationEndpoint('/', 'endpoint[1]', 'fallback')
    ).toEqual(['Fallback']);
  });
});
