import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  createAgnosticModuleAccess,
  createAgnosticResolver,
} from './agnostic.js';
import { type BundlerResolveContext } from './common.js';
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
    const sourceFile = '/virtual/api.ts';
    const ctx: BundlerResolveContext = {
      resolve: vi.fn(async () => ({ id: sourceFile, external: false })),
      fs: {
        readFile: vi.fn(async (id: string) => {
          expect(id).toBe(sourceFile);
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
    const ctx: BundlerResolveContext = {};
    const userLoad = vi.fn(async (id: string) =>
      id === '/tmp/api.ts' ? 'export const fromFallback = true;' : null
    );

    const access = createRollupLikeModuleAccess(ctx, {
      load: userLoad,
    });

    await expect(access.load('/tmp/api.ts')).resolves.toBe(
      'export const fromFallback = true;'
    );
    expect(userLoad).toHaveBeenCalledTimes(1);
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

    await expect(access.load('/virtual/generated-api/index.ts')).resolves.toBe(
      'export const fromWebpackFs = true;'
    );
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

    await expect(access.load('/virtual/generated-api/index.ts')).resolves.toBe(
      'export const fromRspackFs = true;'
    );
    expect(loadModule).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledTimes(1);
  });

  it('uses the custom source loader before esbuild file fallback', async () => {
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
        load: async (id) =>
          id === '/tmp/api.ts' ? 'export const fromUserLoader = true;' : null,
      }
    );

    await expect(access.load('/tmp/api.ts')).resolves.toBe(
      'export const fromUserLoader = true;'
    );
  });
});
