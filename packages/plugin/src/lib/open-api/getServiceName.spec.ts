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
    it('produces correct result if the path has the same number of segments as the endpoint index', () => {
      expect(
        reduceUrlByEndpointPartIndex('/api/v1/users', 'endpoint[2]')
      ).toEqual('/');
    });

    it('produces correct result if the path has more segments than the endpoint index', () => {
      expect(
        reduceUrlByEndpointPartIndex('/api/v1/users/all', 'endpoint[2]')
      ).toEqual('/all');
    });

    it('produces correct result if the path has more segments than the endpoint index and no leading slash', () => {
      expect(
        reduceUrlByEndpointPartIndex('api/v1/users/all', 'endpoint[2]')
      ).toEqual('all');

      expect(
        reduceUrlByEndpointPartIndex('api/v1/users', 'endpoint[1]')
      ).toEqual('users');
    });

    it('produces correct result if the path has the same number of segments as the endpoint index and no leading slash', () => {
      expect(reduceUrlByEndpointPartIndex('users', 'endpoint[0]')).toEqual('');
    });

    it('throws an error if the path has fewer segments than the endpoint index', () => {
      expect(() =>
        reduceUrlByEndpointPartIndex('/v1/users', 'endpoint[2]')
      ).toThrowError(
        "Invalid service name base 'endpoint[2]'. The path '/v1/users' does not contain enough segments to generate a service name."
      );
    });
  });
});
