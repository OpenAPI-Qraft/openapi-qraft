import '@qraft/test-utils/vitestFsMock';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { createFileHeader } from '@qraft/cli-utils';
import { describe, expect, it, test } from 'vitest';
import { asyncapiTypesFileNameOptionParser } from './plugin.js';

describe.skip('asyncapi-typescript types generation', () => {
  const asyncAPIDocumentFixturePath = createRequire(process.cwd()).resolve(
    '@openapi-qraft/test-fixtures/asyncapi.json'
  );

  test('no extra options', async () => {
    const { QraftCommand } = await import('@qraft/asyncapi-plugin');
    const { plugin } = await import('./plugin.js');
    const command = new QraftCommand(undefined, {
      defaultFileHeader: createFileHeader('@qraft/cli'),
    });
    plugin.setupCommand(command);

    await command.parseAsync([
      'dummy-node',
      'dummy-qraft-bin',
      asyncAPIDocumentFixturePath,
      '-o',
      '/mock-fs',
    ]);

    await expect(
      fs.readFileSync('/mock-fs/schema.ts', 'utf-8')
    ).toMatchFileSnapshot('./__snapshots__/no-extra-options.ts.snapshot.ts');
  });

  test('with --asyncapi-types-file-name', async () => {
    const { QraftCommand } = await import('@qraft/asyncapi-plugin');
    const { plugin } = await import('./plugin.js');
    const command = new QraftCommand(undefined, {
      defaultFileHeader: createFileHeader('@qraft/cli'),
    });
    plugin.setupCommand(command);

    await command.parseAsync([
      'dummy-node',
      'dummy-qraft-bin',
      asyncAPIDocumentFixturePath,
      '-o',
      '/mock-fs',
      '--asyncapi-types-file-name',
      'asyncapi.ts',
    ]);

    await expect(
      fs.readFileSync('/mock-fs/asyncapi.ts', 'utf-8')
    ).toMatchFileSnapshot(
      './__snapshots__/with-asyncapi-types-file-name.ts.snapshot.ts'
    );
  });

  test('with --enum', async () => {
    const { QraftCommand } = await import('@qraft/asyncapi-plugin');
    const { plugin } = await import('./plugin.js');
    const command = new QraftCommand(undefined, {
      defaultFileHeader: createFileHeader('@qraft/cli'),
    });
    plugin.setupCommand(command);

    await command.parseAsync([
      'dummy-node',
      'dummy-qraft-bin',
      asyncAPIDocumentFixturePath,
      '-o',
      '/mock-fs',
      '--enum',
    ]);

    await expect(
      fs.readFileSync('/mock-fs/schema.ts', 'utf-8')
    ).toMatchFileSnapshot('./__snapshots__/with-enum.ts.snapshot.ts');
  });

  test('with --enum-values', async () => {
    const { QraftCommand } = await import('@qraft/asyncapi-plugin');
    const { plugin } = await import('./plugin.js');
    const command = new QraftCommand(undefined, {
      defaultFileHeader: createFileHeader('@qraft/cli'),
    });
    plugin.setupCommand(command);

    await command.parseAsync([
      'dummy-node',
      'dummy-qraft-bin',
      asyncAPIDocumentFixturePath,
      '-o',
      '/mock-fs',
      '--enum-values',
    ]);

    await expect(
      fs.readFileSync('/mock-fs/schema.ts', 'utf-8')
    ).toMatchFileSnapshot('./__snapshots__/with-enum-values.ts.snapshot.ts');
  });

  test('with --immutable', async () => {
    const { QraftCommand } = await import('@qraft/asyncapi-plugin');
    const { plugin } = await import('./plugin.js');
    const command = new QraftCommand(undefined, {
      defaultFileHeader: createFileHeader('@qraft/cli'),
    });
    plugin.setupCommand(command);

    await command.parseAsync([
      'dummy-node',
      'dummy-qraft-bin',
      asyncAPIDocumentFixturePath,
      '-o',
      '/mock-fs',
      '--immutable',
    ]);

    await expect(
      fs.readFileSync('/mock-fs/schema.ts', 'utf-8')
    ).toMatchFileSnapshot('./__snapshots__/with-immutable.ts.snapshot.ts');
  });
});

describe('asyncapiTypesFileNameOptionParser', () => {
  it('should return the input value if valid', () => {
    expect(asyncapiTypesFileNameOptionParser('asyncapi.ts')).toBe(
      'asyncapi.ts'
    );
    expect(asyncapiTypesFileNameOptionParser('asyncapi.d.ts')).toBe(
      'asyncapi.d.ts'
    );
  });

  it('should throw an error if the input value is invalid', () => {
    expect(() => asyncapiTypesFileNameOptionParser('asyncapi.js')).toThrowError(
      'AsyncAPI Schema types file name must end with ".ts" or ".d.ts"'
    );
  });

  it('should throw an error if the input value includes path', () => {
    expect(() =>
      asyncapiTypesFileNameOptionParser('path/asyncapi.ts')
    ).toThrowError('AsyncAPI Schema types file name must not include path');

    expect(() =>
      asyncapiTypesFileNameOptionParser('path\\asyncapi.ts')
    ).toThrowError('AsyncAPI Schema types file name must not include path');
  });

  it('should throw an error if the input value starts with "."', () => {
    expect(() =>
      asyncapiTypesFileNameOptionParser('.asyncapi.ts')
    ).toThrowError('AsyncAPI Schema types file name must not start with "."');
  });
});
