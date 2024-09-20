import { describe, expect, it } from 'vitest';
import { getOperationName } from './getOperationName.js';

describe('getOperationName', () => {
  it('should produce correct result', () => {
    expect(
      getOperationName('/api/v1/users', 'GET', 'GetAllUsers', 'tags')
    ).toEqual('getAllUsers');
    expect(getOperationName('/api/v1/users', 'GET', undefined, 'tags')).toEqual(
      'getApiV1Users'
    );
    expect(
      getOperationName('/api/v1/users', 'POST', undefined, 'tags')
    ).toEqual('postApiV1Users');
    expect(
      getOperationName('/api/v1/users/{id}', 'GET', undefined, 'tags')
    ).toEqual('getApiV1UsersId');
    expect(
      getOperationName('/api/v1/users/{id}', 'POST', undefined, 'endpoint[0]')
    ).toEqual('postApiV1UsersId');
    expect(
      getOperationName('/api/v1/users/{id}/{key}', 'POST', undefined, 'tags')
    ).toEqual('postApiV1UsersIdKey');
    expect(
      getOperationName(
        '/api/v1/users/{id}/{key}',
        'POST',
        undefined,
        'endpoint[2]'
      )
    ).toEqual('postUsersIdKey');

    expect(getOperationName('/users', 'GET', 'fooBar', 'tags')).toEqual(
      'fooBar'
    );
    expect(getOperationName('/users', 'GET', 'FooBar', 'tags')).toEqual(
      'fooBar'
    );
    expect(getOperationName('/users', 'GET', 'Foo Bar', 'tags')).toEqual(
      'fooBar'
    );
    expect(getOperationName('/users', 'GET', 'foo bar', 'tags')).toEqual(
      'fooBar'
    );
    expect(getOperationName('/users', 'GET', 'foo-bar', 'tags')).toEqual(
      'fooBar'
    );
    expect(getOperationName('/users', 'GET', 'foo_bar', 'tags')).toEqual(
      'fooBar'
    );
    expect(getOperationName('/users', 'GET', 'foo.bar', 'tags')).toEqual(
      'fooBar'
    );
    expect(getOperationName('/users', 'GET', '@foo.bar', 'tags')).toEqual(
      'fooBar'
    );
    expect(getOperationName('/users', 'GET', '$foo.bar', 'tags')).toEqual(
      'fooBar'
    );
    expect(getOperationName('/users', 'GET', '_foo.bar', 'tags')).toEqual(
      'fooBar'
    );
    expect(getOperationName('/users', 'GET', '-foo.bar', 'tags')).toEqual(
      'fooBar'
    );
    expect(getOperationName('/users', 'GET', '123.foo.bar', 'tags')).toEqual(
      'fooBar'
    );
    expect(getOperationName('/users', 'GET', '123.foo.bar', 'tags')).toEqual(
      'fooBar'
    );
  });

  expect(
    getOperationName('/api/v{api-version}/users', 'GET', undefined, 'tags')
  ).toEqual('getApiVapiVersionUsers');
});
