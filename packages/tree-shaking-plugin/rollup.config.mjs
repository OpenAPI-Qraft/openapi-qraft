import { rollupConfig } from '@openapi-qraft/rollup-config';
import packageJson from './package.json' with { type: 'json' };

const exportedEntries = [
  '.',
  './vite',
  './rollup',
  './webpack',
  './rspack',
  './esbuild',
  './standalone',
];

const externalDependencies = [
  '@babel/generator',
  '@babel/parser',
  '@babel/traverse',
  '@babel/types',
  '@rspack/resolver',
  'jiti',
  'oxc-resolver',
  'tinyglobby',
  'unplugin',
];

const exportedConfigs = exportedEntries.map((entry) =>
  rollupConfig(
    {
      import: packageJson.exports[entry].import,
      require: packageJson.exports[entry].require,
    },
    {
      treeshake: false,
      input: `src/${entry === '.' ? 'index' : entry.slice(2)}.ts`,
      externalDependencies,
    }
  )
);

const binConfig = rollupConfig(
  {
    import: './dist/esm/bin.js',
    require: './dist/cjs/bin.cjs',
  },
  {
    treeshake: false,
    input: 'src/bin.ts',
    externalDependencies,
  }
);

export default [...exportedConfigs, binConfig];
