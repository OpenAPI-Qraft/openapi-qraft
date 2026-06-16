import type { QraftTreeShakeOptions } from '../../core.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'tinyglobby';
import { transformQraftTreeShaking } from '../../core.js';
import { resolvePluginSourceFilterOptions } from '../plugin/create-qraft-tree-shake-plugin.js';
import { createNodeModuleAccess } from '../resolvers/node.js';
import { createGeneratedMetadataCache } from '../transform/generated-metadata.js';

export type TransformQraftProjectMode = 'preview' | 'write';

export type TransformQraftProjectOptions = {
  root?: string;
  files?: string[];
  include?: string | string[];
  exclude?: string | string[];
  treeShakeOptions: QraftTreeShakeOptions;
  mode?: TransformQraftProjectMode;
};

export type QraftTreeShakeProjectConfig = TransformQraftProjectOptions;

export type TransformQraftProjectFileResult =
  | {
      status: 'changed';
      filePath: string;
      code: string;
      outputCode: string;
      written: boolean;
    }
  | {
      status: 'skipped';
      filePath: string;
      code: string;
      written: false;
    }
  | {
      status: 'failed';
      filePath: string;
      code: string;
      written: false;
      error: unknown;
    };

export type TransformQraftProjectSummary = {
  total: number;
  changed: number;
  skipped: number;
  failed: number;
  written: number;
};

export type TransformQraftProjectResult = {
  root: string;
  mode: TransformQraftProjectMode;
  files: TransformQraftProjectFileResult[];
  summary: TransformQraftProjectSummary;
};

const defaultProjectInclude = ['src/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}'];
const defaultProjectExclude = ['node_modules/**', 'dist/**', '**/*.d.ts'];

export async function transformQraftProject(
  options: TransformQraftProjectOptions
): Promise<TransformQraftProjectResult> {
  const root = path.resolve(options.root ?? process.cwd());
  const mode = options.mode ?? 'preview';
  const files = await resolveProjectFiles({
    root,
    files: options.files,
    include: options.include,
    exclude: options.exclude,
  });
  const generatedMetadataCache = createGeneratedMetadataCache();
  const moduleAccess = createNodeModuleAccess({
    root,
    moduleAccess: {
      ...options.treeShakeOptions.moduleAccess,
      resolve:
        options.treeShakeOptions.moduleAccess?.resolve ??
        options.treeShakeOptions.resolve,
    },
  });
  const sourceFilters = resolvePluginSourceFilterOptions(
    options.treeShakeOptions
  );
  const results: TransformQraftProjectFileResult[] = [];

  for (const filePath of files) {
    let code = '';

    try {
      code = await fs.readFile(filePath, 'utf8');
      const transformResult = await transformQraftTreeShaking(
        code,
        filePath,
        options.treeShakeOptions,
        moduleAccess,
        undefined,
        generatedMetadataCache,
        sourceFilters
      );

      if (!transformResult || transformResult.code === code) {
        results.push({
          status: 'skipped',
          filePath,
          code,
          written: false,
        });
        continue;
      }

      if (mode === 'write') {
        await fs.writeFile(filePath, transformResult.code);
      }

      results.push({
        status: 'changed',
        filePath,
        code,
        outputCode: transformResult.code,
        written: mode === 'write',
      });
    } catch (error) {
      results.push({
        status: 'failed',
        filePath,
        code,
        written: false,
        error,
      });
    }
  }

  return {
    root,
    mode,
    files: results,
    summary: summarizeProjectTransform(results),
  };
}

export function formatTransformQraftProjectSummary(
  result: TransformQraftProjectResult
): string {
  const lines = [
    `Processed ${result.summary.total} files: ${result.summary.changed} changed, ${result.summary.skipped} skipped, ${result.summary.failed} failed, ${result.summary.written} written.`,
  ];
  const changedFiles = result.files.filter((file) => file.status === 'changed');
  const failedFiles = result.files.filter((file) => file.status === 'failed');

  if (changedFiles.length) {
    lines.push('', `Changed (${changedFiles.length}):`);
    lines.push(...formatFileList(result.root, changedFiles));
  }

  if (failedFiles.length) {
    lines.push('', `Failed (${failedFiles.length}):`);
    lines.push(...formatFileList(result.root, failedFiles));
  }

  return lines.join('\n');
}

async function resolveProjectFiles({
  root,
  files,
  include,
  exclude,
}: {
  root: string;
  files?: string[];
  include?: string | string[];
  exclude?: string | string[];
}) {
  if (files) {
    return [
      ...new Set(files.map((filePath) => path.resolve(root, filePath))),
    ].sort();
  }

  const includePatterns = normalizePatterns(include, defaultProjectInclude);
  const excludePatterns = normalizePatterns(exclude, defaultProjectExclude);
  const discoveredFiles = await glob(includePatterns, {
    cwd: root,
    absolute: true,
    ignore: excludePatterns,
    onlyFiles: true,
  });

  return [
    ...new Set(discoveredFiles.map((filePath) => path.resolve(filePath))),
  ].sort();
}

function normalizePatterns(
  patterns: string | string[] | undefined,
  defaults: string[]
) {
  if (patterns === undefined) return defaults;
  return Array.isArray(patterns) ? patterns : [patterns];
}

function summarizeProjectTransform(
  files: TransformQraftProjectFileResult[]
): TransformQraftProjectSummary {
  return files.reduce<TransformQraftProjectSummary>(
    (summary, file) => ({
      total: summary.total + 1,
      changed: summary.changed + (file.status === 'changed' ? 1 : 0),
      skipped: summary.skipped + (file.status === 'skipped' ? 1 : 0),
      failed: summary.failed + (file.status === 'failed' ? 1 : 0),
      written: summary.written + (file.written ? 1 : 0),
    }),
    {
      total: 0,
      changed: 0,
      skipped: 0,
      failed: 0,
      written: 0,
    }
  );
}

function formatFileList(
  root: string,
  files: Array<Pick<TransformQraftProjectFileResult, 'filePath'>>
) {
  return files.map((file) => `- ${path.relative(root, file.filePath)}`);
}
