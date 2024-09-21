import { describe, expect, it } from 'vitest';
import { reduceUrlByEndpointPartIndex } from './getOperationName.js';
import { getServiceName } from './getServiceName.js';

describe('# getServiceName', () => {
  describe('getServiceName()', () => {
    it('should produce correct result', () => {
      expect(getServiceName('')).toEqual('');
      expect(getServiceName('FooBar')).toEqual('FooBar');
      expect(getServiceName('Foo Bar')).toEqual('FooBar');
      expect(getServiceName('foo bar')).toEqual('FooBar');
      expect(getServiceName('@fooBar')).toEqual('FooBar');
      expect(getServiceName('$fooBar')).toEqual('FooBar');
      expect(getServiceName('123fooBar')).toEqual('FooBar');
      expect(getServiceName('foo-bar')).toEqual('FooBar');
      expect(getServiceName('foo bar')).toEqual('FooBar');
      expect(getServiceName('foo_bar')).toEqual('FooBar');
    });
  });

  describe('reduceUrlByEndpointPartIndex()', () => {
    it('should produce correct result', () => {
      expect(
        reduceUrlByEndpointPartIndex('/api/v1/users', 'endpoint[2]')
      ).toEqual('/users');
      expect(
        reduceUrlByEndpointPartIndex('api/v1/users', 'endpoint[1]')
      ).toEqual('v1/users');
    });
  });
});
