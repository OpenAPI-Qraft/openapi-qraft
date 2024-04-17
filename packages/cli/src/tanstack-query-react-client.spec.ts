import mockFs from 'mock-fs';
import type FileSystem from 'mock-fs/lib/filesystem.js';
import path from 'node:path';
import process from 'node:process';
import { afterAll, beforeAll, describe, test } from 'vitest';

import { program } from './bin.js';

describe('TanStack Query React Client Generation', () => {
  const mockFiles = loadInitialMockFiles();

  beforeAll(() => {
    mockFs(mockFiles);

    program.parse([
      'dummy-node',
      'dummy-qraft-bin',
      'src/lib/__fixtures__/openapi.json',
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
    (
      await import(
        './lib/__snapshots__/tanstack-query-react-client/index.ts.__snapshot__.spec.js'
      )
    ).default();
  });

  test('create-api-client.ts', async () => {
    (
      await import(
        './lib/__snapshots__/tanstack-query-react-client/create-api-client.ts.__snapshot__.spec.js'
      )
    ).default();
  });

  test('services/ApprovalPoliciesService.ts', async () => {
    (
      await import(
        './lib/__snapshots__/tanstack-query-react-client/services/ApprovalPoliciesService.ts.__snapshot__.spec.js'
      )
    ).default();
  });

  test('services/FilesService.ts', async () => {
    (
      await import(
        './lib/__snapshots__/tanstack-query-react-client/services/FilesService.ts.__snapshot__.spec.js'
      )
    ).default();
  });

  test('services/index.ts', async () => {
    (
      await import(
        './lib/__snapshots__/tanstack-query-react-client/services/index.ts.__snapshot__.spec.js'
      )
    ).default();
  });
});

function loadInitialMockFiles() {
  const filesToLoad = ['src/lib/__fixtures__/openapi.json', 'package.json'];

  return filesToLoad.reduce<Record<string, FileSystem.DirectoryItem>>(
    (acc, file) => {
      const filePath = path.resolve(process.cwd(), file);
      acc[filePath] = mockFs.load(filePath);
      return acc;
    },
    {}
  );
}
