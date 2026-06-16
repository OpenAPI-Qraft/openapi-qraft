import type { QraftTreeShakeProjectConfig } from './standalone.js';
import path from 'node:path';
import process from 'node:process';
import { parseArgs as parseNodeArgs } from 'node:util';
import {
  findTransformQraftProjectConfig,
  formatTransformQraftProjectSummary,
  loadTransformQraftProjectConfig,
  transformQraftProject,
} from './standalone.js';

export type QraftTreeShakeCliIo = {
  log(message: string): void;
  error(message: string): void;
};

const usageText = `Usage: qraft-tree-shake [--config <path>] [--root <path>] [--write]

Options:
  --config <path>  Path to qraft-tree-shake config
  --root <path>    Project root for config discovery and relative paths
  --write          Write transformed code back to source files
  --help           Show this help`;

type CliValues = {
  config?: string;
  help: boolean;
  root?: string;
  write: boolean;
};

export async function main(
  processArgv = process.argv,
  io: QraftTreeShakeCliIo = console
): Promise<number> {
  try {
    const values = parseArgs(processArgv.slice(2));

    if (values.help) {
      io.log(usageText);
      return 0;
    }

    const root = path.resolve(values.root ?? process.cwd());
    const configFile = values.config
      ? resolveConfigPath(root, values.config)
      : await findTransformQraftProjectConfig(root);

    if (!configFile) {
      io.error(`No qraft-tree-shake config found in ${root}.`);
      return 1;
    }

    const config = await loadTransformQraftProjectConfig(configFile);
    const projectOptions = {
      ...config,
      root,
      mode: values.write ? 'write' : 'preview',
    } satisfies QraftTreeShakeProjectConfig;
    const result = await transformQraftProject(projectOptions);
    const summary = formatTransformQraftProjectSummary(result);

    if (result.summary.failed > 0) {
      io.error(summary);
      return 1;
    }

    io.log(summary);
    return 0;
  } catch (error) {
    io.error(formatErrorMessage(error));
    return 1;
  }
}

function parseArgs(args: string[]): CliValues {
  const { values } = parseNodeArgs({
    args,
    options: {
      help: { type: 'boolean' },
      config: { type: 'string' },
      root: { type: 'string' },
      write: { type: 'boolean' },
    },
    strict: true,
    allowPositionals: false,
  });

  return {
    config: values.config,
    help: values.help ?? false,
    root: values.root,
    write: values.write ?? false,
  };
}

function resolveConfigPath(root: string, configPath: string) {
  return path.isAbsolute(configPath)
    ? configPath
    : path.resolve(root, configPath);
}

function formatErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
