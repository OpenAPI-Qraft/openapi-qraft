import { isAbsolute, resolve } from 'node:path';

export const bundlers = ['vite', 'rollup', 'webpack', 'rspack', 'esbuild'];

export const scenarios = [
  {
    name: 'barrel-relative',
    entry: 'src/barrel-relative.ts',
    include: [
      'qraftReactAPIClient',
      '@openapi-qraft/react/callbacks/useQuery',
      'getPets',
      'BarrelAPIClientContext',
    ],
    exclude: [
      'qraftAPIClient(',
      'allCallbacks',
      '@openapi-qraft/react/callbacks/useMutation',
      'getStores',
      'createPet',
    ],
  },
  {
    name: 'barrel-alias',
    entry: 'src/barrel-alias.ts',
    include: [
      'qraftReactAPIClient',
      '@openapi-qraft/react/callbacks/useQuery',
      'getStores',
      'AliasAPIClientContext',
    ],
    exclude: [
      'qraftAPIClient(',
      'allCallbacks',
      '@openapi-qraft/react/callbacks/useMutation',
      'getPets',
      'createPet',
    ],
  },
  {
    name: 'file-relative',
    entry: 'src/file-relative.ts',
    include: [
      'qraftReactAPIClient',
      '@openapi-qraft/react/callbacks/useMutation',
      'createPet',
      'RelativeAPIClientContext',
    ],
    exclude: [
      'qraftAPIClient(',
      'allCallbacks',
      '@openapi-qraft/react/callbacks/useQuery',
      'getPets',
      'getStores',
    ],
  },
  {
    name: 'file-alias',
    entry: 'src/file-alias.ts',
    include: [
      'qraftReactAPIClient',
      '@openapi-qraft/react/callbacks/useQuery',
      'getStores',
      'AliasDirectAPIClientContext',
    ],
    exclude: [
      'qraftAPIClient(',
      'allCallbacks',
      '@openapi-qraft/react/callbacks/useMutation',
      'getPets',
      'createPet',
    ],
  },
  {
    name: 'file-relative-ext',
    entry: 'src/file-relative-ext.ts',
    include: [
      'qraftReactAPIClient',
      '@openapi-qraft/react/callbacks/useMutation',
      'createPet',
      'RelativeExtAPIClientContext',
    ],
    exclude: [
      'qraftAPIClient(',
      'allCallbacks',
      '@openapi-qraft/react/callbacks/useQuery',
      'getStores',
      'getPets',
    ],
  },
  {
    name: 'mixed-source-mirrors',
    entry: 'src/mixed-source-mirrors.ts',
    include: [
      'qraftReactAPIClient',
      '@openapi-qraft/react/callbacks/useQuery',
      '@openapi-qraft/react/callbacks/useMutation',
      'getPets',
      'getStores',
      'createPet',
      'BarrelAPIClientContext',
      'RelativeAPIClientContext',
      'RelativeExtAPIClientContext',
      'AliasAPIClientContext',
      'AliasDirectAPIClientContext',
    ],
    exclude: ['qraftAPIClient(', 'allCallbacks'],
  },
];

export const createAPIClientFn = [
  {
    name: 'createBarrelAPIClient',
    module: './src/generated-api',
    context: 'BarrelAPIClientContext',
  },
  {
    name: 'createRelativeAPIClient',
    module: '@/generated-api/create-relative-api-client',
    context: 'RelativeAPIClientContext',
    contextModule: './generated-api/RelativeAPIClientContext',
  },
  {
    name: 'createRelativeExtAPIClient',
    module: './src/generated-api/create-relative-ts-api-client.ts',
    context: 'RelativeExtAPIClientContext',
    contextModule: '@/generated-api/RelativeExtAPIClientContext',
  },
  {
    name: 'createAliasAPIClient',
    module: '@/generated-api',
    context: 'AliasAPIClientContext',
    contextModule: '@/generated-api',
  },
  {
    name: 'createAliasDirectAPIClient',
    module: './src/generated-api/create-alias-direct-api-client',
    context: 'AliasDirectAPIClientContext',
    contextModule: './generated-api/AliasDirectAPIClientContext',
  },
];

export function getScenario(name) {
  const scenario = scenarios.find((candidate) => candidate.name === name);

  if (!scenario) {
    throw new Error(`Unknown tree-shaking scenario: ${name}`);
  }

  return scenario;
}

export function getBundlerOutputDir(bundler, scenario) {
  return resolve(process.cwd(), 'dist', bundler, scenario.name);
}

export function getBundlePath(bundler, scenario) {
  return resolve(getBundlerOutputDir(bundler, scenario), `${scenario.name}.js`);
}

export function isExternalModuleRequest(request) {
  if (!request) {
    return false;
  }

  if (request.startsWith('@/')) {
    return false;
  }

  if (
    request.startsWith('.') ||
    request.startsWith('/') ||
    request.startsWith('file:') ||
    request.startsWith('data:') ||
    request.startsWith('node:')
  ) {
    return request.startsWith('node:');
  }

  return !isAbsolute(request);
}
