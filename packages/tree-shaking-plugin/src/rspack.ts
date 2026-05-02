import { createQraftTreeShakePlugin } from './lib/plugin/create-qraft-tree-shake-plugin.js';
import { type BundlerResolveContext } from './lib/resolvers/common.js';
import { createRspackResolver } from './lib/resolvers/rspack.js';

export const qraftTreeShakeRspack =
  createQraftTreeShakePlugin<BundlerResolveContext>(
    createRspackResolver
  ).rspack;
