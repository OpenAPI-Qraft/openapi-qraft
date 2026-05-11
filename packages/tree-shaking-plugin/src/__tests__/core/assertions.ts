import { expect } from 'vitest';

export function expectNoTransform(result: unknown) {
  expect(result).toBeNull();
}

export function expectCodeToContainAll(code: string, tokens: string[]) {
  for (const token of tokens) {
    expect(code).toContain(token);
  }
}
