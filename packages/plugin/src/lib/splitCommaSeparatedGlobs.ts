/**
 * Normalize a comma-separated list of globs
 * @param commaSeparatedGlobs - Example: `/foo ,    /bar/**, ,`
 * @returns Example: `/foo,/bar/**`
 * @throws {Error} if input is invalid: not a `string` or `undefined` is provided
 */
export function splitCommaSeparatedGlobs(
  commaSeparatedGlobs: Array<string | undefined> | string | undefined
): string[] {
  const flattenCommaSeparatedGlobs = Array.isArray(commaSeparatedGlobs)
    ? commaSeparatedGlobs
    : [commaSeparatedGlobs].filter((glob) => {
        if (typeof glob !== 'string' && typeof glob !== 'undefined')
          throw new Error('Invalid input');
        return Boolean(glob);
      });

  if (!flattenCommaSeparatedGlobs.length) return [];

  return flattenCommaSeparatedGlobs
    .flatMap((path) => path?.split(','))
    .map((path) => path?.trim())
    .filter((path, index, array): path is NonNullable<typeof path> => {
      return Boolean(path) && array.lastIndexOf(path) === index;
    });
}
