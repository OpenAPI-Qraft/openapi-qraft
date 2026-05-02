import { createQraftTreeShakePlugin } from './lib/plugin/create-qraft-tree-shake-plugin.js';
import { type BundlerResolveContext } from './lib/resolvers/common.js';
import { createWebpackLikeResolver } from './lib/resolvers/webpack-like.js';

export const qraftTreeShakeWebpack =
  createQraftTreeShakePlugin<BundlerResolveContext>(
    createWebpackLikeResolver
  ).webpack;
