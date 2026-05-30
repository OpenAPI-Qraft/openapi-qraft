import type { UnpluginFactory } from 'unplugin';
import type { QraftTreeShakeOptions } from '../../core.js';
import { createUnplugin } from 'unplugin';
import { transformQraftTreeShaking } from '../../core.js';
import { type QraftModuleAccessFactory } from '../resolvers/common.js';
import { createGeneratedMetadataCache } from '../transform/generated-metadata.js';

export type QraftResolverFactory<TRuntimeContext = unknown> =
  QraftModuleAccessFactory<TRuntimeContext>;

export function createQraftTreeShakePlugin<TRuntimeContext = unknown>(
  createModuleAccess: QraftModuleAccessFactory<TRuntimeContext>
) {
  const factory: UnpluginFactory<QraftTreeShakeOptions> = (options, meta) => {
    const generatedMetadataCache = createGeneratedMetadataCache();
    const clearGeneratedMetadataCache = () => {
      generatedMetadataCache.clear();
    };

    return {
      name: '@openapi-qraft/tree-shaking-plugin',
      ...(meta.framework === 'webpack'
        ? {
            webpack(compiler) {
              compiler.hooks.beforeRun.tap(
                '@openapi-qraft/tree-shaking-plugin',
                clearGeneratedMetadataCache
              );
              compiler.hooks.watchRun.tap(
                '@openapi-qraft/tree-shaking-plugin',
                clearGeneratedMetadataCache
              );
            },
          }
        : {
            buildStart: clearGeneratedMetadataCache,
          }),
      transform: {
        filter: {
          id: {
            include: options.include ?? [/\.[cm]?[jt]sx?$/],
            exclude: options.exclude ?? /node_modules/,
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
            generatedMetadataCache
          );
        },
      },
    };
  };

  return createUnplugin(factory);
}
