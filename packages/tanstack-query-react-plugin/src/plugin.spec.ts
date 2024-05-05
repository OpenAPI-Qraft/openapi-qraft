import '@openapi-qraft/plugin/lib/vitestFsMock';

import { createRequire } from 'node:module';
import { beforeAll, describe, test } from 'vitest';

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
      '--filter-services',
      '/approval_policies/**,/entities/**,/files/**,!/internal/**',
    ]);
  });

  test('index.ts', async () => {
    (await import('./__snapshots__/index.ts.snapshot.js')).default();
  });

  test('create-api-client.ts', async () => {
    (
      await import('./__snapshots__/create-api-client.ts.snapshot.js')
    ).default();
  });

  test('services/ApprovalPoliciesService.ts', async () => {
    (
      await import(
        './__snapshots__/services/ApprovalPoliciesService.ts.snapshot.js'
      )
    ).default();
  });

  test('services/FilesService.ts', async () => {
    (
      await import('./__snapshots__/services/FilesService.ts.snapshot.js')
    ).default();
  });

  test('services/index.ts', async () => {
    (await import('./__snapshots__/services/index.ts.snapshot.js')).default();
  });
});
