import '@qraft/plugin/lib/vitestFsMock';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it, test } from 'vitest';
import { openapiTypesFileNameOptionParser } from './plugin.js';

describe('openapi-typescript types generation', () => {
  const openAPIDocumentFixturePath = createRequire(process.cwd()).resolve(
    '@openapi-qraft/test-fixtures/openapi.json'
  );

  test('no extra options', async () => {
    const { QraftCommand } =
      await import('@openapi-qraft/plugin/lib/QraftCommand');
    const { plugin } = await import('./plugin.js');
    const command = new QraftCommand();
    plugin.setupCommand(command);

    await command.parseAsync([
      'dummy-node',
      'dummy-qraft-bin',
      openAPIDocumentFixturePath,
      '-o',
      '/mock-fs',
    ]);

    expect(fs.readFileSync('/mock-fs/schema.ts', 'utf-8')).toMatchFileSnapshot(
      './__snapshots__/no-extra-options.ts.snapshot.ts'
    );
  });

  test('with extra options', async () => {
    const { QraftCommand } =
      await import('@openapi-qraft/plugin/lib/QraftCommand');
    const { plugin } = await import('./plugin.js');
    const command = new QraftCommand();
    plugin.setupCommand(command);

    await command.parseAsync([
      'dummy-node',
      'dummy-qraft-bin',
      openAPIDocumentFixturePath,
      '-o',
      '/mock-fs',
      '--openapi-types-file-name',
      'openapi.ts',
      '--no-blob-from-binary',
      '--filter-services',
      '/files/**',
    ]);

    expect(fs.readFileSync('/mock-fs/openapi.ts', 'utf-8')).toMatchFileSnapshot(
      './__snapshots__/with-extra-options.ts.snapshot.ts'
    );
  });

  test('with --explicit-component-exports', async () => {
    const { QraftCommand } =
      await import('@openapi-qraft/plugin/lib/QraftCommand');
    const { plugin } = await import('./plugin.js');
    const command = new QraftCommand();
    plugin.setupCommand(command);

    await command.parseAsync([
      'dummy-node',
      'dummy-qraft-bin',
      openAPIDocumentFixturePath,
      '-o',
      '/mock-fs',
      '--openapi-types-file-name',
      'openapi.ts',
      '--filter-services',
      '/files',
      '--explicit-component-exports',
    ]);

    expect(fs.readFileSync('/mock-fs/openapi.ts', 'utf-8')).toMatchFileSnapshot(
      './__snapshots__/with-explicit-component-exports.ts.snapshot.ts'
    );
  });

  test('with --explicit-component-exports and --enum', async () => {
    const { QraftCommand } =
      await import('@openapi-qraft/plugin/lib/QraftCommand');
    const { plugin } = await import('./plugin.js');
    const command = new QraftCommand();
    plugin.setupCommand(command);

    await command.parseAsync([
      'dummy-node',
      'dummy-qraft-bin',
      openAPIDocumentFixturePath,
      '-o',
      '/mock-fs',
      '--openapi-types-file-name',
      'openapi.ts',
      '--filter-services',
      '/files',
      '--enum',
      '--explicit-component-exports',
    ]);

    expect(fs.readFileSync('/mock-fs/openapi.ts', 'utf-8')).toMatchFileSnapshot(
      './__snapshots__/with-explicit-component-enum-exports.ts.snapshot.ts'
    );
  });
});

describe('openapiTypesFileNameOptionParser', () => {
  it('should return the input value if valid', () => {
    expect(openapiTypesFileNameOptionParser('schema.ts')).toBe('schema.ts');
    expect(openapiTypesFileNameOptionParser('schema.d.ts')).toBe('schema.d.ts');
  });

  it('should throw an error if the input value is invalid', () => {
    expect(() => openapiTypesFileNameOptionParser('schema.js')).toThrowError(
      'OpenAPI Schema types file name must end with ".ts" or ".d.ts"'
    );
  });

  it('should throw an error if the input value includes path', () => {
    expect(() =>
      openapiTypesFileNameOptionParser('path/schema.ts')
    ).toThrowError('OpenAPI Schema types file name must not include path');

    expect(() =>
      openapiTypesFileNameOptionParser('path\\schema.ts')
    ).toThrowError('OpenAPI Schema types file name must not include path');
  });

  it('should throw an error if the input value starts with "."', () => {
    expect(() => openapiTypesFileNameOptionParser('.schema.ts')).toThrowError(
      'OpenAPI Schema types file name must not start with "."'
    );
  });
});
