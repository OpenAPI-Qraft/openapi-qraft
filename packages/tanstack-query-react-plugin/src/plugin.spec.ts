import '@openapi-qraft/plugin/lib/vitestFsMock';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { beforeAll, describe, expect, test } from 'vitest';

describe('TanStack Query React Client Generation', () => {
  const openAPIDocumentFixturePath = createRequire(process.cwd()).resolve(
    '@openapi-qraft/test-fixtures/openapi.json'
  );

  describe('--export-openapi-types --explicit-import-extensions --filter-services <blob>', () => {
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
        './__snapshots__/explicit-import-extensions/index.ts.snapshot.ts'
      );
    });

    test('create-api-client.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/create-api-client.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/explicit-import-extensions/create-api-client.ts.snapshot.ts'
      );
    });

    test('services/ApprovalPoliciesService.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/services/ApprovalPoliciesService.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/explicit-import-extensions/services/ApprovalPoliciesService.ts.snapshot.ts'
      );
    });

    test('services/FilesService.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/services/FilesService.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/explicit-import-extensions/services/FilesService.ts.snapshot.ts'
      );
    });

    test('services/index.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/services/index.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/explicit-import-extensions/services/index.ts.snapshot.ts'
      );
    });
  });

  describe('no "--export-openapi-types"', () => {
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
        '../../openapi.d.ts',
      ]);
    });

    test('index.ts', async () => {
      expect(fs.readFileSync('/mock-fs/index.ts', 'utf-8')).toMatchFileSnapshot(
        './__snapshots__/no-export-openapi-types/index.ts.snapshot.ts'
      );
    });
  });

  describe('--openapi-types-import-path *.d.ts', () => {
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
        '--export-openapi-types',
        '--openapi-types-import-path',
        '../../openapi.d.ts',
      ]);
    });

    test('index.ts', async () => {
      expect(fs.readFileSync('/mock-fs/index.ts', 'utf-8')).toMatchFileSnapshot(
        './__snapshots__/openapi-types-import-path-d-ts/index.ts.snapshot.ts'
      );
    });
  });

  describe('--openapi-types-import-path *.ts', () => {
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
        '--export-openapi-types',
        '--openapi-types-import-path',
        '../../openapi.ts',
      ]);
    });

    test('index.ts', async () => {
      expect(fs.readFileSync('/mock-fs/index.ts', 'utf-8')).toMatchFileSnapshot(
        './__snapshots__/openapi-types-import-path-ts/index.ts.snapshot.ts'
      );
    });
  });

  describe('--explicit-import-extensions --openapi-types-import-path ./openapi.d.ts', () => {
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
        '--export-openapi-types',
        '--explicit-import-extensions',
        '--openapi-types-import-path',
        '../../openapi.d.ts',
      ]);
    });

    test('index.ts', async () => {
      expect(fs.readFileSync('/mock-fs/index.ts', 'utf-8')).toMatchFileSnapshot(
        './__snapshots__/explicit-import-extensions-d-ts-imports/index.ts.snapshot.ts'
      );
    });
  });

  describe('--operation-predefined-parameters <...patterns> --explicit-import-extensions --openapi-types-import-path ./openapi.d.ts', () => {
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
        '--export-openapi-types',
        '--explicit-import-extensions',
        '--openapi-types-import-path',
        '../../openapi.d.ts',
        '--operation-predefined-parameters',
        '/approval_policies/{approval_policy_id}/**:header.x-monite-entity-id',
        '/entities/{entity_id}/documents:header.x-monite-version',
      ]);
    });

    test('create-predefined-parameters-request-fn.ts', async () => {
      expect(
        fs.readFileSync(
          '/mock-fs/create-predefined-parameters-request-fn.ts',
          'utf-8'
        )
      ).toMatchFileSnapshot(
        './__snapshots__/operation-predefined-parameters/create-predefined-parameters-request-fn.ts.snapshot.ts'
      );
    });
  });
});
