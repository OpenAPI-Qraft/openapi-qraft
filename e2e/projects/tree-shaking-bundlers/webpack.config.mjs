import { resolve } from 'node:path';
import { qraftTreeShakeWebpack } from '@openapi-qraft/tree-shaking-plugin/webpack';
import TerserPlugin from 'terser-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import {
  createAPIClientFn,
  getBundlerOutputDir,
  getScenario,
  isExternalModuleRequest,
} from './scripts/shared.mjs';

const scenario = getScenario(process.env.QRAFT_TREE_SHAKE_SCENARIO ?? '');

export default {
  mode: 'production',
  target: 'web',
  entry: {
    [scenario.name]: resolve(process.cwd(), scenario.entry),
  },
  output: {
    path: getBundlerOutputDir('webpack', scenario),
    filename: '[name].js',
    chunkFilename: 'chunks/[name].js',
    assetModuleFilename: 'assets/[name][ext]',
    clean: true,
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
    },
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(process.cwd(), 'tsconfig.json'),
      }),
    ],
    extensions: ['.ts', '.tsx', '.mts', '.cts', '.mjs', '.js'],
    extensionAlias: {
      '.js': ['.js', '.ts'],
      '.mjs': ['.mjs', '.mts'],
      '.cjs': ['.cjs', '.cts'],
    },
  },
  externalsType: 'commonjs',
  externals: [
    ({ request }, callback) => {
      if (request && isExternalModuleRequest(request)) {
        callback(null, request);
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
  plugins: [qraftTreeShakeWebpack({ createAPIClientFn })],
};
