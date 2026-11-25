import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { CommanderError } from 'commander';

export const MIN_IMPERATIVE_QUERY_TANSTACK_VERSION = '5.108.1';

export type DeprecatedTanStackQueryMethod =
  | 'fetchQuery'
  | 'prefetchQuery'
  | 'ensureQueryData'
  | 'fetchInfiniteQuery'
  | 'prefetchInfiniteQuery'
  | 'ensureInfiniteQueryData';

const V5_108_DEPRECATED_METHODS: readonly DeprecatedTanStackQueryMethod[] = [
  'fetchQuery',
  'prefetchQuery',
  'ensureQueryData',
  'fetchInfiniteQuery',
  'prefetchInfiniteQuery',
  'ensureInfiniteQueryData',
];

export type SemverVersion = {
  kind: 'semver';
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
};

export type ParsedTanStackQueryVersion = { kind: 'latest' } | SemverVersion;

export type TanStackQueryCapabilities = {
  imperativeQuery: boolean;
  deprecatedMethods: ReadonlySet<DeprecatedTanStackQueryMethod>;
};

export type ResolvedTanStackQueryVersion = {
  raw: string | undefined;
  version: ParsedTanStackQueryVersion | null;
  source: 'option' | 'node-modules' | 'package-json' | 'default';
};

type VersionResolutionIO = {
  existsSync?: (filePath: string) => boolean;
  readFileSync?: (filePath: string, encoding: 'utf-8') => string;
  resolvePackageJson?: (fromDir: string) => string | undefined;
};

const MIN_IMPERATIVE_QUERY_SEMVER: SemverVersion = {
  kind: 'semver',
  major: 5,
  minor: 108,
  patch: 1,
};

const BARE_VERSION_TOKEN_RE =
  /^v?(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/i;

const COMPARATOR_TOKEN_RE = /^(>=|>|\^|~|=)?(.+)$/;

type ParsedBareVersion = {
  version: SemverVersion;
  hasExplicitMinor: boolean;
  hasExplicitPatch: boolean;
};

/**
 * Parses a TanStack Query version string or simple semver range into a comparable lower-bound version.
 */
export function parseTanStackQueryVersion(
  raw: string
): ParsedTanStackQueryVersion | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const orBranches = trimmed.split('||');
  const parsedBranches: ParsedTanStackQueryVersion[] = [];

  for (const branch of orBranches) {
    const parsedBranch = parseComparatorBranch(branch);
    if (!parsedBranch) return null;
    parsedBranches.push(parsedBranch);
  }

  return pickMinimumVersion(parsedBranches);
}

function parseBareVersionToken(raw: string): ParsedBareVersion | null {
  const match = BARE_VERSION_TOKEN_RE.exec(raw.trim());
  if (!match) return null;

  const [, majorRaw, minorRaw, patchRaw, prerelease] = match;
  const hasExplicitMinor =
    minorRaw !== undefined &&
    minorRaw.toLowerCase() !== 'x' &&
    minorRaw !== '*';
  const hasExplicitPatch =
    patchRaw !== undefined &&
    patchRaw.toLowerCase() !== 'x' &&
    patchRaw !== '*';

  // Reject partial wildcards that skip minor while specifying patch (e.g. "5.x.1", "5.*.1").
  if (!hasExplicitMinor && hasExplicitPatch) return null;

  // Prerelease identifiers are only valid on full major.minor.patch versions.
  if (prerelease && (!hasExplicitMinor || !hasExplicitPatch)) return null;

  return {
    version: {
      kind: 'semver',
      major: Number(majorRaw),
      minor: hasExplicitMinor ? Number(minorRaw) : 0,
      patch: hasExplicitPatch ? Number(patchRaw) : 0,
      ...(prerelease ? { prerelease } : {}),
    },
    hasExplicitMinor,
    hasExplicitPatch,
  };
}

function parseComparatorBranch(
  branch: string
): ParsedTanStackQueryVersion | null {
  const trimmed = branch.trim();
  if (!trimmed) return null;

  // Handle hyphen ranges such as "5.80.0 - 5.108.4" using bare versions only.
  const hyphenParts = trimmed.split(/\s+-\s+/);
  if (hyphenParts.length > 2) return null;
  if (hyphenParts.length === 2) {
    const left = parseBareVersionToken(hyphenParts[0]);
    const right = parseBareVersionToken(hyphenParts[1]);
    if (!left || !right) return null;
    return left.version;
  }

  return parseSingleComparatorGroup(trimmed);
}

