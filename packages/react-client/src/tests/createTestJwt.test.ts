import { expect } from 'vitest';

import { jwtDecode } from '../lib/jwt-decode/index.js';
import { createTestJwt } from './createTestJwt.js';

describe('createTestJwt', () => {
  it('creates valid jwt', () => {
    expect(jwtDecode(createTestJwt({ exp: 123, iat: 100 }))).toEqual({
      exp: 123,
      iat: 100,
    });
  });
});
