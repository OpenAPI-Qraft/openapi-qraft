import type { GeneratorOptions as BabelGeneratorOptions } from '@babel/generator';
// eslint-disable-next-line import-x/no-extraneous-dependencies
import type { SourceMapInput } from '@jridgewell/trace-mapping';
import type {
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
} from './lib/resolvers/common.js';
import * as generateModule from '@babel/generator';
import { createAgnosticModuleAccess } from './lib/resolvers/agnostic.js';
import { normalizeEntrypoints } from './lib/transform/entrypoints.js';
import { applyTransformPlan } from './lib/transform/mutate.js';
import { createTransformPlan } from './lib/transform/plan.js';
import { shouldInspectSource } from './lib/transform/source-gate.js';

export type FilterPattern = string | RegExp | Array<string | RegExp>;

export type ModuleExportTarget = {
  exportName: string;
  moduleSpecifier: string;
};

export type ReactContextTarget = {
  exportName: string;
  moduleSpecifier?: string;
};

export type QraftClientFactoryEntrypointConfig = {
  kind: 'clientFactory';
  factory: ModuleExportTarget;
  reactContext?: ReactContextTarget;
};

export type QraftPrecreatedClientEntrypointConfig = {
  kind: 'precreatedClient';
  client: ModuleExportTarget;
  factory: ModuleExportTarget;
  optionsFactory: ModuleExportTarget;
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
  debug?: boolean;
};

type GenerateFn = (typeof import('@babel/generator'))['default'];
type GeneratorOptions = Omit<BabelGeneratorOptions, 'inputSourceMap'> & {
  inputSourceMap?: SourceMapInput;
};
type QraftModuleAccessInput = QraftModuleAccess | QraftResolver;

const generate = resolveDefaultExport<GenerateFn>(generateModule);

export async function transformQraftTreeShaking(
  code: string,
  id: string,
  options: QraftTreeShakeOptions,
  moduleAccessOrResolver?: QraftModuleAccessInput,
  inputSourceMap?: SourceMapInput
) {
  const moduleAccess =
    moduleAccessOrResolver === undefined
      ? createAgnosticModuleAccess({
          resolve: options.moduleAccess?.resolve ?? options.resolve,
          load: options.moduleAccess?.load,
        })
      : typeof moduleAccessOrResolver === 'function'
        ? createAgnosticModuleAccess({
            resolve: options.moduleAccess?.resolve ?? moduleAccessOrResolver,
            load: options.moduleAccess?.load,
          })
        : moduleAccessOrResolver;

  const entrypoints = normalizeEntrypoints(options);
  if (
    !shouldInspectSource({
      code,
      id,
      entrypoints,
      include: options.include,
      exclude: options.exclude,
    })
  ) {
    return null;
  }

  const plan = await createTransformPlan(code, id, options, moduleAccess);
  if (!plan.namedUsages.length && !plan.inlineUsages.length) return null;

  applyTransformPlan(plan);

  const generatorOptions = {
    sourceMaps: true,
    sourceFileName: id,
    jsescOption: { minimal: true },
    inputSourceMap,
  } satisfies GeneratorOptions;

  const result = generate(plan.ast, generatorOptions);

  return {
    code: result.code,
    map: result.map,
  };
}

function resolveDefaultExport<T>(module: unknown): T {
  const firstDefault = (module as { default?: unknown }).default;
  const secondDefault = (firstDefault as { default?: unknown } | undefined)
    ?.default;
  return (secondDefault ?? firstDefault ?? module) as T;
}
