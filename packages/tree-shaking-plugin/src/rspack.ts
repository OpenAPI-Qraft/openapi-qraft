import { createQraftTreeShakePlugin } from './lib/plugin/create-qraft-tree-shake-plugin.js';
import { type BundlerResolveContext } from './lib/resolvers/common.js';
import { createRspackModuleAccess } from './lib/resolvers/rspack.js';

export const qraftTreeShakeRspack =
  createQraftTreeShakePlugin<BundlerResolveContext>(
    createRspackModuleAccess
  ).rspack;
