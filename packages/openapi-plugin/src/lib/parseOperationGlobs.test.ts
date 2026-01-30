import { describe, expect, it } from 'vitest';
import { parseOperationGlobs } from './parseOperationGlobs.js';

describe('parseOperationGlobs(...)', () => {
  it('parses valid operation methods', () => {
    expect(parseOperationGlobs('post /**')).toEqual({
      methods: ['post'],
      pathGlobs: '/**',
    });
    expect(parseOperationGlobs('get,post,   put /**,/foo/bar')).toEqual({
      methods: ['get', 'post', 'put'],
      pathGlobs: '/**,/foo/bar',
    });
  });

  it('skips invalid operation methods', () => {
    expect(parseOperationGlobs('post,fetch??,foo?? /**')).toEqual({
      methods: ['post'],
      pathGlobs: '/**',
    });
  });
});
