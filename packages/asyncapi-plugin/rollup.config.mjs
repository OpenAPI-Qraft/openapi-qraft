import { rollupConfig } from '@openapi-qraft/rollup-config';
import packageJson from './package.json' with { type: 'json' };

const config = [
  rollupConfig(
    { import: packageJson['exports']['.']['import'] },
    {
      input: 'src/index.ts',
      externalDependencies: Object.keys(packageJson.dependencies),
      esmOnly: true,
    }
  ),
];

export default config;
