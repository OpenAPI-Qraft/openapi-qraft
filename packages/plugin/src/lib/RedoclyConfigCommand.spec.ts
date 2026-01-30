import '@openapi-qraft/plugin/lib/vitestFsMock';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { describe, expect, test } from 'vitest';

describe('RedoclyConfigCommand', () => {
  const redoclyConfigPath =
    dirname(
      createRequire(process.cwd()).resolve(
        '@openapi-qraft/test-fixtures/openapi.json'
      )
    ) + '/redocly.yaml';

  test('processes only x-openapi-qraft options', async () => {
    const { RedoclyConfigCommand } = await import('./RedoclyConfigCommand.js');

    const command = new RedoclyConfigCommand();

    await expect(
      command.parseConfig(
        (processArgv, processArgvParseOptions) => [
          processArgv,
          processArgvParseOptions,
        ],
        ['--redocly', redoclyConfigPath],
        {
          from: 'user',
        }
      )
    ).resolves.toMatchInlineSnapshot(`
      [
        [
          [
            "main",
            "--redocly",
            "../test-fixtures/redocly.yaml",
            "--output-dir",
            "../test-fixtures/src/api",
            "--plugin",
            "tanstack-query-react",
            "--plugin",
            "openapi-typescript",
            "--clean",
            "--explicit-import-extensions",
            "--openapi-types-file-name",
            "openapi.ts",
            "--filter-services",
            "/approval_policies/**",
            "/entities/**",
            "/files/**",
            "!/internal/**",
            "--operation-predefined-parameters",
            "/approval_policies/{approval_policy_id}/**",
            "header.x-monite-entity-id",
            "--operation-predefined-parameters",
            "/entities/{entity_id}/documents",
            "header.x-monite-version",
            "--operation-name-modifier",
            "/files/list:[a-zA-Z]+List ==> findAll",
          ],
          {
            "from": "user",
          },
        ],
        [
          [
            "main@internal",
            "--redocly",
            "../test-fixtures/redocly.yaml",
            "--output-dir",
            "../test-fixtures/src/internal-api",
            "--plugin",
            "tanstack-query-react",
            "--plugin",
            "openapi-typescript",
            "--filter-services",
            "/internal/**",
          ],
          {
            "from": "user",
          },
        ],
      ]
    `);
  });

  test('processes specific API entry', async () => {
    const { RedoclyConfigCommand } = await import('./RedoclyConfigCommand.js');

    const command = new RedoclyConfigCommand();

    await expect(
      command.parseConfig(
        (processArgv, processArgvParseOptions) => [
          processArgv,
          processArgvParseOptions,
        ],
        [
          'dummy-node',
          'dummy-qraft-bin',
          'main@internal',
          '--redocly',
          redoclyConfigPath,
        ]
      )
    ).resolves.toMatchInlineSnapshot(`
      [
        [
          [
            "main@internal",
            "--redocly",
            "../test-fixtures/redocly.yaml",
            "--output-dir",
            "../test-fixtures/src/internal-api",
            "--plugin",
            "tanstack-query-react",
            "--plugin",
            "openapi-typescript",
            "--filter-services",
            "/internal/**",
          ],
          {
            "from": "user",
          },
        ],
      ]
    `);
  });

  test('fails when specific API entry is provided but not found', async () => {
    const { RedoclyConfigCommand } = await import('./RedoclyConfigCommand.js');

    const command = new RedoclyConfigCommand();

    await expect(
      command.parseConfig(
        (processArgv, processArgvParseOptions) => [
          processArgv,
          processArgvParseOptions,
        ],
        [
          'dummy-node',
          'dummy-qraft-bin',
          'main@internal',
          'not-existing-api',
          '--redocly',
          redoclyConfigPath,
        ]
      )
    ).rejects.toThrow(
      /not-existing-api.*not found in the Redocly configuration/i
    );
  });
});
