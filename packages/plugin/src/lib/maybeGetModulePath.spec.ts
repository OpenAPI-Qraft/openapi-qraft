import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { describe, test, expect } from 'vitest';

import { maybeGetModulePath } from './maybeGetModulePath.js';

describe('maybeGetModulePath', () => {
  const cwd = pathToFileURL(`${process.cwd()}/`);

  test('should return a module path', () => {
    expect(maybeGetModulePath('typescript', cwd)).toContain('typescript.js');
  });

  test('should return a module package.json path', () => {
    expect(maybeGetModulePath('typescript/package.json', cwd)).toContain(
      'package.json'
    );
  });

  test('should not return a module path if it does not exist', () => {
    expect(
      maybeGetModulePath('typescript-foo-bar-baz/package.json', cwd)
    ).not.toBeDefined();
  });
});
