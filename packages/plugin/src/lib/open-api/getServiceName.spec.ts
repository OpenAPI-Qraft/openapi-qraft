import { describe, expect, it } from 'vitest';
import { getServiceName } from './getServiceName.js';

describe('getServiceName', () => {
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
