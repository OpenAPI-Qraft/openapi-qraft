import { describe, expect, it } from 'vitest';
import { shallowEqualObjects } from '../Unstable_QraftSecureRequestFn.js';

describe('shallowCompare', () => {
  it('should return true if the objects are the same', () => {
    expect(shallowEqualObjects({ foo: 'bar' }, { foo: 'bar' })).toBe(true);
  });

  it('should return true if the types are the same', () => {
    expect(shallowEqualObjects('new', 'new')).toBe(true);
  });

  it('should return false if the types are different', () => {
    expect(shallowEqualObjects('baz', { foo: 'bar' })).toBe(false);
  });

  it('should return false object are not the same', () => {
    expect(shallowEqualObjects({ foo: 'bar' }, { bar: 'foo' })).toBe(false);
  });

  it('should return false if the objects are not the same length', () => {
    expect(
      shallowEqualObjects({ foo: 'bar' }, { foo: 'bar', bar: 'foo' })
    ).toBe(false);
  });
});
