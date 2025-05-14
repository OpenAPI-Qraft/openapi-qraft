import type transformer from '../migrate-to-v2.6.0-codemod.js';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('migrate-to-v2.6.0-codemod', () => {
  const transformPath = path.resolve('./src/migrate-to-v2.6.0-codemod.ts');
  const genericsFixturePath =
    './src/tests/fixtures/migrate-to-v2.6.0-codemod/generics.tsx';
  const otherImportsFixturePath =
    './src/tests/fixtures/migrate-to-v2.6.0-codemod/other-imports.tsx';
  const mixedImportsFixturePath =
    './src/tests/fixtures/migrate-to-v2.6.0-codemod/mixed-imports.tsx';
  const customPackageFixturePath =
    './src/tests/fixtures/migrate-to-v2.6.0-codemod/custom-package.tsx';

  it('removes generics from API client', async () => {
    const fs = await import('node:fs');
    const jscodeshiftModule = await import('jscodeshift');
    const jscodeshift = jscodeshiftModule.withParser('tsx');
    const transformerFunction = await import(transformPath).then(
      (module) => module.default as typeof transformer
    );

    expect(
      transformerFunction(
        {
          source: fs.readFileSync(genericsFixturePath, 'utf-8'),
          path: genericsFixturePath,
        },
        // @ts-expect-error - wrong types
        {
          jscodeshift,
          j: jscodeshift,
          stats: () => {},
        },
        {}
      )
    ).toMatchSnapshot('generics fixture');
  });

  it('does not modify files where qraftAPIClient is imported from another package', async () => {
    const fs = await import('node:fs');
    const jscodeshiftModule = await import('jscodeshift');
    const jscodeshift = jscodeshiftModule.withParser('tsx');
    const transformerFunction = await import(transformPath).then(
      (module) => module.default as typeof transformer
    );

    const source = fs.readFileSync(otherImportsFixturePath, 'utf-8');
    const result = transformerFunction(
      {
        source,
        path: otherImportsFixturePath,
      },
      // @ts-expect-error - wrong types
      {
        jscodeshift,
        j: jscodeshift,
        stats: () => {},
      },
      {}
    );

    // Source code should not be modified
    expect(result).toEqual(source);
    expect(result).toMatchSnapshot('other imports fixture');
  });

  it('correctly handles mixed imports', async () => {
    const fs = await import('node:fs');
    const jscodeshiftModule = await import('jscodeshift');
    const jscodeshift = jscodeshiftModule.withParser('tsx');
    const transformerFunction = await import(transformPath).then(
      (module) => module.default as typeof transformer
    );

    expect(
      transformerFunction(
        {
          source: fs.readFileSync(mixedImportsFixturePath, 'utf-8'),
          path: mixedImportsFixturePath,
        },
        // @ts-expect-error - wrong types
        {
          jscodeshift,
          j: jscodeshift,
          stats: () => {},
        },
        {}
      )
    ).toMatchSnapshot('mixed imports fixture');
  });

  it('supports custom package name option', async () => {
    const fs = await import('node:fs');
    const jscodeshiftModule = await import('jscodeshift');
    const jscodeshift = jscodeshiftModule.withParser('tsx');
    const transformerFunction = await import(transformPath).then(
      (module) => module.default as typeof transformer
    );

    // Check that code is not modified with default settings (not our package)
    const source = fs.readFileSync(customPackageFixturePath, 'utf-8');
    const defaultResult = transformerFunction(
      {
        source,
        path: customPackageFixturePath,
      },
      // @ts-expect-error - wrong types
      {
        jscodeshift,
        j: jscodeshift,
        stats: () => {},
      },
      {}
    );

    // Code should not be modified with default settings
    expect(defaultResult).toEqual(source);

    // Check that code is modified when correct package name is specified
    const customResult = transformerFunction(
      {
        source,
        path: customPackageFixturePath,
      },
      // @ts-expect-error - wrong types
      {
        jscodeshift,
        j: jscodeshift,
        stats: () => {},
      },
      {
        packageName: '@custom/package',
      }
    );

    // Code should be modified when correct package name is specified
    expect(customResult).not.toEqual(source);
    expect(customResult).toMatchSnapshot('custom package fixture');
  });

  it(
    'compatible jscodeshift runner',
    async () => {
      // @ts-expect-error - no types
      const jscodeshift = await import('jscodeshift/src/Runner').then(
        ({ run }) => run
      );

      expect(
        await jscodeshift(transformPath, [genericsFixturePath], {
          dry: true,
          print: false,
          verbose: 0,
          babel: true,
          parser: 'tsx',
        })
      ).toMatchObject({
        error: 0,
        nochange: 0,
        ok: 1,
        skip: 0,
        stats: {},
      });

      // Check with custom package name
      expect(
        await jscodeshift(transformPath, [customPackageFixturePath], {
          dry: true,
          print: false,
          verbose: 0,
          babel: true,
          parser: 'tsx',
          packageName: '@custom/package',
        })
      ).toMatchObject({
        error: 0,
        nochange: 0,
        ok: 1,
        skip: 0,
        stats: {},
      });
    },
    { timeout: 10_000 }
  );
});
