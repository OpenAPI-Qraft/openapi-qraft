import { createQraftTreeShakePlugin } from './lib/plugin/create-qraft-tree-shake-plugin.js';
import { type BundlerResolveContext } from './lib/resolvers/common.js';
import { createRollupLikeModuleAccess } from './lib/resolvers/rollup-like.js';

export const qraftTreeShakeVite =
  createQraftTreeShakePlugin<BundlerResolveContext>(
    createRollupLikeModuleAccess
  ).vite;
