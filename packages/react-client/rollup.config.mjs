import { rollupConfig } from '@openapi-qraft/rollup-config';

import packageJson from './package.json' assert { type: 'json' };

export default rollupConfig({
  module: packageJson['exports']['.']['import'],
  main: packageJson['exports']['.']['require'],
});
