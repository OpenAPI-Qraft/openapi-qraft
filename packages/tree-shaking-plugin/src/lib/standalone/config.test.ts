import type { QraftTreeShakeProjectConfig } from './project.js';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  defaultTransformQraftProjectConfigFiles,
  findTransformQraftProjectConfig,
  loadTransformQraftProjectConfig,
} from './config.js';

const fixtureRoots: string[] = [];

async function createConfigFixtureRoot() {
  const root = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-config-'))
  );
  fixtureRoots.push(root);
  return root;
}

async function writeConfigFile(
  root: string,
  relativePath: string,
  content = ''
) {
  const filePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
  return filePath;
}

function tsDefaultConfigSource() {
  return `
export default {
  include: ['src/App.tsx'],
  treeShakeOptions: {
    entrypoints: [],
  },
} satisfies {
  include: string[];
  treeShakeOptions: {
    entrypoints: unknown[];
  };
};
`;
}

function commonJsConfigSource() {
  return `
module.exports = {
  include: ['src/App.tsx'],
  treeShakeOptions: {
    entrypoints: [],
  },
};
`;
}

function expectedConfig() {
  return {
    include: ['src/App.tsx'],
    treeShakeOptions: {
      entrypoints: [],
    },
  } satisfies QraftTreeShakeProjectConfig;
}

afterEach(async () => {
  await Promise.all(
    fixtureRoots
      .splice(0)
      .map((root) => fs.rm(root, { force: true, recursive: true }))
  );
});

describe('findTransformQraftProjectConfig', () => {
  it('returns the first existing default config filename', async () => {
    const root = await createConfigFixtureRoot();
    const expectedConfigFiles = [
      'qraft-tree-shake.config.ts',
      'qraft-tree-shake.config.mts',
      'qraft-tree-shake.config.js',
      'qraft-tree-shake.config.mjs',
      'qraft-tree-shake.config.cjs',
      'qraft-tree-shake.config.cts',
    ] satisfies typeof defaultTransformQraftProjectConfigFiles;

    expect(defaultTransformQraftProjectConfigFiles).toEqual(
      expectedConfigFiles
    );

    for (const configFile of defaultTransformQraftProjectConfigFiles) {
      await writeConfigFile(root, configFile);
    }

    await expect(findTransformQraftProjectConfig(root)).resolves.toBe(
      path.join(root, defaultTransformQraftProjectConfigFiles[0])
    );
  });

  it('returns null when no config exists', async () => {
    const root = await createConfigFixtureRoot();

    await expect(findTransformQraftProjectConfig(root)).resolves.toBeNull();
  });
});

describe('loadTransformQraftProjectConfig', () => {
  it('loads a TypeScript default export', async () => {
    const root = await createConfigFixtureRoot();
    const configFile = await writeConfigFile(
      root,
      'qraft-tree-shake.config.ts',
      tsDefaultConfigSource()
    );

    await expect(loadTransformQraftProjectConfig(configFile)).resolves.toEqual(
      expectedConfig()
    );
  });

  it('loads a CommonJS export', async () => {
    const root = await createConfigFixtureRoot();
    const configFile = await writeConfigFile(
      root,
      'qraft-tree-shake.config.cjs',
      commonJsConfigSource()
    );

    await expect(loadTransformQraftProjectConfig(configFile)).resolves.toEqual(
      expectedConfig()
    );
  });
});
