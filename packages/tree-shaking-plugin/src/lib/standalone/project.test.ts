import '@qraft/test-utils/vitestFsMock';
import type {
  TransformQraftProjectFileResult,
  TransformQraftProjectOptions,
} from './project.js';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  formatTransformQraftProjectSummary,
  transformQraftProject,
} from './project.js';

const realFs =
  await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');

async function createProjectFixtureRoot() {
  return realFs.realpath(
    await realFs.mkdtemp(path.join(os.tmpdir(), 'qraft-project-transform-'))
  );
}

async function writeProjectFile(
  root: string,
  relativePath: string,
  content = ''
) {
  const filePath = path.join(root, relativePath);
  await realFs.mkdir(path.dirname(filePath), { recursive: true });
  await realFs.writeFile(filePath, content);
  return filePath;
}

async function writeProjectJson(
  root: string,
  relativePath: string,
  value: unknown
) {
  return writeProjectFile(root, relativePath, JSON.stringify(value, null, 2));
}

async function readProjectFile(filePath: string) {
  return realFs.readFile(filePath, 'utf8');
}

async function writeGeneratedApiFixture(root: string) {
  await writeProjectJson(root, 'tsconfig.json', {
    compilerOptions: {
      baseUrl: '.',
      paths: {
        '@api/my-api': ['src/api/index.ts'],
        '@api/my-api/*': ['src/api/*'],
      },
    },
  });
  await writeProjectFile(
    root,
    'src/api/index.ts',
    `
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { APIClientContext } from './APIClientContext';
import { services } from './services/index';

const defaultCallbacks = { useQuery } as const;

export function createReactAPIClient(callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, APIClientContext);
}
`
  );
  await writeProjectFile(
    root,
    'src/api/APIClientContext.ts',
    'export const APIClientContext = {};'
  );
  await writeProjectFile(
    root,
    'src/api/services/index.ts',
    `
import { petsService } from './PetsService';

export const services = {
  pets: petsService,
} as const;
`
  );
  await writeProjectFile(
    root,
    'src/api/services/PetsService.ts',
    `
export const getPets = { schema: { method: 'get', url: '/pets' } };

export const petsService = {
  getPets,
} as const;
`
  );
}

function appUsingPetsSource() {
  return `
import { createReactAPIClient } from '@api/my-api';

const reactAPIClient = createReactAPIClient();

export function App() {
  return reactAPIClient.pets.getPets.useQuery();
}
`;
}

function projectTreeShakeOptions() {
  return {
    entrypoints: [
      {
        kind: 'clientFactory',
        factory: {
          exportName: 'createReactAPIClient',
          moduleSpecifier: '@api/my-api',
        },
        reactContext: {
          exportName: 'APIClientContext',
        },
      },
    ],
  } satisfies TransformQraftProjectOptions['treeShakeOptions'];
}

function relativeProjectFiles(
  root: string,
  files: TransformQraftProjectFileResult[]
) {
  return files.map((file) => slash(path.relative(root, file.filePath)));
}

function slash(filePath: string) {
  return filePath.split(path.sep).join('/');
}

