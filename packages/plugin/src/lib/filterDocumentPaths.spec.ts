import { describe, it, expect } from 'vitest';

import { createServicePathMatch } from './createServicePathMatch.js';

describe('createServicePathMatch', () => {
  it('should match with multiple include glob', () => {
    const isPathMatch = createServicePathMatch(['/user/**', '/post/**']);
    expect(isPathMatch('/user/1')).toBe(true);
    expect(isPathMatch('/user/1/approve')).toBe(true);
    expect(isPathMatch('/post/1')).toBe(true);
    expect(isPathMatch('/profile/1')).toBe(false);
  });

  it('should not match with inclusion pattern', () => {
    const isPathMatch = createServicePathMatch([
      '/user/**',
      '/post/**',
      '!/user/1',
    ]);
    expect(isPathMatch('/user/1')).toBe(false);
    expect(isPathMatch('/user/1/approve')).toBe(true);
    expect(isPathMatch('/post/1')).toBe(true);
    expect(isPathMatch('/profile/1')).toBe(false);
  });

  it('should not match if nothing is specified', () => {
    const isPathMatch = createServicePathMatch([]);
    expect(isPathMatch('/user/1')).toBe(false);
  });
});
