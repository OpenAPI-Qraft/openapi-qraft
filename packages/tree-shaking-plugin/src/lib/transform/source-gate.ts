import type { ClientEntrypoint, FilterPattern } from './types.js';

const sourceIdPattern = /\.[cm]?[jt]sx?$/;

type ShouldInspectSourceInput = {
  code: string;
  id: string;
  entrypoints: ClientEntrypoint[];
  include?: FilterPattern;
  exclude?: FilterPattern;
};

export function shouldInspectSource({
  code,
  id,
  entrypoints,
  include,
  exclude,
}: ShouldInspectSourceInput): boolean {
  if (entrypoints.length === 0) return false;
  if (id.includes('/node_modules/')) return false;
  if (!sourceIdPattern.test(id)) return false;
  if (matchesPattern(id, exclude)) return false;
  if (include && !matchesPattern(id, include)) return false;

  return hasEntrypointSignal(code, entrypoints);
}

function hasEntrypointSignal(
  code: string,
  entrypoints: ClientEntrypoint[]
): boolean {
  return entrypoints.some((entrypoint) => {
    const signals =
      entrypoint.kind === 'generatedFactory'
        ? [entrypoint.factory.exportName, entrypoint.factory.moduleSpecifier]
        : [
            entrypoint.client.exportName,
            entrypoint.client.moduleSpecifier,
            entrypoint.factory.exportName,
            entrypoint.factory.moduleSpecifier,
          ];

    return signals.some((signal) => signal.length > 0 && code.includes(signal));
  });
}
function matchesPattern(
  id: string,
  pattern: FilterPattern | undefined
): boolean {
  if (!pattern) return false;
  if (Array.isArray(pattern)) {
    return pattern.some((item) => matchesPattern(id, item));
  }
  if (typeof pattern === 'string') return id.includes(pattern);
  return pattern.test(id);
}
