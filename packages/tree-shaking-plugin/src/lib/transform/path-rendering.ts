import {
  dirname,
  isAbsolute,
  normalize,
  relative,
  resolve,
  sep,
} from 'node:path';

export function resolveRelativeImportPath(
  importerId: string,
  baseFile: string,
  importPath: string
) {
  return importPath.startsWith('.')
    ? composeImportPath(importerId, resolve(dirname(baseFile), importPath))
    : importPath;
}

export function composeImportPath(importerId: string, targetFile: string) {
  const relativePath = relative(dirname(importerId), targetFile);
  const normalized = relativePath.split(sep).join('/');
  return normalized.startsWith('.') ? normalized : `./${normalized}`;
}

export function resolvePrecreatedOptionsImportPath(
  importerId: string,
  configuredModule: string,
  resolvedFile: string | null
) {
  if (!isPathLikeSpecifier(configuredModule)) return configuredModule;
  if (!resolvedFile) return configuredModule;
  const emittedPath = composeResolvedSourceImportPath(importerId, resolvedFile);
  return emittedPath === configuredModule ? configuredModule : emittedPath;
}

export function normalizeResolvedId(resolvedId: string) {
  const withoutQuery = stripQueryAndHash(resolvedId);
  return normalize(withoutQuery);
}

export function stripQueryAndHash(filePath: string) {
  const queryIndex = filePath.search(/[?#]/);
  return queryIndex >= 0 ? filePath.slice(0, queryIndex) : filePath;
}

export function composeResolvedSourceImportPath(
  importerId: string,
  targetFile: string
) {
  const composed = composeImportPath(importerId, targetFile);
  return stripIndexSourceExtension(stripSourceExtension(composed));
}

export function composeServiceOperationImportPath(
  moduleSpecifierBase: string,
  servicesDir: string,
  serviceImportPath: string
) {
  return joinImportPathSegments(
    moduleSpecifierBase,
    normalizeImportSubpathSegment(servicesDir),
    normalizeImportSubpathSegment(
      stripIndexSourceExtension(stripSourceExtension(serviceImportPath))
    )
  );
}

export function stripSourceExtension(importPath: string) {
  return importPath.replace(/\.(?:[cm]?[jt]sx?)$/, '');
}

export function stripIndexSourceExtension(importPath: string) {
  return importPath.replace(/\/index$/, '');
}

function isPathLikeSpecifier(specifier: string) {
  return specifier.startsWith('.') || isAbsolute(specifier);
}

function joinImportPathSegments(...segments: string[]) {
  const [firstSegment, ...remainingSegments] = segments;
  return [
    firstSegment.replace(/\/+$/, ''),
    ...remainingSegments.map(normalizeImportSubpathSegment),
  ].join('/');
}

function normalizeImportSubpathSegment(segment: string) {
  return segment.replace(/^\.?\//, '').replace(/\/+$/, '');
}
