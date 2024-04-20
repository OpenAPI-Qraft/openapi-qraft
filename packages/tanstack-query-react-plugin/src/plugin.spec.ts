import { QraftCommand } from '@openapi-qraft/plugin/lib/QraftCommand';

import mockFs from 'mock-fs';
import type FileSystem from 'mock-fs/lib/filesystem.js';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { afterAll, beforeAll, describe, test } from 'vitest';

import { plugin } from './plugin.js';

describe('TanStack Query React Client Generation', () => {
  const nodeRequire = createRequire(process.cwd());
  const openAPIDocumentFixturePath = nodeRequire.resolve(
    '@openapi-qraft/test-fixtures/openapi.json'
  );

  const mockFiles = loadInitialMockFiles();

  beforeAll(() => {
    mockFs(mockFiles);
    const command = new QraftCommand();
    plugin.setupCommand(command);
    command.parse([
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

  afterAll(() => mockFs.restore());

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

  function loadInitialMockFiles() {
    const filesToLoad = [openAPIDocumentFixturePath, 'package.json'];

    return filesToLoad.reduce<Record<string, FileSystem.DirectoryItem>>(
      (acc, file) => {
        const filePath = path.resolve(process.cwd(), file);
        acc[filePath] = mockFs.load(filePath);
        return acc;
      },
      {}
    );
  }
});
