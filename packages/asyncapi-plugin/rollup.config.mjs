import { rollupConfig } from '@openapi-qraft/rollup-config';
import renameNodeModules from 'rollup-plugin-rename-node-modules';
import packageJson from './package.json' with { type: 'json' };

const baseConfig = rollupConfig(
  { import: packageJson['exports']['.']['import'] },
  {
    input: 'src/index.ts',
    externalDependencies: Object.keys(packageJson.dependencies),
    esmOnly: true,
  }
);

const config = [
  {
    ...baseConfig,
    plugins: [...baseConfig.plugins, renameNodeModules('_vendor')],
  },
];

export default config;
