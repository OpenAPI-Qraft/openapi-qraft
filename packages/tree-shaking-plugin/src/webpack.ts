import {
  createQraftTreeShakePlugin,
  QRAFT_TREE_SHAKE_PLUGIN_NAME,
} from './lib/plugin/create-qraft-tree-shake-plugin.js';
import { type BundlerResolveContext } from './lib/resolvers/common.js';
import { createWebpackLikeModuleAccess } from './lib/resolvers/webpack-like.js';

export const qraftTreeShakeWebpack =
  createQraftTreeShakePlugin<BundlerResolveContext>(
    createWebpackLikeModuleAccess,
    ({ clearGeneratedMetadataCache }) => ({
      webpack(compiler) {
        compiler.hooks.beforeRun.tap(
          QRAFT_TREE_SHAKE_PLUGIN_NAME,
          clearGeneratedMetadataCache
        );
        compiler.hooks.watchRun.tap(
          QRAFT_TREE_SHAKE_PLUGIN_NAME,
          clearGeneratedMetadataCache
        );
      },
    })
  ).webpack;
