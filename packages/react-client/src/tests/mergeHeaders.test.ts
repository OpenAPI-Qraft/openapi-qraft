import type { HeadersOptions } from '../lib/requestFn.js';
import { describe, expect, it } from 'vitest';
import { mergeHeaders } from '../lib/requestFn.js';

describe('mergeHeaders', () => {
  it('returns an empty Headers instance when no arguments are provided', () => {
    const result = mergeHeaders();
    expect(result).toBeInstanceOf(Headers);
    expect(result.entries().next().done).toBeTruthy(); // Check if Headers instance is empty
  });

  it('ignores undefined headers', () => {
    const result = mergeHeaders(undefined, { 'X-Test': 'test' }, undefined);
    expect(result.get('X-Test')).toBe('test');
  });

  it('merges headers from Headers instances', () => {
    const headersInstance = new Headers({ 'X-Test': 'test' });
    const result = mergeHeaders(headersInstance);
    expect(result.get('X-Test')).toBe('test');
  });

  it('merges headers from plain objects', () => {
    const headersObject: HeadersOptions = { 'X-Test': 'test' };
    const result = mergeHeaders(headersObject);
    expect(result.get('X-Test')).toBe('test');
  });

  it('overwrites headers with the same name', () => {
    const headersObject1: HeadersOptions = { 'X-Test': 'test1' };
    const headersObject2: HeadersOptions = { 'X-Test': 'test2' };
    const result = mergeHeaders(headersObject1, headersObject2);
    expect(result.get('X-Test')).toBe('test2');
  });

  it('removes headers with a null value', () => {
    const headersObject: HeadersOptions = {
      'X-Test': 'test',
      'X-Remove': null,
    };
    const result = mergeHeaders(headersObject);
    expect(result.get('X-Test')).toBe('test');
    expect(result.get('X-Remove')).toBeNull();
  });
});
