import type { BundlerResolveContext } from './common.js';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  createAgnosticModuleAccess,
  createAgnosticResolver,
} from './agnostic.js';
import { getQraftModuleAccessStrategyMetadata } from './common.js';
import { createEsbuildModuleAccess } from './esbuild.js';
import {
  createRollupLikeModuleAccess,
  createRollupLikeResolver,
} from './rollup-like.js';
import { createRspackModuleAccess, createRspackResolver } from './rspack.js';
import {
  createWebpackLikeModuleAccess,
  createWebpackLikeResolver,
} from './webpack-like.js';

async function mktemp() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'qraft-resolver-'));
}

describe('resolver composition', () => {
  it('exposes named strategy order for adapter-created module access', () => {
    expect(
      getQraftModuleAccessStrategyMetadata(createAgnosticModuleAccess())
    ).toEqual({
      resolve: ['user'],
      load: ['user'],
    });
    expect(
      getQraftModuleAccessStrategyMetadata(createRollupLikeModuleAccess({}))
    ).toEqual({
      resolve: ['user', 'native'],
      load: ['user', 'adapter-fallback'],
    });
    expect(
      getQraftModuleAccessStrategyMetadata(createWebpackLikeModuleAccess({}))
    ).toEqual({
      resolve: ['user', 'native'],
      load: ['user', 'native', 'adapter-fallback'],
    });
    expect(
      getQraftModuleAccessStrategyMetadata(createRspackModuleAccess({}))
    ).toEqual({
      resolve: ['user', 'native'],
      load: ['user', 'native', 'adapter-fallback'],
    });
    expect(
      getQraftModuleAccessStrategyMetadata(createEsbuildModuleAccess({}))
    ).toEqual({
      resolve: ['user', 'native'],
      load: ['user', 'adapter-fallback'],
    });
  });

  it('uses only the custom resolver in the agnostic resolver chain', async () => {
    const importer = path.join(await mktemp(), 'src.ts');
    const customResolve = vi.fn(async () => null);
    const resolver = createAgnosticResolver(customResolve);

    await expect(resolver('./fallback', importer)).resolves.toBeNull();
    expect(customResolve).toHaveBeenCalledWith('./fallback', importer);
  });

  it('uses a custom module loader after custom resolution', async () => {
    const resolve = vi.fn(async (specifier: string, importer: string) => {
      expect(specifier).toBe('./api');
      expect(importer).toBe('/tmp/src/App.tsx');
      return '/tmp/src/api/index.ts';
    });
    const load = vi.fn(async (id: string) => {
      expect(id).toBe('/tmp/src/api/index.ts');
      return 'export const marker = true;';
    });

    const access = createAgnosticModuleAccess({ resolve, load });

    await expect(access.resolve('./api', '/tmp/src/App.tsx')).resolves.toBe(
      '/tmp/src/api/index.ts'
    );
    await expect(access.load('/tmp/src/api/index.ts')).resolves.toBe(
      'export const marker = true;'
    );
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('uses user resolve before native resolve when user resolve hits', async () => {
    const nativeResolve = vi.fn(async () => ({
      id: '/tmp/from-native.ts',
      external: false,
    }));
    const userResolve = vi.fn(async () => '/tmp/from-user.ts');
    const access = createRollupLikeModuleAccess(
      { resolve: nativeResolve },
      { resolve: userResolve }
    );

    await expect(access.resolve('./api', '/tmp/App.tsx')).resolves.toBe(
      '/tmp/from-user.ts'
    );
    expect(nativeResolve).not.toHaveBeenCalled();
  });

  it('uses native resolve after user resolve misses or errors', async () => {
    const importer = '/tmp/App.tsx';
    const userResolve = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error('user failed'));
    const nativeResolve = vi
      .fn()
      .mockResolvedValueOnce({
        id: '/tmp/from-native-after-miss.ts',
        external: false,
      })
      .mockResolvedValueOnce({
        id: '/tmp/from-native-after-error.ts',
        external: false,
      });
    const access = createRollupLikeModuleAccess(
      { resolve: nativeResolve },
      { resolve: userResolve }
    );

    await expect(access.resolve('./miss', importer)).resolves.toBe(
      '/tmp/from-native-after-miss.ts'
    );
    await expect(access.resolve('./error', importer)).resolves.toBe(
      '/tmp/from-native-after-error.ts'
    );
    expect(userResolve).toHaveBeenNthCalledWith(1, './miss', importer);
    expect(userResolve).toHaveBeenNthCalledWith(2, './error', importer);
    expect(nativeResolve).toHaveBeenCalledTimes(2);
  });

  it('returns null from load when no source loader is configured', async () => {
    const access = createAgnosticModuleAccess({
      resolve: async () => '/tmp/src/api/index.ts',
    });

    await expect(access.load('/tmp/src/api/index.ts')).resolves.toBeNull();
  });

  it('propagates loader errors and retries after a rejection', async () => {
    const error = new Error('source loader failed');
    const load = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce('export const marker = true;');
    const access = createAgnosticModuleAccess({
      resolve: async () => '/tmp/src/api/index.ts',
      load,
    });

    await expect(access.load('/tmp/src/api/index.ts')).rejects.toThrow(error);
    await expect(access.load('/tmp/src/api/index.ts')).resolves.toBe(
      'export const marker = true;'
    );
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('caches loaded source text including empty strings', async () => {
    const load = vi.fn(async () => '');
    const access = createAgnosticModuleAccess({
      resolve: async () => '/tmp/src/api/index.ts',
      load,
    });

    await expect(access.load('/tmp/src/api/index.ts')).resolves.toBe('');
    await expect(access.load('/tmp/src/api/index.ts')).resolves.toBe('');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('uses the rollup-like bundler resolver', async () => {
    const ctx: BundlerResolveContext = {
      resolve: vi.fn(async (source, importer, options) => {
        expect(source).toBe('./resolved.js');
        expect(importer).toBe('/tmp/src.ts');
        expect(options).toEqual({ skipSelf: true });
        return {
          id: '/tmp/resolved.ts?query=1',
          external: false,
        };
      }),
    };

    const resolver = createRollupLikeResolver(ctx);
    await expect(resolver('./resolved.js', '/tmp/src.ts')).resolves.toBe(
      '/tmp/resolved.ts'
    );
    expect(ctx.resolve).toHaveBeenCalledTimes(1);
  });

  it('uses the webpack loader resolver', async () => {
    const resolve = vi.fn(async (context: string, request: string) => {
      expect(context).toBe('/tmp/src');
      expect(request).toBe('@/generated-api');
      return '/tmp/generated-api/index.ts';
    });
    const ctx: BundlerResolveContext = {
      getNativeBuildContext() {
        return {
          framework: 'webpack',
          loaderContext: {
            getResolve(options?: { dependencyType?: string }) {
              expect(options).toEqual({ dependencyType: 'esm' });
              return resolve;
            },
          },
        };
      },
    };

    const resolver = createWebpackLikeResolver(ctx);
    await expect(resolver('@/generated-api', '/tmp/src/app.ts')).resolves.toBe(
      '/tmp/generated-api/index.ts'
    );
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it('resolves tsconfig aliases through the rspack resolver', async () => {
    const dir = await mktemp();
    const tsconfigPath = path.join(dir, 'tsconfig.json');
    const srcDir = path.join(dir, 'src', 'generated-api');
    await fs.mkdir(srcDir, { recursive: true });
    await fs.writeFile(
      tsconfigPath,
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: '.',
            paths: {
              '@/generated-api': ['src/generated-api/index.ts'],
            },
          },
        },
        null,
        2
      )
    );
    await fs.writeFile(path.join(srcDir, 'index.ts'), '');

    const resolver = createRspackResolver({
      getNativeBuildContext() {
        return {
          framework: 'rspack',
          compiler: {
            options: {
              resolve: {
                tsConfig: tsconfigPath,
              },
            },
          },
        };
      },
    });

    const expected = await fs.realpath(path.join(srcDir, 'index.ts'));
    await expect(
      resolver('@/generated-api', path.join(dir, 'src', 'app.ts'))
    ).resolves.toBe(expected);
  });

  it('loads source through the rollup-like filesystem adapter', async () => {
    const sourceFile = '/virtual/api.ts?raw#factory';
    const ctx: BundlerResolveContext = {
      resolve: vi.fn(async () => ({ id: sourceFile, external: false })),
      fs: {
        readFile: vi.fn(async (id: string) => {
          expect(id).toBe('/virtual/api.ts');
          return 'export const fromRollupFs = true;';
        }),
      },
    };

    const access = createRollupLikeModuleAccess(ctx);
    await expect(access.resolve('./api', '/tmp/App.tsx')).resolves.toBe(
      sourceFile
    );
    await expect(access.load(sourceFile)).resolves.toBe(
      'export const fromRollupFs = true;'
    );
    expect(ctx.fs?.readFile).toHaveBeenCalledTimes(1);
  });

  it('passes the exact rollup-like resolved id to a custom loader', async () => {
    const exactResolvedId = '/tmp/api.ts?raw#fragment';
    const ctx: BundlerResolveContext = {
      resolve: vi.fn(async () => ({ id: exactResolvedId, external: false })),
    };
    const userLoad = vi.fn(async (id: string) =>
      id === exactResolvedId ? 'export const exact = true;' : null
    );

    const access = createRollupLikeModuleAccess(ctx, { load: userLoad });

    await expect(access.resolve('./api', '/tmp/App.tsx')).resolves.toBe(
      exactResolvedId
    );
    await expect(access.load(exactResolvedId)).resolves.toBe(
      'export const exact = true;'
    );
    expect(userLoad).toHaveBeenCalledWith(exactResolvedId);
  });

  it('uses the custom rollup-like loader before filesystem fallback', async () => {
    const readFile = vi.fn(async () => 'export const fromFs = true;');
    const ctx: BundlerResolveContext = {
      fs: { readFile },
    };
    const userLoad = vi.fn(async (id: string) => {
      expect(id).toBe('/tmp/api.ts?raw#factory');
      return 'export const fromUserLoader = true;';
    });

    const access = createRollupLikeModuleAccess(ctx, {
      load: userLoad,
    });

    await expect(access.load('/tmp/api.ts?raw#factory')).resolves.toBe(
      'export const fromUserLoader = true;'
    );
    expect(userLoad).toHaveBeenCalledTimes(1);
    expect(readFile).not.toHaveBeenCalled();
  });

  it('loads source through webpack loadModule', async () => {
    const loadModule = vi.fn(
      (request: string, callback: (...args: unknown[]) => void) => {
        expect(request).toBe('/tmp/generated-api/index.ts');
        callback(
          null,
          Buffer.from('export const fromWebpack = true;'),
          null,
          {}
        );
      }
    );

    const access = createWebpackLikeModuleAccess({
      getNativeBuildContext() {
        return {
          framework: 'webpack',
          loaderContext: {
            getResolve: () => async () => '/tmp/generated-api/index.ts',
            loadModule,
          },
        };
      },
    });

    await expect(access.load('/tmp/generated-api/index.ts')).resolves.toBe(
      'export const fromWebpack = true;'
    );
    expect(loadModule).toHaveBeenCalledTimes(1);
  });

  it('uses webpack user load before loadModule', async () => {
    const userLoad = vi.fn(async () => 'export const fromUser = true;');
    const loadModule = vi.fn(
      (request: string, callback: (...args: unknown[]) => void) => {
        expect(request).toBe('/tmp/generated-api/index.ts');
        callback(null, 'export const fromNative = true;', null, {});
      }
    );

    const access = createWebpackLikeModuleAccess(
      {
        getNativeBuildContext() {
          return {
            framework: 'webpack',
            loaderContext: {
              loadModule,
            },
          };
        },
      },
      { load: userLoad }
    );

    await expect(access.load('/tmp/generated-api/index.ts')).resolves.toBe(
      'export const fromUser = true;'
    );
    expect(loadModule).not.toHaveBeenCalled();
  });

  it('uses webpack user load before input filesystem fallback', async () => {
    const userLoad = vi.fn(async (id: string) => {
      expect(id).toBe('/virtual/generated-api/index.ts?raw#factory');
      return 'export const fromUser = true;';
    });
    const loadModule = vi.fn(
      (_request: string, callback: (...args: unknown[]) => void) => {
        callback(new Error('missing'));
      }
    );
    const readFile = vi.fn(
      (_id: string, callback: (error: Error | null, source?: Buffer) => void) =>
        callback(null, Buffer.from('export const fromFs = true;'))
    );

    const access = createWebpackLikeModuleAccess(
      {
        getNativeBuildContext() {
          return {
            framework: 'webpack',
            loaderContext: {
              loadModule,
              fs: { readFile },
            },
          };
        },
      },
      { load: userLoad }
    );

    await expect(
      access.load('/virtual/generated-api/index.ts?raw#factory')
    ).resolves.toBe('export const fromUser = true;');
    expect(loadModule).not.toHaveBeenCalled();
    expect(readFile).not.toHaveBeenCalled();
  });

  it('loads source through webpack input filesystem when loadModule misses', async () => {
    const loadModule = vi.fn(
      (_request: string, callback: (...args: unknown[]) => void) => {
        callback(new Error('missing'));
      }
    );
    const readFile = vi.fn(
      (
        id: string,
        callback: (error: Error | null, source?: Buffer) => void
      ) => {
        expect(id).toBe('/virtual/generated-api/index.ts');
        callback(null, Buffer.from('export const fromWebpackFs = true;'));
      }
    );

    const access = createWebpackLikeModuleAccess({
      getNativeBuildContext() {
        return {
          framework: 'webpack',
          loaderContext: {
            loadModule,
            fs: {
              readFile,
            },
          },
        };
      },
    });

    await expect(
      access.load('/virtual/generated-api/index.ts?raw#factory')
    ).resolves.toBe('export const fromWebpackFs = true;');
    expect(loadModule).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledTimes(1);
  });

  it('loads source through rspack loadModule', async () => {
    const loadModule = vi.fn(
      (request: string, callback: (...args: unknown[]) => void) => {
        expect(request).toBe('/tmp/generated-api/index.ts');
        callback(
          null,
          Buffer.from('export const fromRspack = true;'),
          null,
          {}
        );
      }
    );

    const access = createRspackModuleAccess({
      getNativeBuildContext() {
        return {
          framework: 'rspack',
          loaderContext: {
            loadModule,
          },
        };
      },
    });

    await expect(access.load('/tmp/generated-api/index.ts')).resolves.toBe(
      'export const fromRspack = true;'
    );
    expect(loadModule).toHaveBeenCalledTimes(1);
  });

  it('uses rspack user load before loadModule', async () => {
    const userLoad = vi.fn(async () => 'export const fromUser = true;');
    const loadModule = vi.fn(
      (request: string, callback: (...args: unknown[]) => void) => {
        expect(request).toBe('/tmp/generated-api/index.ts');
        callback(null, 'export const fromNative = true;', null, {});
      }
    );

    const access = createRspackModuleAccess(
      {
        getNativeBuildContext() {
          return {
            framework: 'rspack',
            loaderContext: {
              loadModule,
            },
          };
        },
      },
      { load: userLoad }
    );

    await expect(access.load('/tmp/generated-api/index.ts')).resolves.toBe(
      'export const fromUser = true;'
    );
    expect(loadModule).not.toHaveBeenCalled();
  });

  it('uses rspack user load before input filesystem fallback', async () => {
    const userLoad = vi.fn(async (id: string) => {
      expect(id).toBe('/virtual/generated-api/index.ts?raw#factory');
      return 'export const fromUser = true;';
    });
    const loadModule = vi.fn(
      (_request: string, callback: (...args: unknown[]) => void) => {
        callback(new Error('missing'));
      }
    );
    const readFile = vi.fn(
      (_id: string, callback: (error: Error | null, source?: Buffer) => void) =>
        callback(null, Buffer.from('export const fromFs = true;'))
    );

    const access = createRspackModuleAccess(
      {
        getNativeBuildContext() {
          return {
            framework: 'rspack',
            loaderContext: {
              loadModule,
              fs: { readFile },
            },
          };
        },
      },
      { load: userLoad }
    );

    await expect(
      access.load('/virtual/generated-api/index.ts?raw#factory')
    ).resolves.toBe('export const fromUser = true;');
    expect(loadModule).not.toHaveBeenCalled();
    expect(readFile).not.toHaveBeenCalled();
  });

  it('loads source through rspack input filesystem when loadModule misses', async () => {
    const loadModule = vi.fn(
      (_request: string, callback: (...args: unknown[]) => void) => {
        callback(new Error('missing'));
      }
    );
    const readFile = vi.fn(
      (
        id: string,
        callback: (error: Error | null, source?: Buffer) => void
      ) => {
        expect(id).toBe('/virtual/generated-api/index.ts');
        callback(null, Buffer.from('export const fromRspackFs = true;'));
      }
    );

    const access = createRspackModuleAccess({
      getNativeBuildContext() {
        return {
          framework: 'rspack',
          loaderContext: {
            loadModule,
            fs: {
              readFile,
            },
          },
        };
      },
    });

    await expect(
      access.load('/virtual/generated-api/index.ts?raw#factory')
    ).resolves.toBe('export const fromRspackFs = true;');
    expect(loadModule).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledTimes(1);
  });

  it('uses the custom source loader before esbuild file fallback', async () => {
    const readFile = vi
      .spyOn(fs, 'readFile')
      .mockResolvedValue('export const fromFile = true;');
    const userLoad = vi.fn(async (id: string) => {
      expect(id).toBe('/tmp/api.ts?raw#hash');
      return 'export const fromUserLoader = true;';
    });
    const access = createEsbuildModuleAccess(
      {
        getNativeBuildContext() {
          return {
            framework: 'esbuild',
            build: {
              resolve: async () => ({ path: '/tmp/api.ts', errors: [] }),
            },
          };
        },
      },
      {
        load: userLoad,
      }
    );

    await expect(access.load('/tmp/api.ts?raw#hash')).resolves.toBe(
      'export const fromUserLoader = true;'
    );
    expect(userLoad).toHaveBeenCalledTimes(1);
    expect(readFile).not.toHaveBeenCalled();
    readFile.mockRestore();
  });

  it('strips query and hash only when esbuild file fallback reads locally', async () => {
    const readFile = vi
      .spyOn(fs, 'readFile')
      .mockResolvedValue('export const fromFile = true;');
    const access = createEsbuildModuleAccess({
      getNativeBuildContext() {
        return {
          framework: 'esbuild',
          build: {
            resolve: async () => ({ path: '/tmp/api.ts?raw#hash', errors: [] }),
          },
        };
      },
    });

    await expect(access.load('/tmp/api.ts?raw#hash')).resolves.toBe(
      'export const fromFile = true;'
    );
    expect(readFile).toHaveBeenCalledWith('/tmp/api.ts', 'utf8');
    readFile.mockRestore();
  });
});