describe('transformQraftProject', () => {
  it('transforms changed files in preview mode and does not write to disk', async () => {
    const root = await createProjectFixtureRoot();
    await writeGeneratedApiFixture(root);
    const appFile = await writeProjectFile(
      root,
      'src/App.tsx',
      appUsingPetsSource()
    );
    const originalCode = await readProjectFile(appFile);
    const options = {
      root,
      include: ['src/App.tsx'],
      treeShakeOptions: projectTreeShakeOptions(),
    } satisfies TransformQraftProjectOptions;

    const result = await transformQraftProject(options);

    expect(result.mode).toBe('preview');
    expect(result.summary).toEqual({
      total: 1,
      changed: 1,
      skipped: 0,
      failed: 0,
      written: 0,
    });
    const [file] = result.files;
    expect(file?.status).toBe('changed');
    if (file?.status !== 'changed') throw new Error('Expected changed file');
    expect(file.filePath).toBe(appFile);
    expect(file.written).toBe(false);
    expect(file.outputCode).toContain(
      'from "@api/my-api/services/PetsService"'
    );
    await expect(readProjectFile(appFile)).resolves.toBe(originalCode);
  });

  it('writes changed files in write mode and reports written files', async () => {
    const root = await createProjectFixtureRoot();
    await writeGeneratedApiFixture(root);
    const appFile = await writeProjectFile(
      root,
      'src/App.tsx',
      appUsingPetsSource()
    );
    const options = {
      root,
      include: 'src/App.tsx',
      treeShakeOptions: projectTreeShakeOptions(),
      mode: 'write',
    } satisfies TransformQraftProjectOptions;

    const result = await transformQraftProject(options);

    expect(result.mode).toBe('write');
    expect(result.summary).toEqual({
      total: 1,
      changed: 1,
      skipped: 0,
      failed: 0,
      written: 1,
    });
    const [file] = result.files;
    expect(file?.status).toBe('changed');
    if (file?.status !== 'changed') throw new Error('Expected changed file');
    expect(file.written).toBe(true);
    await expect(readProjectFile(appFile)).resolves.toBe(file.outputCode);
  });

  it('reports unchanged files as skipped', async () => {
    const root = await createProjectFixtureRoot();
    await writeGeneratedApiFixture(root);
    const unchangedFile = await writeProjectFile(
      root,
      'src/unchanged.ts',
      'export const unchanged = true;\n'
    );
    const options = {
      root,
      include: 'src/unchanged.ts',
      treeShakeOptions: projectTreeShakeOptions(),
    } satisfies TransformQraftProjectOptions;

    const result = await transformQraftProject(options);

    expect(result.summary).toEqual({
      total: 1,
      changed: 0,
      skipped: 1,
      failed: 0,
      written: 0,
    });
    expect(result.files).toEqual([
      {
        status: 'skipped',
        filePath: unchangedFile,
        code: 'export const unchanged = true;\n',
        written: false,
      },
    ]);
  });

  it('records a failed file with the original transform error for a missing API module', async () => {
    const root = await createProjectFixtureRoot();
    const appFile = await writeProjectFile(
      root,
      'src/App.tsx',
      appUsingPetsSource()
    );
    const options = {
      root,
      include: 'src/App.tsx',
      treeShakeOptions: projectTreeShakeOptions(),
    } satisfies TransformQraftProjectOptions;

    const result = await transformQraftProject(options);

    expect(result.summary).toEqual({
      total: 1,
      changed: 0,
      skipped: 0,
      failed: 1,
      written: 0,
    });
    const [file] = result.files;
    expect(file?.status).toBe('failed');
    if (file?.status !== 'failed') throw new Error('Expected failed file');
    expect(file.filePath).toBe(appFile);
    expect(file.written).toBe(false);
    expect(file.error).toBeInstanceOf(Error);
    if (!(file.error instanceof Error)) throw new Error('Expected Error');
    expect(file.error.name).toBe('QraftTreeShakeError');
    expect(file.error.message).toContain('entrypoint-source-unavailable');
    expect(formatTransformQraftProjectSummary(result)).toContain('src/App.tsx');
  });

  it('uses explicit files without glob discovery', async () => {
    const root = await createProjectFixtureRoot();
    await writeGeneratedApiFixture(root);
    const appFile = await writeProjectFile(
      root,
      'src/App.tsx',
      appUsingPetsSource()
    );
    await writeProjectFile(
      root,
      'src/ignored-by-explicit-files.tsx',
      appUsingPetsSource()
    );
    const options = {
      root,
      files: ['src/App.tsx'],
      include: ['src/ignored-by-explicit-files.tsx'],
      treeShakeOptions: projectTreeShakeOptions(),
    } satisfies TransformQraftProjectOptions;

    const result = await transformQraftProject(options);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.filePath).toBe(appFile);
    expect(result.summary.total).toBe(1);
  });

  it('discovers included source files and applies default project excludes', async () => {
    const root = await createProjectFixtureRoot();
    await writeGeneratedApiFixture(root);
    await writeProjectFile(root, 'src/App.tsx', appUsingPetsSource());
    await writeProjectFile(
      root,
      'src/unchanged.ts',
      'export const unchanged = true;\n'
    );
    await writeProjectFile(root, 'src/types.d.ts', appUsingPetsSource());
    await writeProjectFile(root, 'dist/App.tsx', appUsingPetsSource());
    await writeProjectFile(
      root,
      'node_modules/example/App.tsx',
      appUsingPetsSource()
    );
    const options = {
      root,
      include: '**/*.{ts,tsx}',
      treeShakeOptions: projectTreeShakeOptions(),
    } satisfies TransformQraftProjectOptions;

    const result = await transformQraftProject(options);

    expect(relativeProjectFiles(root, result.files)).toEqual([
      'src/App.tsx',
      'src/api/APIClientContext.ts',
      'src/api/index.ts',
      'src/api/services/PetsService.ts',
      'src/api/services/index.ts',
      'src/unchanged.ts',
    ]);
  });
});
