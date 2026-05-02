import { rmSync } from 'node:fs';
import { rspack } from '@rspack/core';
import { bundlers, getBundlerOutputDir, getScenario } from './scenarios.mjs';

if (!bundlers.includes('rspack')) {
  throw new Error('Rspack is not configured for this fixture.');
}

const scenarioName = process.argv[2] ?? process.env.QRAFT_TREE_SHAKE_SCENARIO;

if (!scenarioName) {
  throw new Error(
    'Pass a scenario name as argv[2] or set QRAFT_TREE_SHAKE_SCENARIO.'
  );
}

const scenario = getScenario(scenarioName);

console.log(`Building tree-shaking bundle: rspack / ${scenario.name}`);

rmSync(getBundlerOutputDir('rspack', scenario), {
  force: true,
  recursive: true,
});

process.env.QRAFT_TREE_SHAKE_BUNDLER = 'rspack';
process.env.QRAFT_TREE_SHAKE_SCENARIO = scenario.name;
process.env.QRAFT_TREE_SHAKE_DEBUG = '1';

const { default: config } = await import('../rspack.config.mjs');

await new Promise((resolve, reject) => {
  rspack(config, (error, stats) => {
    if (error) {
      reject(error);
      return;
    }

    if (!stats) {
      reject(new Error('Rspack returned no stats object.'));
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      reject(new Error(JSON.stringify(info.errors, null, 2)));
      return;
    }

    if (stats.hasWarnings()) {
      console.warn(stats.toString({ colors: true }));
    }

    resolve(stats);
  });
});
