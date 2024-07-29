/**
 * Normalize a comma-separated list of globs
 * @param commaSeparatedGlobs - Example: `/foo ,    /bar/**, ,`
 * @returns Example: `/foo,/bar/**`
 */
export function splitCommaSeparatedGlobs(
  commaSeparatedGlobs: string | undefined
): string[] {
  if (commaSeparatedGlobs === undefined) return [];
  if (typeof commaSeparatedGlobs !== 'string') throw new Error('Invalid input');

  return commaSeparatedGlobs
    .split(',')
    .map((path) => path.trim())
    .filter(Boolean);
}
