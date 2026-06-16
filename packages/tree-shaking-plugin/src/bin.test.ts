import '@qraft/test-utils/vitestFsMock';
import type { QraftTreeShakeCliIo } from './bin.js';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { main } from './bin.js';

const fs =
  await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');

const fixtureRoots: string[] = [];

const usageText = `Usage: qraft-tree-shake [--config <path>] [--root <path>] [--write]

Options:
  --config <path>  Path to qraft-tree-shake config
  --root <path>    Project root for config discovery and relative paths
  --write          Write transformed code back to source files
  --help           Show this help`;

function createIo() {
  return {
    log: vi.fn(),
    error: vi.fn(),
  } satisfies QraftTreeShakeCliIo;
}

async function createFixtureRoot() {
  const root = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-cli-'))
  );
  fixtureRoots.push(root);
  return root;
}

async function writeFile(root: string, relativePath: string, content = '') {
  const filePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
  return filePath;
}

async function writeJson(root: string, relativePath: string, value: unknown) {
  return writeFile(root, relativePath, JSON.stringify(value, null, 2));
}

async function readFile(filePath: string) {
  return fs.readFile(filePath, 'utf8');
}

async function writeGeneratedApiFixture(root: string) {
  await writeJson(root, 'tsconfig.json', {
    compilerOptions: {
      baseUrl: '.',
      paths: {
        '@api/my-api': ['src/api/index.ts'],
        '@api/my-api/*': ['src/api/*'],
      },
    },
  });
  await writeFile(
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
  await writeFile(
    root,
    'src/api/APIClientContext.ts',
    'export const APIClientContext = {};\n'
  );
  await writeFile(
    root,
    'src/api/services/index.ts',
    `
import { petsService } from './PetsService';

export const services = {
  pets: petsService,
} as const;
`
  );
  await writeFile(
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

async function writeProjectConfig(root: string, relativePath: string) {
  return writeFile(
    root,
    relativePath,
    `
module.exports = {
  include: ['src/App.tsx'],
  treeShakeOptions: {
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
  },
};
`
  );
}

async function writeTransformableProject(root: string) {
  await writeGeneratedApiFixture(root);
  await writeProjectConfig(root, 'qraft-tree-shake.config.cjs');
  return writeFile(root, 'src/App.tsx', appUsingPetsSource());
}

function argv(...args: string[]) {
  return ['node', 'qraft-tree-shake', ...args];
}

afterEach(async () => {
  await Promise.all(
    fixtureRoots
      .splice(0)
      .map((root) => fs.rm(root, { force: true, recursive: true }))
  );
});

describe('main', () => {
  it('prints usage and returns 0 for --help', async () => {
    const io = createIo();

    await expect(main(argv('--help'), io)).resolves.toBe(0);

    expect(io.log).toHaveBeenCalledWith(usageText);
    expect(io.error).not.toHaveBeenCalled();
  });

  it('returns 1 and prints a clear error when config is missing', async () => {
    const root = await createFixtureRoot();
    const io = createIo();

    await expect(main(argv('--root', root), io)).resolves.toBe(1);

    expect(io.error).toHaveBeenCalledWith(
      `No qraft-tree-shake config found in ${root}.`
    );
    expect(io.log).not.toHaveBeenCalled();
  });

  it('prints the preview summary without writing files', async () => {
    const root = await createFixtureRoot();
    const appFile = await writeTransformableProject(root);
    const originalCode = await readFile(appFile);
    const io = createIo();

    await expect(main(argv('--root', root), io)).resolves.toBe(0);

    expect(io.log).toHaveBeenCalledWith(
      expect.stringContaining(
        'Processed 1 files: 1 changed, 0 skipped, 0 failed, 0 written.'
      )
    );
    expect(io.log).toHaveBeenCalledWith(expect.stringContaining('src/App.tsx'));
    expect(io.error).not.toHaveBeenCalled();
    await expect(readFile(appFile)).resolves.toBe(originalCode);
  });

  it('writes changed files when --write is passed', async () => {
    const root = await createFixtureRoot();
    const appFile = await writeTransformableProject(root);
    const io = createIo();

    await expect(main(argv('--root', root, '--write'), io)).resolves.toBe(0);

    expect(io.log).toHaveBeenCalledWith(
      expect.stringContaining(
        'Processed 1 files: 1 changed, 0 skipped, 0 failed, 1 written.'
      )
    );
    expect(io.error).not.toHaveBeenCalled();
    await expect(readFile(appFile)).resolves.toContain(
      'from "@api/my-api/services/PetsService"'
    );
  });

  it('returns 1 and prints the summary to stderr when a transform fails', async () => {
    const root = await createFixtureRoot();
    await writeProjectConfig(root, 'qraft-tree-shake.config.cjs');
    await writeFile(root, 'src/App.tsx', appUsingPetsSource());
    const io = createIo();

    await expect(main(argv('--root', root), io)).resolves.toBe(1);

    expect(io.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'Processed 1 files: 0 changed, 0 skipped, 1 failed, 0 written.'
      )
    );
    expect(io.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed (1)')
    );
    expect(io.log).not.toHaveBeenCalled();
  });

  it('uses --root as the config discovery root', async () => {
    const workspaceRoot = await createFixtureRoot();
    const projectRoot = path.join(workspaceRoot, 'packages/app');
    const appFile = await writeTransformableProject(projectRoot);
    const originalCode = await readFile(appFile);
    const io = createIo();

    await expect(main(argv('--root', projectRoot), io)).resolves.toBe(0);

    expect(io.log).toHaveBeenCalledWith(
      expect.stringContaining(
        'Processed 1 files: 1 changed, 0 skipped, 0 failed, 0 written.'
      )
    );
    expect(io.error).not.toHaveBeenCalled();
    await expect(readFile(appFile)).resolves.toBe(originalCode);
  });

  it('loads an explicit config path relative to --root', async () => {
    const root = await createFixtureRoot();
    await writeGeneratedApiFixture(root);
    const appFile = await writeFile(root, 'src/App.tsx', appUsingPetsSource());
    const originalCode = await readFile(appFile);
    await writeProjectConfig(root, 'configs/tree-shake.cjs');
    const io = createIo();

    await expect(
      main(argv('--root', root, '--config', 'configs/tree-shake.cjs'), io)
    ).resolves.toBe(0);

    expect(io.log).toHaveBeenCalledWith(
      expect.stringContaining(
        'Processed 1 files: 1 changed, 0 skipped, 0 failed, 0 written.'
      )
    );
    expect(io.error).not.toHaveBeenCalled();
    await expect(readFile(appFile)).resolves.toBe(originalCode);
  });
});
