/**
 * Compares two versions in semver format and determines whether the first version is smaller than the second.
 *
 * @param version - Comparison version
 * @param targetVersion - Target version for comparison
 * @returns true, if the version is less than the targetVersion, otherwise false
 *
 * @example
 * ```ts
 * isSemverLessThan('5.79.0', '5.80.0'); // true
 * isSemverLessThan('5.80.0', '5.80.0'); // false
 * isSemverLessThan('5.81.0', '5.80.0'); // false
 * isSemverLessThan('4.29.1', '5.0.0');  // true
 * ```
 */
export const isSemverLessThan = (
  version: string,
  targetVersion: string
): boolean => {
  const parseVersion = (v: string) => v.split('.').map(Number);

  const versionParts = parseVersion(version);
  const targetParts = parseVersion(targetVersion);

  for (let i = 0; i < Math.max(versionParts.length, targetParts.length); i++) {
    const vPart = versionParts[i] || 0;
    const tPart = targetParts[i] || 0;

    if (vPart < tPart) return true;
    if (vPart > tPart) return false;
  }

  return false;
};