function parseSingleComparatorGroup(
  group: string
): ParsedTanStackQueryVersion | null {
  const trimmed = group.trim();
  if (!trimmed) return null;

  if (trimmed.toLowerCase() === 'latest') {
    return { kind: 'latest' };
  }

  const normalized = trimmed.replace(/([<>]=?|[~^=])\s+/g, '$1');
  const tokens = normalized.split(/\s+/).filter(Boolean);

  const lowerBounds: SemverVersion[] = [];

  for (const token of tokens) {
    if (token === '*' || token.toLowerCase() === 'x') {
      lowerBounds.push({
        kind: 'semver',
        major: 0,
        minor: 0,
        patch: 0,
      });
      continue;
    }

    if (token.startsWith('<=') || token.startsWith('<')) {
      const upperBound = token.replace(/^<=?/, '');
      if (!parseBareVersionToken(upperBound)) return null;
      continue;
    }

    const comparatorMatch = COMPARATOR_TOKEN_RE.exec(token);
    if (!comparatorMatch) return null;

    const [, operator, versionToken] = comparatorMatch;
    const parsed = parseBareVersionToken(versionToken);
    if (!parsed) return null;

    if (operator === '>') {
      // With a prerelease (e.g. ">5.108.0-alpha.1"), keep the conservative base
      // because the stable release (5.108.0) satisfies the comparator.
      if (parsed.version.prerelease) {
        lowerBounds.push(parsed.version);
      } else if (!parsed.hasExplicitMinor) {
        lowerBounds.push({
          kind: 'semver',
          major: parsed.version.major + 1,
          minor: 0,
          patch: 0,
        });
      } else if (!parsed.hasExplicitPatch) {
        lowerBounds.push({
          kind: 'semver',
          major: parsed.version.major,
          minor: parsed.version.minor + 1,
          patch: 0,
        });
      } else {
        lowerBounds.push({
          kind: 'semver',
          major: parsed.version.major,
          minor: parsed.version.minor,
          patch: parsed.version.patch + 1,
        });
      }
      continue;
    }

    lowerBounds.push(parsed.version);
  }

  if (lowerBounds.length === 0) return null;

  // Within an intersection branch, the strictest (maximum) lower bound applies.
  return lowerBounds.reduce((max, current) =>
    compareSemver(current, max) > 0 ? current : max
  );
}

function pickMinimumVersion(
  versions: ParsedTanStackQueryVersion[]
): ParsedTanStackQueryVersion | null {
  if (versions.length === 0) return null;
  if (versions.every((version) => version.kind === 'latest')) {
    return { kind: 'latest' };
  }

  const semvers = versions.filter(
    (version): version is SemverVersion => version.kind === 'semver'
  );
  return semvers.reduce((min, current) =>
    compareSemver(current, min) < 0 ? current : min
  );
}

/**
 * Compares two semver values according to SemVer 2.0.0 precedence.
 */
export function compareSemver(a: SemverVersion, b: SemverVersion): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;

  if (!a.prerelease && !b.prerelease) return 0;
  if (!a.prerelease) return 1;
  if (!b.prerelease) return -1;

  const aParts = a.prerelease.split('.');
  const bParts = b.prerelease.split('.');
  const maxLength = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < maxLength; i++) {
    const aPart = aParts[i];
    const bPart = bParts[i];

    if (aPart === undefined) return -1;
    if (bPart === undefined) return 1;
    if (aPart === bPart) continue;

    const aNumeric = /^\d+$/.test(aPart);
    const bNumeric = /^\d+$/.test(bPart);

    if (aNumeric && bNumeric) return Number(aPart) - Number(bPart);
    if (aNumeric) return -1;
    if (bNumeric) return 1;
    return aPart < bPart ? -1 : 1;
  }

  return 0;
}

/**
 * Resolves generated feature flags and deprecated method sets for a target TanStack Query version.
 */
export function resolveTanStackQueryCapabilities(
  version: ParsedTanStackQueryVersion | null
): TanStackQueryCapabilities {
  const supportsImperativeQuery =
    version !== null &&
    (version.kind === 'latest' ||
      compareSemver(version, MIN_IMPERATIVE_QUERY_SEMVER) >= 0);

  return {
    imperativeQuery: supportsImperativeQuery,
    deprecatedMethods: new Set(
      supportsImperativeQuery ? V5_108_DEPRECATED_METHODS : []
    ),
  };
}

/**
 * Formats a resolved TanStack Query version for CLI spinner output.
 */
export function formatResolvedTanStackQueryVersion(
  resolved: ResolvedTanStackQueryVersion
): string {
  switch (resolved.source) {
    case 'option':
      return `Using @tanstack/react-query ${resolved.raw} (from --tanstack-query-version)`;
    case 'node-modules':
      return `Detected @tanstack/react-query ${resolved.raw} (from node_modules)`;
    case 'package-json':
      return `Detected @tanstack/react-query ${resolved.raw} (from package.json)`;
    case 'default':
      return `Could not detect @tanstack/react-query version; defaulting to conservative < ${MIN_IMPERATIVE_QUERY_TANSTACK_VERSION} mode`;
  }
}

/**
 * Resolves the target `@tanstack/react-query` version from an explicit option,
 * installed `node_modules`, or nearest `package.json`, defaulting conservatively if undetected.
 */
