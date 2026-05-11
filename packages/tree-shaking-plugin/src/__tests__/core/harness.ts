import '@qraft/test-utils/vitestFsMock';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { SourceMapInput } from '@jridgewell/trace-mapping';
import { createTransformPlan } from '../../lib/transform/plan.js';
import { transformQraftTreeShaking as transformQraftTreeShakingImpl } from '../../core.js';
import {
  createFixtureModuleAccess,
  getContextFixtureFiles,
  writeFixtureFiles,
} from './fixtures.js';

export type TransformOptions = Parameters<typeof transformQraftTreeShakingImpl>[2];

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
  const fixtureRoot = path.dirname(path.dirname(id));
  const moduleAccess = createFixtureModuleAccess(fixtureRoot, {
    resolve: options.moduleAccess?.resolve ?? options.resolve,
    load: options.moduleAccess?.load,
  });

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

export { createTransformPlan };
