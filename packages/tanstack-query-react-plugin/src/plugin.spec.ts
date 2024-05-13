import '@openapi-qraft/plugin/lib/vitestFsMock';

import fs from 'node:fs';
import { createRequire } from 'node:module';
import { beforeAll, describe, expect, test } from 'vitest';

describe('TanStack Query React Client Generation', () => {
  const openAPIDocumentFixturePath = createRequire(process.cwd()).resolve(
    '@openapi-qraft/test-fixtures/openapi.json'
  );

  beforeAll(async () => {
    const { QraftCommand } = await import(
      '@openapi-qraft/plugin/lib/QraftCommand'
    );
    const { plugin } = await import('./plugin.js');
    const command = new QraftCommand();
    plugin.setupCommand(command);

    await command.parseAsync([
      'dummy-node',
      'dummy-qraft-bin',
      openAPIDocumentFixturePath,
      '--clean',
      '-o',
      '/mock-fs',
      '--openapi-types-import-path',
      '../../openapi.js',
      '--explicit-import-extensions',
      '--export-openapi-types',
      '--filter-services',
      '/approval_policies/**,/entities/**,/files/**,!/internal/**',
    ]);
  });

  test('index.ts', async () => {
    expect(fs.readFileSync('/mock-fs/index.ts', 'utf-8')).toMatchFileSnapshot(
      './__snapshots__/index.ts.snapshot.ts'
    );
  });

  test('create-api-client.ts', async () => {
    expect(
      fs.readFileSync('/mock-fs/create-api-client.ts', 'utf-8')
    ).toMatchFileSnapshot('./__snapshots__/create-api-client.ts.snapshot.ts');
  });

  test('services/ApprovalPoliciesService.ts', async () => {
    expect(
      fs.readFileSync('/mock-fs/services/ApprovalPoliciesService.ts', 'utf-8')
    ).toMatchFileSnapshot(
      './__snapshots__/services/ApprovalPoliciesService.ts.snapshot.ts'
    );
  });

  test('services/FilesService.ts', async () => {
    expect(
      fs.readFileSync('/mock-fs/services/FilesService.ts', 'utf-8')
    ).toMatchFileSnapshot(
      './__snapshots__/services/FilesService.ts.snapshot.ts'
    );
  });

  test('services/index.ts', async () => {
    expect(
      fs.readFileSync('/mock-fs/services/index.ts', 'utf-8')
    ).toMatchFileSnapshot('./__snapshots__/services/index.ts.snapshot.ts');
  });
});
