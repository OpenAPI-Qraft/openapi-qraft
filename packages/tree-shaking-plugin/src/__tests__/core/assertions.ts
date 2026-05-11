import { expect } from 'vitest';

export function expectNoTransform(result: unknown) {
  expect(result).toBeNull();
}
