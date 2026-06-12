import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import * as t from '@babel/types';
import { describe, expect, it } from 'vitest';
import {
  createFixtureModuleAccess,
  writeFixtureFiles,
} from '../../__tests__/core/fixtures.js';
import { readExportedDeclarationChain } from './exported-declarations.js';

describe('readExportedDeclarationChain', () => {
  it('follows aliased re-export chains', async () => {
    const root = await createTempFixture();
    await writeFixtureFiles(root, {
      'src/api/index.ts': `
export { createAPIClient as myAPIClient } from './barrel';
`,
      'src/api/barrel.ts': `
export { createAPIClient } from './createAPIClient';
`,
      'src/api/createAPIClient.ts': `
export function createAPIClient() {
  return null;
}
`,
    });

    const result = await readExportedDeclarationChain(
      path.join(root, 'src/api/index.ts'),
      'myAPIClient',
      createFixtureModuleAccess(root)
    );

    expect(result?.sourceFile).toBe(
      path.join(root, 'src/api/createAPIClient.ts')
    );
    expect(result?.sourceLoadId).toBe(
      path.join(root, 'src/api/createAPIClient.ts')
    );
    expect(t.isFunctionDeclaration(result?.init)).toBe(true);
  });
});

async function createTempFixture() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'qraft-exported-declarations-'));
}
