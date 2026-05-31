import type { UnpluginFactory, UnpluginOptions } from 'unplugin';
import type { QraftTreeShakeOptions } from '../../core.js';
import { createUnplugin } from 'unplugin';
import { transformQraftTreeShaking } from '../../core.js';
import { type QraftModuleAccessFactory } from '../resolvers/common.js';
import { createGeneratedMetadataCache } from '../transform/generated-metadata.js';
import { type SourceFilterOptions } from '../transform/source-gate.js';

export const QRAFT_TREE_SHAKE_PLUGIN_NAME =
  '@openapi-qraft/tree-shaking-plugin';

export type QraftResolverFactory<TRuntimeContext = unknown> =
  QraftModuleAccessFactory<TRuntimeContext>;

export type QraftTreeShakePluginHooks = Pick<
  UnpluginOptions,
  'buildStart' | 'esbuild' | 'rollup' | 'rspack' | 'vite' | 'webpack'
>;

export type QraftTreeShakePluginHooksContext = {
  clearGeneratedMetadataCache: () => void;
};

export type QraftTreeShakePluginHooksFactory = (
  context: QraftTreeShakePluginHooksContext
) => Partial<QraftTreeShakePluginHooks>;

const defaultPluginSourceFilters = {
  include: [/\.[cm]?[jt]sx?$/],
  exclude: /node_modules/,
} satisfies Required<SourceFilterOptions>;

export function resolvePluginSourceFilterOptions({
  include,
  exclude,
}: SourceFilterOptions): Required<SourceFilterOptions> {
  return {
    include: include ?? defaultPluginSourceFilters.include,
    exclude: exclude ?? defaultPluginSourceFilters.exclude,
  };
}

export const createBuildStartHooks: QraftTreeShakePluginHooksFactory = ({
  clearGeneratedMetadataCache,
}) => ({
  buildStart: clearGeneratedMetadataCache,
});

export function createQraftTreeShakePlugin<TRuntimeContext = unknown>(
  createModuleAccess: QraftModuleAccessFactory<TRuntimeContext>,
  createPluginHooks?: QraftTreeShakePluginHooksFactory
) {
  const factory: UnpluginFactory<QraftTreeShakeOptions> = (options) => {
    const generatedMetadataCache = createGeneratedMetadataCache();
    const sourceFilters = resolvePluginSourceFilterOptions(options);
    const clearGeneratedMetadataCache = () => {
      generatedMetadataCache.clear();
    };

    return {
      name: QRAFT_TREE_SHAKE_PLUGIN_NAME,
      ...createPluginHooks?.({ clearGeneratedMetadataCache }),
      transform: {
        filter: {
          id: {
            include: sourceFilters.include,
            exclude: sourceFilters.exclude,
          },
        },
        handler(this: any, code, id) {
          const moduleAccess = createModuleAccess(this, {
            resolve: options.moduleAccess?.resolve ?? options.resolve,
            load: options.moduleAccess?.load,
          });
          return transformQraftTreeShaking(
            code,
            id,
            options,
            moduleAccess,
            this.inputSourceMap,
            generatedMetadataCache,
            sourceFilters
          );
        },
      },
    };
  };

  return createUnplugin(factory);
}
