import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  bundlers,
  getBundlerOutputDir,
  scenarios,
} from './scenarios.mjs';

const runners = {
  vite: (scenario) => ({
    command: 'vite',
    args: ['build', '--config', 'vite.config.ts', '--mode', scenario.name],
  }),
  rollup: () => ({
    command: 'rollup',
    args: ['--config', 'rollup.config.mjs'],
  }),
  webpack: () => ({
    command: 'webpack',
    args: ['--config', 'webpack.config.mjs'],
  }),
  rspack: () => ({
    command: 'rspack',
    args: ['--config', 'rspack.config.mjs'],
  }),
  esbuild: () => ({
    command: process.execPath,
    args: ['scripts/build-esbuild.mjs'],
  }),
};

for (const bundler of bundlers) {
  for (const scenario of scenarios) {
    console.log(`Building tree-shaking bundle: ${bundler} / ${scenario.name}`);

    rmSync(getBundlerOutputDir(bundler, scenario), {
      force: true,
      recursive: true,
    });

    const runner = runners[bundler](scenario);
    const result = spawnSync(runner.command, runner.args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        QRAFT_TREE_SHAKE_BUNDLER: bundler,
        QRAFT_TREE_SHAKE_SCENARIO: scenario.name,
      },
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}
