import path from 'node:path';
import { CommanderError } from 'commander';
import { describe, expect, it } from 'vitest';
import {
  compareSemver,
  parseTanStackQueryVersion,
  resolveTanStackQueryCapabilities,
  resolveTanStackQueryVersion,
} from './resolveTanStackQueryVersion.js';

describe('parseTanStackQueryVersion', () => {
  it('parses exact, v-prefixed, prerelease, partial, range, and latest versions', () => {
    expect(parseTanStackQueryVersion('5.80.0')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 80,
      patch: 0,
    });
    expect(parseTanStackQueryVersion('v5.108.1')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 108,
      patch: 1,
    });
    expect(parseTanStackQueryVersion('5.108.1-beta.2')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 108,
      patch: 1,
      prerelease: 'beta.2',
    });
    expect(parseTanStackQueryVersion('^5.108.1')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 108,
      patch: 1,
    });
    expect(parseTanStackQueryVersion('~5.108.4')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 108,
      patch: 4,
    });
    expect(parseTanStackQueryVersion('>= 5.108.1 < 6.0.0')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 108,
      patch: 1,
    });
    expect(parseTanStackQueryVersion('>5.108.0')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 108,
      patch: 1,
    });
    expect(parseTanStackQueryVersion('5.108')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 108,
      patch: 0,
    });
    expect(parseTanStackQueryVersion('5.108.x')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 108,
      patch: 0,
    });
    expect(parseTanStackQueryVersion('^5.80.0 || ^5.108.1')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 80,
      patch: 0,
    });
    expect(parseTanStackQueryVersion('5.108.1 - 5.110.0')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 108,
      patch: 1,
    });
    expect(parseTanStackQueryVersion('latest')).toEqual({ kind: 'latest' });
    expect(parseTanStackQueryVersion('*')).toEqual({
      kind: 'semver',
      major: 0,
      minor: 0,
      patch: 0,
    });
    expect(parseTanStackQueryVersion('* >=5.108.1')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 108,
      patch: 1,
    });
    expect(parseTanStackQueryVersion('* || ^5.108.1')).toEqual({
      kind: 'semver',
      major: 0,
      minor: 0,
      patch: 0,
    });
    expect(parseTanStackQueryVersion('^5.108.1 || *')).toEqual({
      kind: 'semver',
      major: 0,
      minor: 0,
      patch: 0,
    });
    expect(parseTanStackQueryVersion('>5.108.0-alpha.1')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 108,
      patch: 0,
      prerelease: 'alpha.1',
    });
    expect(parseTanStackQueryVersion('>5.108.2-alpha.1')).toEqual({
      kind: 'semver',
      major: 5,
      minor: 108,
      patch: 2,
      prerelease: 'alpha.1',
    });
  });

  it('returns null for invalid, empty, or upper-bound-only inputs', () => {
    expect(parseTanStackQueryVersion('')).toBeNull();
    expect(parseTanStackQueryVersion('invalid')).toBeNull();
    expect(parseTanStackQueryVersion('workspace:*')).toBeNull();
    expect(parseTanStackQueryVersion('catalog:')).toBeNull();
    expect(parseTanStackQueryVersion('<5.108.1')).toBeNull();
    expect(parseTanStackQueryVersion('5.108.1 - invalid')).toBeNull();
    expect(parseTanStackQueryVersion('* - 5.108.1')).toBeNull();
    expect(parseTanStackQueryVersion('^5.108.1 - 5.110.0')).toBeNull();
    expect(parseTanStackQueryVersion('5.x.1')).toBeNull();
    expect(parseTanStackQueryVersion('5.*.1')).toBeNull();
    expect(parseTanStackQueryVersion('5.80.0.1')).toBeNull();
  });
});

describe('compareSemver & resolveTanStackQueryCapabilities', () => {
  it('follows semver prerelease ordering', () => {
    const pre = parseTanStackQueryVersion('5.108.1-alpha.1');
    const release = parseTanStackQueryVersion('5.108.1');
    const nextPre = parseTanStackQueryVersion('5.108.2-alpha.1');

    if (
      pre?.kind !== 'semver' ||
      release?.kind !== 'semver' ||
      nextPre?.kind !== 'semver'
    ) {
      throw new Error('Expected semver versions');
    }

    expect(compareSemver(pre, release)).toBeLessThan(0);
    expect(compareSemver(nextPre, release)).toBeGreaterThan(0);
  });

  it('enables imperativeQuery and deprecations starting at 5.108.1', () => {
    expect(
      resolveTanStackQueryCapabilities(parseTanStackQueryVersion('5.80.0'))
    ).toEqual({
      imperativeQuery: false,
      deprecatedMethods: new Set(),
    });

    expect(
      resolveTanStackQueryCapabilities(parseTanStackQueryVersion('5.108.0'))
    ).toEqual({
      imperativeQuery: false,
      deprecatedMethods: new Set(),
    });

    expect(
      resolveTanStackQueryCapabilities(
        parseTanStackQueryVersion('5.108.1-rc.1')
      )
    ).toEqual({
      imperativeQuery: false,
      deprecatedMethods: new Set(),
    });

    expect(
      resolveTanStackQueryCapabilities(
        parseTanStackQueryVersion('>5.108.0-alpha.1')
      ).imperativeQuery
    ).toBe(false);

    expect(
      resolveTanStackQueryCapabilities(
        parseTanStackQueryVersion('>5.108.1-alpha.1')
      ).imperativeQuery
    ).toBe(false);

    expect(
      resolveTanStackQueryCapabilities(
        parseTanStackQueryVersion('>5.108.2-alpha.1')
      ).imperativeQuery
    ).toBe(true);

    expect(
      resolveTanStackQueryCapabilities(parseTanStackQueryVersion('*'))
        .imperativeQuery
    ).toBe(false);

    expect(
      resolveTanStackQueryCapabilities(
        parseTanStackQueryVersion('* || ^5.108.1')
      ).imperativeQuery
    ).toBe(false);

    const v51081 = resolveTanStackQueryCapabilities(
      parseTanStackQueryVersion('5.108.1')
    );
    expect(v51081.imperativeQuery).toBe(true);
    expect([...v51081.deprecatedMethods]).toEqual([
      'fetchQuery',
      'prefetchQuery',
      'ensureQueryData',
      'fetchInfiniteQuery',
      'prefetchInfiniteQuery',
      'ensureInfiniteQueryData',
    ]);

    expect(
      resolveTanStackQueryCapabilities(parseTanStackQueryVersion('6.0.0'))
        .imperativeQuery
    ).toBe(true);
    expect(
      resolveTanStackQueryCapabilities(parseTanStackQueryVersion('latest'))
        .imperativeQuery
    ).toBe(true);
    expect(resolveTanStackQueryCapabilities(null)).toEqual({
      imperativeQuery: false,
      deprecatedMethods: new Set(),
    });
  });
});