export function resolveTanStackQueryVersion(
  {
    explicitVersion,
    outputDir,
    cwd = process.cwd(),
  }: {
    explicitVersion?: string;
    outputDir?: string;
    cwd?: string;
  },
  io: VersionResolutionIO = {}
): ResolvedTanStackQueryVersion {
  if (explicitVersion !== undefined) {
    const parsed = parseTanStackQueryVersion(explicitVersion);
    if (!parsed) {
      throw new CommanderError(
        1,
        'ERR_INVALID_TANSTACK_QUERY_VERSION',
        `Invalid --tanstack-query-version value: '${explicitVersion}'. Expected a valid version or range (e.g., '5.80.0', '5.108.1', '^5.108.1', 'latest').`
      );
    }

    return {
      raw: explicitVersion.trim(),
      version: parsed,
      source: 'option',
    };
  }

  const existsSync = io.existsSync ?? ((filePath) => fs.existsSync(filePath));
  const readFileSync =
    io.readFileSync ??
    ((filePath, encoding) => fs.readFileSync(filePath, encoding));
  const resolvePackageJson = io.resolvePackageJson ?? defaultResolvePackageJson;

  const candidateDirs = [outputDir, cwd]
    .filter((dir): dir is string => Boolean(dir))
    .map((dir) => path.resolve(dir))
    .filter((dir, index, list) => list.indexOf(dir) === index);

  for (const startDir of candidateDirs) {
    const fromNodeModules = detectFromNodeModules(
      startDir,
      existsSync,
      readFileSync,
      resolvePackageJson
    );
    if (fromNodeModules) return fromNodeModules;

    const fromPackageJson = detectFromPackageJson(
      startDir,
      existsSync,
      readFileSync
    );
    if (fromPackageJson) return fromPackageJson;
  }

  return {
    raw: undefined,
    version: null,
    source: 'default',
  };
}

function defaultResolvePackageJson(fromDir: string): string | undefined {
  try {
    const req = createRequire(path.join(fromDir, '__qraft_resolve__.cjs'));
    return req.resolve('@tanstack/react-query/package.json');
  } catch {
    return undefined;
  }
}

function detectFromNodeModules(
  startDir: string,
  existsSync: NonNullable<VersionResolutionIO['existsSync']>,
  readFileSync: NonNullable<VersionResolutionIO['readFileSync']>,
  resolvePackageJson: NonNullable<VersionResolutionIO['resolvePackageJson']>
): ResolvedTanStackQueryVersion | undefined {
  for (const dir of walkUpDirectories(startDir)) {
    const candidate = path.join(
      dir,
      'node_modules',
      '@tanstack',
      'react-query',
      'package.json'
    );
    const resolved = readInstalledPackageVersion(
      candidate,
      existsSync,
      readFileSync
    );
    if (resolved) return resolved;
  }

  const resolvedPath = resolvePackageJson(startDir);
  if (resolvedPath) {
    return readInstalledPackageVersion(resolvedPath, existsSync, readFileSync);
  }

  return undefined;
}

function readInstalledPackageVersion(
  packageJsonPath: string,
  existsSync: NonNullable<VersionResolutionIO['existsSync']>,
  readFileSync: NonNullable<VersionResolutionIO['readFileSync']>
): ResolvedTanStackQueryVersion | undefined {
  if (!existsSync(packageJsonPath)) return undefined;

  const pkg = readJsonSafe(packageJsonPath, readFileSync);
  if (typeof pkg?.version !== 'string') return undefined;

  const parsed = parseTanStackQueryVersion(pkg.version);
  if (!parsed) return undefined;

  return {
    raw: pkg.version,
    version: parsed,
    source: 'node-modules',
  };
}

function detectFromPackageJson(
  startDir: string,
  existsSync: NonNullable<VersionResolutionIO['existsSync']>,
  readFileSync: NonNullable<VersionResolutionIO['readFileSync']>
): ResolvedTanStackQueryVersion | undefined {
  for (const dir of walkUpDirectories(startDir)) {
    const packageJsonPath = path.join(dir, 'package.json');
    if (!existsSync(packageJsonPath)) continue;

    const pkg = readJsonSafe(packageJsonPath, readFileSync);
    if (!pkg) continue;

    const dependencyVersion =
      getDependencyVersion(pkg.dependencies) ??
      getDependencyVersion(pkg.devDependencies) ??
      getDependencyVersion(pkg.peerDependencies);

    if (!dependencyVersion) continue;

    const parsed = parseTanStackQueryVersion(dependencyVersion);
    if (!parsed) continue;

    return {
      raw: dependencyVersion,
      version: parsed,
      source: 'package-json',
    };
  }

  return undefined;
}

function getDependencyVersion(deps: unknown): string | undefined {
  if (!deps || typeof deps !== 'object') return undefined;
  const value = (deps as Record<string, unknown>)['@tanstack/react-query'];
  return typeof value === 'string' ? value : undefined;
}

function readJsonSafe(
  filePath: string,
  readFileSync: NonNullable<VersionResolutionIO['readFileSync']>
): Record<string, unknown> | undefined {
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'));
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

function* walkUpDirectories(startDir: string): Generator<string> {
  let current = path.resolve(startDir);

  while (true) {
    yield current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
}
