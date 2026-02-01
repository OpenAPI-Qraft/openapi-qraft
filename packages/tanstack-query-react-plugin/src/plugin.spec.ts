import '@qraft/test-utils/vitestFsMock';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { beforeAll, describe, expect, test } from 'vitest';

describe('TanStack Query React Client Generation', () => {
  const openAPIDocumentFixturePath = createRequire(process.cwd()).resolve(
    '@openapi-qraft/test-fixtures/openapi.json'
  );

  describe('--export-openapi-types --explicit-import-extensions --filter-services <blob>', () => {
    beforeAll(async () => {
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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

  describe('--explicit-import-extensions .ts --openapi-types-import-path ./openapi.d.ts', () => {
    beforeAll(async () => {
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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
        '.ts',
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
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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

  describe('--override-import-type <...patterns> --operation-predefined-parameters <...patterns> --create-api-client-fn <...patterns>', () => {
    beforeAll(async () => {
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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
        '--operation-predefined-parameters',
        '/approval_policies/{approval_policy_id}/**:header.x-monite-entity-id',
        '/entities/{entity_id}/documents:header.x-monite-version',
        '--override-import-type',
        'createAPIClient',
        '@openapi-qraft/react:CreateAPIQueryClientOptions:../type-overrides/create-query-client-options.js',
        '--override-import-type',
        'create-api-operation-client',
        '@openapi-qraft/react:APIBasicClientServices:../type-overrides/create-query-client-options.js',
        '--override-import-type',
        'services',
        '@openapi-qraft/tanstack-query-react-types:OperationError:../../type-overrides/operation-error.js',
        '@tanstack/react-query:UseSuspenseQueryOptions:../../type-overrides/suspense-query.js',
        '@tanstack/react-query:UseSuspenseQueryResult:../../type-overrides/suspense-query.js',
        '@tanstack/react-query:UseInfiniteQueryResult:../../type-overrides/use-infinite-query-result.js',
        '--override-import-type',
        'create-predefined-parameters-request-fn',
        '@openapi-qraft/react:RequestFn:../type-overrides/qraft-predefined-parameters.js',
        '@openapi-qraft/react/qraftPredefinedParametersRequestFn:QraftPredefinedParameterValue:../type-overrides/qraft-predefined-parameters.js',
        '--create-api-client-fn',
        'createApiClient',
        '--create-api-client-fn',
        'createAPIClient',
        '--create-api-client-fn',
        'createAPIOperationClient',
        'callbacks:none',
        'services:all',
        'filename:create-api-operation-client',
      ]);
    });

    test('create-predefined-parameters-request-fn.ts', async () => {
      expect(
        fs.readFileSync(
          '/mock-fs/create-predefined-parameters-request-fn.ts',
          'utf-8'
        )
      ).toMatchFileSnapshot(
        './__snapshots__/override-import-type/create-predefined-parameters-request-fn.ts.snapshot.ts'
      );
    });

    test('createAPIClient.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/createAPIClient.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/override-import-type/createAPIClient.ts.snapshot.ts'
      );
    });

    test('create-api-operation-client.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/create-api-operation-client.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/override-import-type/create-api-operation-client.ts.snapshot.ts'
      );
    });

    test('services/ApprovalPoliciesService.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/services/ApprovalPoliciesService.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/override-import-type/services/ApprovalPoliciesService.ts.snapshot.ts'
      );
    });
  });

  describe('--queryable-write-operations', () => {
    beforeAll(async () => {
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
      const { plugin } = await import('./plugin.js');
      const command = new QraftCommand();
      plugin.setupCommand(command);

      await command.parseAsync([
        'dummy-node',
        'dummy-qraft-bin',
        openAPIDocumentFixturePath,
        '--queryable-write-operations',
        '--clean',
        '-o',
        '/mock-fs',
        '--export-openapi-types',
        '--explicit-import-extensions',
        '--openapi-types-import-path',
        '../../openapi.d.ts',
      ]);
    });

    test('generates POST services with an optional `body` in the parameters', async () => {
      expect(
        fs.readFileSync('/mock-fs/services/FilesService.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/queryable-write-operations/services/FilesService.ts.snapshot.ts'
      );
    });

    test('generates POST services that require a `body` in the parameters', async () => {
      expect(
        fs.readFileSync('/mock-fs/services/ApprovalPoliciesService.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/queryable-write-operations/services/ApprovalPoliciesService.ts.snapshot.ts'
      );
    });
  });

  describe('--operation-parameters-type-wrapper', () => {
    beforeAll(async () => {
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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
        '--operation-parameters-type-wrapper',
        'get /files/**',
        'type:ParametersWrapper',
        'import:../../type-overrides/parameters-wrapper.js',
        '--operation-parameters-type-wrapper',
        'delete /approval_policies/{approval_policy_id}',
        'type:ParametersWrapper',
        'import:../../type-overrides/parameters-wrapper.js',
      ]);
    });

    test('services/FilesService.ts with ParametersWrapper for get /files/**', async () => {
      expect(
        fs.readFileSync('/mock-fs/services/FilesService.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/operation-parameters-type-wrapper/services/FilesService.ts.snapshot.ts'
      );
    });

    test('services/ApprovalPoliciesService.ts with ParametersWrapper for delete operation', async () => {
      expect(
        fs.readFileSync('/mock-fs/services/ApprovalPoliciesService.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/operation-parameters-type-wrapper/services/ApprovalPoliciesService.ts.snapshot.ts'
      );
    });
  });

  describe('--create-api-client-fn creates multiple clients', () => {
    beforeAll(async () => {
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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
        '--create-api-client-fn',
        'createAPIClient',
        '--create-api-client-fn',
        'createAPIOperationClient',
        'callbacks:useQuery,useMutation',
        'services:none',
        'filename:create-api-operation-client',
      ]);
    });

    test('create-api-operation-client.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/create-api-operation-client.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/create-api-client-fn/multiple-clients-create-api-operation-client.ts.snapshot.ts'
      );
    });

    test('createAPIClient.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/createAPIClient.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/create-api-client-fn/multiple-clients-createAPIClient.ts.snapshot.ts'
      );
    });
  });

  describe('--create-api-client-fn with specific callbacks and custom filename', () => {
    beforeAll(async () => {
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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
        '--create-api-client-fn',
        'createAPIOperationClient',
        'callbacks:useQuery,useMutation',
        'filename:create-api-operation-client',
      ]);
    });

    test('create-api-operation-client.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/create-api-operation-client.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/create-api-client-fn/specific-hooks-create-api-operation-client.ts.snapshot.ts'
      );
    });
  });

  describe('--create-api-client-fn with "all" value', () => {
    beforeAll(async () => {
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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
        '--create-api-client-fn',
        'createAPIClient',
        'callbacks:all',
        'services:all',
      ]);
    });

    test('createAPIClient.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/createAPIClient.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/create-api-client-fn/all-createAPIClient.ts.snapshot.ts'
      );
    });
  });

  describe('--create-api-client-fn with "none" value', () => {
    beforeAll(async () => {
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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
        '--create-api-client-fn',
        'createAPIClient',
        'callbacks:none',
        'services:none',
      ]);
    });

    test('createAPIClient.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/createAPIClient.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/create-api-client-fn/none-createAPIClient.ts.snapshot.ts'
      );
    });
  });

  describe('default behavior (no --create-api-client-fn option)', () => {
    beforeAll(async () => {
      const { QraftCommand } =
        await import('@openapi-qraft/plugin/lib/QraftCommand');
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

    test('create-api-client.ts', async () => {
      expect(
        fs.readFileSync('/mock-fs/create-api-client.ts', 'utf-8')
      ).toMatchFileSnapshot(
        './__snapshots__/create-api-client-fn/default-create-api-client.ts.snapshot.ts'
      );
    });
  });
});