describe('resolveTanStackQueryVersion', () => {
  const createMemoryIO = (files: Record<string, string>) => {
    const normalized = new Map(
      Object.entries(files).map(([filePath, content]) => [
        path.resolve(filePath),
        content,
      ])
    );

    return {
      existsSync: (filePath: string) => normalized.has(path.resolve(filePath)),
      readFileSync: (filePath: string) => {
        const content = normalized.get(path.resolve(filePath));
        if (content === undefined) {
          throw new Error(`ENOENT: ${filePath}`);
        }
        return content;
      },
      resolvePackageJson: () => undefined,
    };
  };

  it('uses explicit version and throws CommanderError on invalid value', () => {
    expect(resolveTanStackQueryVersion({ explicitVersion: '5.108.1' })).toEqual(
      {
        raw: '5.108.1',
        version: { kind: 'semver', major: 5, minor: 108, patch: 1 },
        source: 'option',
      }
    );

    expect(() =>
      resolveTanStackQueryVersion({ explicitVersion: 'not-a-version' })
    ).toThrow(CommanderError);
  });

  it('prefers node_modules in outputDir over package.json and cwd', () => {
    const io = createMemoryIO({
      '/workspace/apps/legacy/package.json': JSON.stringify({
        dependencies: { '@tanstack/react-query': '^5.80.0' },
      }),
      '/workspace/apps/legacy/node_modules/@tanstack/react-query/package.json':
        JSON.stringify({ version: '5.108.4' }),
      '/workspace/node_modules/@tanstack/react-query/package.json':
        JSON.stringify({ version: '5.80.0' }),
    });

    expect(
      resolveTanStackQueryVersion(
        {
          outputDir: '/workspace/apps/legacy/src/api',
          cwd: '/workspace',
        },
        io
      )
    ).toEqual({
      raw: '5.108.4',
      version: { kind: 'semver', major: 5, minor: 108, patch: 4 },
      source: 'node-modules',
    });
  });

  it('prefers outputDir package.json before falling back to cwd', () => {
    const io = createMemoryIO({
      '/isolated/legacy-app/package.json': JSON.stringify({
        dependencies: { '@tanstack/react-query': '5.80.0' },
      }),
      '/other-cwd/node_modules/@tanstack/react-query/package.json':
        JSON.stringify({ version: '5.108.4' }),
    });

    expect(
      resolveTanStackQueryVersion(
        {
          outputDir: '/isolated/legacy-app/src/api',
          cwd: '/other-cwd',
        },
        io
      )
    ).toEqual({
      raw: '5.80.0',
      version: { kind: 'semver', major: 5, minor: 80, patch: 0 },
      source: 'package-json',
    });
  });

  it('falls back to cwd when outputDir has neither node_modules nor package.json', () => {
    const io = createMemoryIO({
      '/repo/node_modules/@tanstack/react-query/package.json': JSON.stringify({
        version: '5.108.4',
      }),
    });

    expect(
      resolveTanStackQueryVersion(
        {
          outputDir: '/virtual-mock-fs/src/api',
          cwd: '/repo/packages/app',
        },
        io
      )
    ).toEqual({
      raw: '5.108.4',
      version: { kind: 'semver', major: 5, minor: 108, patch: 4 },
      source: 'node-modules',
    });
  });

  it('uses resolvePackageJson hook (e.g., PnP) when node_modules folder is absent', () => {
    const io = {
      ...createMemoryIO({
        '/pnp-store/@tanstack-react-query-5.109.0/package.json': JSON.stringify(
          {
            version: '5.109.0',
          }
        ),
      }),
      resolvePackageJson: () =>
        '/pnp-store/@tanstack-react-query-5.109.0/package.json',
    };

    expect(
      resolveTanStackQueryVersion(
        {
          outputDir: '/app/src/api',
          cwd: '/app',
        },
        io
      )
    ).toEqual({
      raw: '5.109.0',
      version: { kind: 'semver', major: 5, minor: 109, patch: 0 },
      source: 'node-modules',
    });
  });

  it('defaults conservatively to null when nothing is detected', () => {
    const io = createMemoryIO({});

    expect(
      resolveTanStackQueryVersion(
        {
          outputDir: '/empty/output',
          cwd: '/empty/cwd',
        },
        io
      )
    ).toEqual({
      raw: undefined,
      version: null,
      source: 'default',
    });
  });
});
