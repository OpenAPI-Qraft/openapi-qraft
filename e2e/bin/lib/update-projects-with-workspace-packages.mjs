#!/usr/bin/env node
import { execSync, exec } from 'node:child_process';
import fs from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

import { findMonorepoRoot } from './find-monorepo-root.mjs';

/**
 * Get packages to publish from workspaces
 *
 * @return {string[]}
 */
function getWorkspacesPublishingPackages() {
  const prefixSalt = '[package]:';

  if (!process.env.NPM_PUBLISH_SCOPES)
    throw new Error('NPM_PUBLISH_SCOPES env variable is not set');

  const scopes = process.env.NPM_PUBLISH_SCOPES.split(' ').reduce(
    (acc, scope) => `${acc} '@${scope}/*'`,
    ''
  );

  const result = execSync(
    `(cd "${findMonorepoRoot()}" && yarn workspaces foreach --no-private ${scopes} \
    exec node -p "'${prefixSalt}' + require('./package.json').name + '@' + require('./package.json').version")`
  );

  return result
    .toString()
    .split('\n')
    .reduce((acc, row) => {
      if (!row.startsWith(prefixSalt)) return acc;
      return [...acc, row.slice(prefixSalt.length)];
    }, []);
}

/**
 * Get projects to update with dependencies
 *
 * @param {string} baseDir
 * @return {Object<string, { dependencies: string[], devDependencies: boolean }>}
 */
function getProjectsToUpdate(baseDir) {
  const publishingPackages = getWorkspacesPublishingPackages();

  return fs
    .readdirSync(baseDir)
    .map((projectSubDir) => resolve(baseDir, projectSubDir))
    .filter((projectDir) => fs.existsSync(resolve(projectDir, 'package.json')))
    .reduce((acc, projectDir) => {
      const packageJson = JSON.parse(
        fs.readFileSync(resolve(projectDir, 'package.json')).toString()
      );

      const dependencies = Object.keys(packageJson.dependencies || {}).reduce(
        (acc, dependency) => {
          const publishingPackageNameWithVersion = publishingPackages.find(
            (packageNameWithVersion) =>
              packageNameWithVersion.startsWith(`${dependency}@`)
          );

          return publishingPackageNameWithVersion
            ? [...acc, publishingPackageNameWithVersion]
            : acc;
        },
        []
      );

      const devDependencies = Object.keys(
        packageJson.devDependencies || {}
      ).reduce((acc, dependency) => {
        const publishingPackageNameWithVersion = publishingPackages.find(
          (packageNameWithVersion) =>
            packageNameWithVersion.startsWith(`${dependency}@`)
        );

        return publishingPackageNameWithVersion
          ? [...acc, publishingPackageNameWithVersion]
          : acc;
      }, []);

      if (!dependencies.length && !devDependencies) return acc;

      return {
        [projectDir]: { dependencies, devDependencies },
        ...acc,
      };
    }, {});
}

/**
 * Update dependencies in projects
 *
 * @param {Object<string, { dependencies: string[], devDependencies: boolean }>} projectsToUpdate
 */
function updateDependencies(projectsToUpdate) {
  if (!process.env.NPM_PUBLISH_REGISTRY)
    throw new Error('NPM_PUBLISH_REGISTRY env variable is not set');

  Object.entries(projectsToUpdate).forEach(
    ([projectDir, { dependencies, devDependencies }]) => {
      if (dependencies?.length) {
        console.log(`Updating dependencies in ${projectDir}:`, dependencies);
        execSync(
          `(cd "${projectDir}" && npm install ${dependencies.join(
            ' '
          )} --registry="$NPM_PUBLISH_REGISTRY")`,
          { stdio: 'inherit' }
        );
      }

      if (devDependencies?.length) {
        console.log(
          `Updating devDependencies in ${projectDir}:`,
          devDependencies
        );
        execSync(
          `(cd "${projectDir}" && npm install ${devDependencies.join(
            ' '
          )} --save-dev --registry="$NPM_PUBLISH_REGISTRY")`,
          { stdio: 'inherit' }
        );
      }
    }
  );
}

/**
 * Update projects with workspace packages
 *
 * @param baseDir
 * @return {*}
 */
export function updateProjectsWithWorkspacePackages(baseDir) {
  const projectsToUpdate = getProjectsToUpdate(baseDir);
  if (!Object.keys(projectsToUpdate).length) {
    return void console.log('No projects to update');
  }

  console.log(
    'Updating projects with workspace packages. This might take a while...'
  );
  updateDependencies(projectsToUpdate);
}
