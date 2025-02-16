import type transformer from '../migrate-to-v2-codemod.js';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('migrate-to-v2-codemod', () => {
  const transformPath = path.resolve('./src/migrate-to-v2-codemod.ts');
  const fixturePath =
    './src/tests/fixtures/migrate-to-v2-codemod/methods-and-hooks.tsx';

  it('transforms methods and hooks', async () => {
    const fs = await import('node:fs');
    const jscodeshiftModule = await import('jscodeshift');
    const jscodeshift = jscodeshiftModule.withParser('tsx');
    const transformerFunction = await import(transformPath).then(
      (module) => module.default as typeof transformer
    );

    expect(
      transformerFunction(
        {
          source: fs.readFileSync(fixturePath, 'utf-8'),
          path: fixturePath,
        },
        // @ts-expect-error - wrong types
        {
          jscodeshift,
          j: jscodeshift,
          stats: () => {},
        },
        {
          'api-client-variable-name': 'oldQraft',
        }
      )
    ).toMatchSnapshot();
  });

  it('compatible jscodeshift runner', async () => {
    // @ts-expect-error - no types
    const jscodeshift = await import('jscodeshift/src/Runner').then(
      ({ run }) => run
    );

    expect(
      await jscodeshift(transformPath, [fixturePath], {
        dry: true,
        print: false,
        verbose: 0,
        babel: true,
        parser: 'tsx',
        'api-client-variable-name': 'oldQraft',
      })
    ).toMatchObject({
      error: 0,
      nochange: 0,
      ok: 1,
      skip: 0,
      stats: {},
    });
  });
});
