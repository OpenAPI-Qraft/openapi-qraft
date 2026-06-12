import type { UnpluginContextMeta } from 'unplugin';
import { describe, expect, it } from 'vitest';
import {
  createQraftTreeShakePlugin,
  resolvePluginSourceFilterOptions,
} from './create-qraft-tree-shake-plugin.js';

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

  it('passes cache clearing to adapter-specific hooks', () => {
    const plugin = createQraftTreeShakePlugin(
      () => ({
        resolve: async () => null,
        load: async () => null,
      }),
      ({ clearGeneratedMetadataCache }) => ({
        vite: {
          handleHotUpdate: clearGeneratedMetadataCache,
        },
      })
    ).raw({}, { framework: 'vite' });

    expect(Array.isArray(plugin)).toBe(false);
    if (Array.isArray(plugin)) return;

    expect(plugin.vite).toHaveProperty('handleHotUpdate');
  });

  it('resolves default source filters at the plugin entrypoint', () => {
    expect(resolvePluginSourceFilterOptions({})).toEqual({
      include: [/\.[cm]?[jt]sx?$/],
      exclude: /node_modules/,
    });

    expect(
      resolvePluginSourceFilterOptions({
        include: /\.custom$/,
        exclude: /vendor/,
      })
    ).toEqual({
      include: /\.custom$/,
      exclude: /vendor/,
    });
  });
});
