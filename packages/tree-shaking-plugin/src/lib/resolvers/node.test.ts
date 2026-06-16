import '@qraft/test-utils/vitestFsMock';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { createNodeModuleAccess } from './node.js';

const realFs =
  await vi.importActual<typeof import('node:fs/promises')>(
    'node:fs/promises'
  );

async function createResolverFixtureRoot() {
  return realFs.realpath(
    await realFs.mkdtemp(path.join(os.tmpdir(), 'qraft-node-resolver-'))
  );
}

async function writeResolverFile(
  root: string,
  relativePath: string,
  content = ''
) {
  const filePath = path.join(root, relativePath);
  await realFs.mkdir(path.dirname(filePath), { recursive: true });
  await realFs.writeFile(filePath, content);
  return filePath;
}

async function writeResolverJson(
  root: string,
  relativePath: string,
  value: unknown
) {
  return writeResolverFile(root, relativePath, JSON.stringify(value, null, 2));
}

async function readResolverFile(filePath: string) {
  return realFs.readFile(filePath, 'utf8');
}

function slash(filePath: string) {
  return filePath.split(path.sep).join('/');
}

describe('createNodeModuleAccess', () => {
  it('loads files through the virtual filesystem mock', async () => {
    const virtualFile = '/virtual/qraft-node-resolver/src/api.ts';
    await fs.mkdir(path.dirname(virtualFile), { recursive: true });
    await fs.writeFile(virtualFile, 'export const marker = true;');
    const access = createNodeModuleAccess();

    await expect(access.load(`${virtualFile}?raw#factory`)).resolves.toBe(
      'export const marker = true;'
    );
  });

  it('resolves relative imports to TypeScript index files', async () => {
    const root = await createResolverFixtureRoot();
    const importer = await writeResolverFile(root, 'src/App.tsx');
    const apiIndex = await writeResolverFile(root, 'src/api/index.ts');
    const access = createNodeModuleAccess({ root });

    await expect(access.resolve('./api', importer)).resolves.toBe(apiIndex);
  });

  it('resolves JavaScript import specifiers to TypeScript source files', async () => {
    const root = await createResolverFixtureRoot();
    const importer = await writeResolverFile(root, 'src/App.ts');
    const apiSource = await writeResolverFile(root, 'src/api.ts');
    const access = createNodeModuleAccess({ root });

    await expect(access.resolve('./api.js', importer)).resolves.toBe(
      apiSource
    );
  });

  it('resolves TypeScript path aliases through tsconfig auto discovery', async () => {
    const root = await createResolverFixtureRoot();
    await writeResolverJson(root, 'tsconfig.json', {
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@api/*': ['src/api/*'],
        },
      },
    });
    const importer = await writeResolverFile(root, 'src/App.tsx');
    const apiIndex = await writeResolverFile(
      root,
      'src/api/generated/index.ts'
    );
    const access = createNodeModuleAccess({ root });

    await expect(access.resolve('@api/generated', importer)).resolves.toBe(
      apiIndex
    );
  });

  it('discovers tsconfig from nested package importers', async () => {
    const root = await createResolverFixtureRoot();
    await writeResolverJson(root, 'packages/app/tsconfig.json', {
      compilerOptions: {
        baseUrl: '.',
        paths: {
          '@app-api': ['src/api/index.ts'],
        },
      },
    });
    const importer = await writeResolverFile(root, 'packages/app/src/App.tsx');
    const apiIndex = await writeResolverFile(
      root,
      'packages/app/src/api/index.ts'
    );
    const access = createNodeModuleAccess({ root });

    await expect(access.resolve('@app-api', importer)).resolves.toBe(apiIndex);
  });

  it('resolves package subpaths through package exports', async () => {
    const root = await createResolverFixtureRoot();
    const importer = await writeResolverFile(root, 'src/App.ts');
    await writeResolverJson(root, 'node_modules/@scope/api/package.json', {
      name: '@scope/api',
      type: 'module',
      exports: {
        '.': './dist/index.js',
        './services/PetsService': './dist/services/PetsService.js',
      },
    });
    const publicServiceFile = await writeResolverFile(
      root,
      'node_modules/@scope/api/dist/services/PetsService.js'
    );
    await writeResolverFile(root, 'node_modules/@scope/api/dist/private.js');
    const access = createNodeModuleAccess({ root });

    await expect(
      access.resolve('@scope/api/services/PetsService', importer)
    ).resolves.toBe(publicServiceFile);
  });

  it('loads source files and strips query and hash suffixes', async () => {
    const root = await createResolverFixtureRoot();
    const sourceFile = await writeResolverFile(
      root,
      'src/api.ts',
      'export const marker = true;'
    );
    const access = createNodeModuleAccess({ root });

    await expect(access.load(`${sourceFile}?raw#factory`)).resolves.toBe(
      'export const marker = true;'
    );
  });

  it('uses user resolve and load hooks before native strategies', async () => {
    const root = await createResolverFixtureRoot();
    const importer = await writeResolverFile(root, 'src/App.ts');
    const nativeApiFile = await writeResolverFile(
      root,
      'src/native-api.ts',
      'export const fromNative = true;'
    );
    const userApiFile = await writeResolverFile(
      root,
      'src/user-api.ts',
      'export const fromUser = true;'
    );
    const resolve = vi.fn(async () => userApiFile);
    const load = vi.fn(async () => 'export const virtualApi = true;');
    const access = createNodeModuleAccess({
      root,
      moduleAccess: { resolve, load },
    });

    const resolvedApiFile = await access.resolve('./native-api', importer);

    expect(resolvedApiFile).toBe(userApiFile);
    expect(resolvedApiFile).not.toBe(nativeApiFile);
    await expect(access.load(userApiFile)).resolves.toBe(
      'export const virtualApi = true;'
    );
    await expect(readResolverFile(userApiFile)).resolves.toBe(
      'export const fromUser = true;'
    );
    expect(resolve).toHaveBeenCalledWith('./native-api', importer);
    expect(load).toHaveBeenCalledWith(userApiFile);
  });
});
