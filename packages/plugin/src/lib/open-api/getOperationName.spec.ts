import { describe, expect, it } from 'vitest';
import { getOperationName } from './getOperationName.js';

describe('getOperationName', () => {
  it('should produce correct result', () => {
    expect(getOperationName('/api/v1/users', 'GET', 'GetAllUsers')).toEqual(
      'getAllUsers'
    );
    expect(getOperationName('/api/v1/users', 'GET', undefined)).toEqual(
      'getApiV1Users'
    );
    expect(getOperationName('/api/v1/users', 'POST', undefined)).toEqual(
      'postApiV1Users'
    );
    expect(getOperationName('/api/v1/users/{id}', 'GET', undefined)).toEqual(
      'getApiV1UsersId'
    );
    expect(getOperationName('/api/v1/users/{id}', 'POST', undefined)).toEqual(
      'postApiV1UsersId'
    );
    expect(
      getOperationName('/api/v1/users/{id}/{key}', 'POST', undefined)
    ).toEqual('postApiV1UsersIdKey');

    expect(getOperationName('/users', 'GET', 'fooBar')).toEqual('fooBar');
    expect(getOperationName('/users', 'GET', 'FooBar')).toEqual('fooBar');
    expect(getOperationName('/users', 'GET', 'Foo Bar')).toEqual('fooBar');
    expect(getOperationName('/users', 'GET', 'foo bar')).toEqual('fooBar');
    expect(getOperationName('/users', 'GET', 'foo-bar')).toEqual('fooBar');
    expect(getOperationName('/users', 'GET', 'foo_bar')).toEqual('fooBar');
    expect(getOperationName('/users', 'GET', 'foo.bar')).toEqual('fooBar');
    expect(getOperationName('/users', 'GET', '@foo.bar')).toEqual('fooBar');
    expect(getOperationName('/users', 'GET', '$foo.bar')).toEqual('fooBar');
    expect(getOperationName('/users', 'GET', '_foo.bar')).toEqual('fooBar');
    expect(getOperationName('/users', 'GET', '-foo.bar')).toEqual('fooBar');
    expect(getOperationName('/users', 'GET', '123.foo.bar')).toEqual('fooBar');
    expect(getOperationName('/users', 'GET', '123.foo.bar')).toEqual('fooBar');
  });

  expect(
    getOperationName('/api/v{api-version}/users', 'GET', undefined)
  ).toEqual('getApiVapiVersionUsers');
});
