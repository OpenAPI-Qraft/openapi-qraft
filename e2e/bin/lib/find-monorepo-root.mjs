import fs from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

/**
 * Find the root of the monorepo by looking for package.json with "workspaces"
 *
 * @param baseDir
 * @return {string|undefined}
 */
export function findMonorepoRoot(baseDir = process.cwd()) {
  const packageJsonPath = resolve(baseDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    if (packageJson.workspaces) {
      return baseDir;
    }
  }

  const parentDir = resolve(baseDir, '..');
  if (baseDir === parentDir) {
    throw new Error(
      'Reached the root of the disk or path, but package.json was not found'
    );
  }

  return findMonorepoRoot(parentDir);
}
