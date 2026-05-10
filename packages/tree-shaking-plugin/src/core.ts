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
import { applyTransformPlan } from './lib/transform/mutate.js';
import { createTransformPlan } from './lib/transform/plan.js';

export type FilterPattern = string | RegExp | Array<string | RegExp>;

export type QraftFactoryConfig = {
  name: string;
  module: string;
  context?: string;
  contextModule?: string;
};

export type QraftPrecreatedClientConfig = {
  client: string;
  clientModule: string;
  createAPIClientFn: string;
  createAPIClientFnModule: string;
  createAPIClientFnOptions: string;
  createAPIClientFnOptionsModule?: string;
};

export type {
  QraftModuleAccess,
  QraftModuleAccessOptions,
  QraftResolver,
} from './lib/resolvers/common.js';

export type QraftTreeShakeOptions = {
  createAPIClientFn?: QraftFactoryConfig[];
  apiClient?: QraftPrecreatedClientConfig[];
  resolve?: QraftResolver;
  moduleAccess?: QraftModuleAccessOptions;
  include?: FilterPattern;
  exclude?: FilterPattern;
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

  if (!shouldTransformId(id, options)) return null;

  const factoryOptions = options.createAPIClientFn ?? [];
  const precreatedOptions = options.apiClient ?? [];
  if (factoryOptions.length === 0 && precreatedOptions.length === 0) {
    return debugSkip(options, id, 'no API clients configured');
  }

  const plan = await createTransformPlan(code, id, options, moduleAccess);
  if (!plan.namedUsages.length && !plan.inlineUsages.length) return null;

  applyTransformPlan(plan, plan.runtimeLocalNames);

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

function shouldTransformId(id: string, options: QraftTreeShakeOptions) {
  if (id.includes('/node_modules/')) return false;
  if (!/\.[cm]?[jt]sx?$/.test(id)) return false;
  if (matchesPattern(id, options.exclude)) return false;
  if (options.include && !matchesPattern(id, options.include)) return false;
  return true;
}

function matchesPattern(
  id: string,
  pattern: FilterPattern | undefined
): boolean {
  if (!pattern) return false;
  if (Array.isArray(pattern))
    return pattern.some((item) => matchesPattern(id, item));
  if (typeof pattern === 'string') return id.includes(pattern);
  return pattern.test(id);
}

function debugSkip(options: QraftTreeShakeOptions, id: string, reason: string) {
  if (options.debug) {
    console.warn(
      `[openapi-qraft/tree-shaking-plugin] skipped ${id}: ${reason}`
    );
  }
  return null;
}

function resolveDefaultExport<T>(module: unknown): T {
  const firstDefault = (module as { default?: unknown }).default;
  const secondDefault = (firstDefault as { default?: unknown } | undefined)
    ?.default;
  return (secondDefault ?? firstDefault ?? module) as T;
}
