import '@qraft/test-utils/vitestFsMock';
import type { SourceMapInput } from '@jridgewell/trace-mapping';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { transformQraftTreeShaking as transformQraftTreeShakingImpl } from '../../core.js';
import { createTransformAnalysis } from '../../lib/transform/analysis.js';
import {
  createFixtureModuleAccess,
  getContextFixtureFiles,
  writeFixtureFiles,
} from './fixtures.js';

export type TransformOptions = Parameters<
  typeof transformQraftTreeShakingImpl
>[2];

type FixtureOptions = {
  contextName?: string;
  contextModule?: string;
  importContext?: boolean;
  apiDirName?: string;
};

export async function transformQraftTreeShaking(
  code: string,
  id: string,
  options: TransformOptions,
  inputSourceMap?: SourceMapInput
) {
  const fixtureRoot = getFixtureRootFromSourceFile(id);
  const moduleAccess = createFixtureModuleAccess(fixtureRoot, {
    resolve: options.moduleAccess?.resolve ?? options.resolve,
  });

  if (options.moduleAccess?.load) {
    return transformQraftTreeShakingImpl(
      code,
      id,
      options,
      {
        ...moduleAccess,
        load: options.moduleAccess.load,
      },
      inputSourceMap
    );
  }

  return transformQraftTreeShakingImpl(
    code,
    id,
    options,
    moduleAccess,
    inputSourceMap
  );
}

export async function createFixture(options: FixtureOptions = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'qraft-tree-shaking-'));
  const contextName = options.contextName ?? 'APIClientContext';
  const contextModule = options.contextModule ?? `./${contextName}`;
  const importContext = options.importContext ?? true;

  await writeFixtureFiles(root, {
    ...getContextFixtureFiles(
      contextName,
      contextModule,
      importContext,
      options.apiDirName
    ),
  });

  return root;
}

function getFixtureRootFromSourceFile(id: string) {
  const normalizedPath = path.normalize(id);
  const parts = normalizedPath.split(path.sep);
  const srcIndex = parts.lastIndexOf('src');

  if (srcIndex > 0) {
    const fixtureRoot = parts.slice(0, srcIndex).join(path.sep);
    if (fixtureRoot) {
      return fixtureRoot;
    }
  }

  return path.dirname(path.dirname(id));
}

export { createTransformAnalysis };
