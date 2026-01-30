import { describe, expect, it } from 'vitest';
import { getServiceNamesByOperationTags } from './getServiceNamesByOperationTags.js';

describe('getServiceNamesByOperationTags(...)', () => {
  it('should return all tags', () => {
    expect(getServiceNamesByOperationTags(['foo', 'bar'], 'fallback')).toEqual([
      'Foo',
      'Bar',
    ]);
  });

  it('should return fallback tags', () => {
    expect(getServiceNamesByOperationTags([], 'fallback')).toEqual([
      'Fallback',
    ]);
    expect(getServiceNamesByOperationTags(['--', '__'], 'fallback')).toEqual([
      'Fallback',
    ]);
  });
});
