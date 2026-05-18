import { createQraftTreeShakePlugin } from './lib/plugin/create-qraft-tree-shake-plugin.js';
import { type BundlerResolveContext } from './lib/resolvers/common.js';
import { createEsbuildModuleAccess } from './lib/resolvers/esbuild.js';

export const qraftTreeShakeEsbuild =
  createQraftTreeShakePlugin<BundlerResolveContext>(
    createEsbuildModuleAccess
  ).esbuild;
