import { rollupConfig } from '@openapi-qraft/rollup-config';
import packageJson from './package.json' with { type: 'json' };

const moduleDist = {
  import: packageJson['exports']['.']['import'],
  require: packageJson['exports']['.']['require'],
};

const config = [rollupConfig(moduleDist, { input: 'src/index.ts' })];

export default config;
