import { resolve } from 'node:path';
import { qraftTreeShakeRspack } from '@openapi-qraft/tree-shaking-plugin/rspack';
import TerserPlugin from 'terser-webpack-plugin';
import {
  apiClient,
  createAPIClientFn,
  getBundlerOutputDir,
  getScenario,
  isExternalModuleRequest,
} from './scripts/shared.mjs';

const scenario = getScenario(process.env.QRAFT_TREE_SHAKE_SCENARIO ?? '');

export default {
  mode: 'production',
  target: 'web',
  devtool: 'source-map',
  entry: {
    [scenario.name]: resolve(process.cwd(), scenario.entry),
  },
  output: {
    path: getBundlerOutputDir('rspack', scenario),
    filename: '[name].js',
    chunkFilename: 'chunks/[name].js',
    assetModuleFilename: 'assets/[name][ext]',
    module: true,
    clean: true,
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.mts', '.cts', '.mjs', '.js'],
    tsConfig: resolve(process.cwd(), 'tsconfig.json'),
    extensionAlias: {
      '.js': ['.ts', '.js'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    },
  },
  externalsType: 'module',
  externals: [
    ({ request }, callback) => {
      if (request && isExternalModuleRequest(request)) {
        callback(null, `module ${request}`);
        return;
      }

      callback();
    },
  ],
  module: {
    rules: [
      {
        test: /\.[cm]?[jt]sx?$/,
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: {
          loader: 'ts',
          target: 'es2020',
        },
      },
    ],
  },
  optimization: {
    usedExports: true,
    sideEffects: true,
    innerGraph: true,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            dead_code: true,
            collapse_vars: false,
            evaluate: false,
            inline: false,
            reduce_vars: false,
            passes: 1,
          },
          format: {
            beautify: true,
            comments: false,
          },
          keep_classnames: true,
          keep_fnames: true,
          mangle: false,
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [
    qraftTreeShakeRspack({
      createAPIClientFn,
      apiClient,
    }),
  ],
};
