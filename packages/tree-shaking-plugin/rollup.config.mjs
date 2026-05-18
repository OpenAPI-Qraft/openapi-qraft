import { rollupConfig } from '@openapi-qraft/rollup-config';
import packageJson from './package.json' with { type: 'json' };

const entries = [
  '.',
  './vite',
  './rollup',
  './webpack',
  './rspack',
  './esbuild',
];

const config = entries.map((entry) =>
  rollupConfig(
    {
      import: packageJson.exports[entry].import,
      require: packageJson.exports[entry].require,
    },
    {
      treeshake: false,
      input: `src/${entry === '.' ? 'index' : entry.slice(2)}.ts`,
      externalDependencies: [
        '@babel/generator',
        '@babel/parser',
        '@babel/traverse',
        '@babel/types',
        '@rspack/resolver',
        'unplugin',
      ],
    }
  )
);

export default config;
