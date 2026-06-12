import type { GeneratorOptions as BabelGeneratorOptions } from '@babel/generator';
// eslint-disable-next-line import-x/no-extraneous-dependencies
import type { SourceMapInput } from '@jridgewell/trace-mapping';
import type {
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
} from './lib/resolvers/common.js';
import type { SourceFilterOptions } from './lib/transform/source-gate.js';
import * as generateModule from '@babel/generator';
import { resolveDefaultExport } from './lib/interop/resolve-default-export.js';
import { normalizeEntrypoints } from './lib/transform/entrypoints.js';
import { type GeneratedMetadataCache } from './lib/transform/generated-metadata.js';
import { applyTransformMutations } from './lib/transform/mutate.js';
import { shouldInspectSource } from './lib/transform/source-gate.js';
import { createTransformState } from './lib/transform/state.js';

export type FilterPattern = string | RegExp | Array<string | RegExp>;

export type ModuleExportTarget = {
  exportName: string;
  moduleSpecifier: string;
};

export type ReactContextTarget = {
  exportName: string;
  moduleSpecifier?: string;
};

export type ServicesTarget = {
  moduleSpecifierBase?: string;
  directory?: string;
};

export type QraftClientFactoryEntrypointConfig = {
  kind: 'clientFactory';
  factory: ModuleExportTarget;
  services?: ServicesTarget;
  reactContext?: ReactContextTarget;
};

export type QraftPrecreatedClientEntrypointConfig = {
  kind: 'precreatedClient';
  client: ModuleExportTarget;
  factory: ModuleExportTarget;
  optionsFactory: ModuleExportTarget;
  services?: ServicesTarget;
};

export type QraftEntrypointConfig =
  | QraftClientFactoryEntrypointConfig
  | QraftPrecreatedClientEntrypointConfig;

export type DiagnosticsLevel = 'error' | 'warn' | 'off';

export type {
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
} from './lib/resolvers/common.js';

export type QraftTreeShakeOptions = {
  entrypoints?: QraftEntrypointConfig[];
  resolve?: QraftResolver;
  /**
   * Advanced source-provider override. Normal bundler integrations provide
   * this automatically; use it only for virtual modules or custom
   * filesystems/source providers.
   */
  moduleAccess?: QraftModuleAccessOptions;
  include?: FilterPattern;
  exclude?: FilterPattern;
  diagnostics?: DiagnosticsLevel;
};

type GenerateFn = (typeof import('@babel/generator'))['default'];
type GeneratorOptions = Omit<BabelGeneratorOptions, 'inputSourceMap'> & {
  inputSourceMap?: SourceMapInput;
};

const generate = resolveDefaultExport<GenerateFn>(generateModule);

export async function transformQraftTreeShaking(
  code: string,
  id: string,
  options: QraftTreeShakeOptions,
  moduleAccess: QraftModuleAccess,
  inputSourceMap: SourceMapInput | undefined,
  generatedMetadataCache: GeneratedMetadataCache,
  sourceFilters: SourceFilterOptions
) {
  const entrypoints = normalizeEntrypoints(options);
  if (
    !shouldInspectSource({
      code,
      id,
      entrypoints,
      include: sourceFilters.include,
      exclude: sourceFilters.exclude,
    })
  ) {
    return null;
  }

  const state = await createTransformState(
    code,
    id,
    options,
    moduleAccess,
    generatedMetadataCache
  );
  if (!state.namedUsages.length && !state.inlineUsages.length) return null;

  applyTransformMutations(state);

  const generatorOptions = {
    sourceMaps: true,
    sourceFileName: id,
    jsescOption: { minimal: true },
    inputSourceMap,
  } satisfies GeneratorOptions;

  const result = generate(state.ast, generatorOptions);

  return {
    code: result.code,
    map: result.map,
  };
}
