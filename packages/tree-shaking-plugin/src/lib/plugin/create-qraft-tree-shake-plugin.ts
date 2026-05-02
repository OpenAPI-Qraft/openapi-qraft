import type { UnpluginFactory } from 'unplugin';
import type { QraftTreeShakeOptions } from '../../core.js';
import { createUnplugin } from 'unplugin';
import { transformQraftTreeShaking } from '../../core.js';
import { type QraftResolver } from '../resolvers/common.js';

export type QraftResolverFactory<TRuntimeContext = unknown> = (
  ctx: TRuntimeContext,
  userResolve?: QraftResolver
) => QraftResolver;

export function createQraftTreeShakePlugin<TRuntimeContext = unknown>(
  createResolver: QraftResolverFactory<TRuntimeContext>
) {
  const factory: UnpluginFactory<QraftTreeShakeOptions> = (options) => ({
    name: '@openapi-qraft/tree-shaking-plugin',
    transform: {
      filter: {
        id: {
          include: options.include ?? [/\.[cm]?[jt]sx?$/],
          exclude: options.exclude ?? /node_modules/,
        },
      },
      handler(this: any, code, id) {
        const resolver = createResolver(this, options.resolve);
        return transformQraftTreeShaking(code, id, options, resolver);
      },
    },
  });

  return createUnplugin(factory);
}
