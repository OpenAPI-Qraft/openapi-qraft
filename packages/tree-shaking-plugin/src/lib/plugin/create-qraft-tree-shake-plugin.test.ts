import type { UnpluginContextMeta } from 'unplugin';
import { describe, expect, it } from 'vitest';
import { createQraftTreeShakePlugin } from './create-qraft-tree-shake-plugin.js';

describe('createQraftTreeShakePlugin', () => {
  it('does not infer bundler lifecycle hooks from unplugin metadata', () => {
    const webpackMeta = {
      framework: 'webpack',
      webpack: { compiler: {} as never },
    } satisfies UnpluginContextMeta;

    const plugin = createQraftTreeShakePlugin(() => ({
      resolve: async () => null,
      load: async () => null,
    })).raw({}, webpackMeta);

    expect(plugin).not.toHaveProperty('buildStart');
    expect(plugin).not.toHaveProperty('webpack');
  });
});
