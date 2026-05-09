import { isAbsolute, resolve } from 'node:path';

export const bundlers = ['vite', 'rollup', 'webpack', 'rspack', 'esbuild'];

const unique = (values) => [...new Set(values.filter(Boolean))];

const qraftReactAPIClientPattern = /qraftReactAPIClient(?:__|\()/;
const qraftAPIClientPattern = /qraftAPIClient(?:__|\()/;

const contextScenario = ({ name, entry, include, exclude }) => ({
  name,
  mode: 'context',
  entry,
  include: unique([qraftReactAPIClientPattern, ...include]),
  exclude: unique([
    qraftAPIClientPattern,
    'allCallbacks',
    'petsService',
    'storesService',
    ...exclude,
  ]),
});

const precreatedScenario = ({
  name,
  entry,
  include,
  exclude,
  clientToken = 'qraftAPIClient',
  optionsToken = 'createAPIClientOptions',
}) => ({
  name,
  mode: 'precreated',
  entry,
  clientToken,
  optionsToken,
  include: unique([optionsToken, qraftAPIClientPattern, ...include]),
  exclude: unique([
    'allCallbacks',
    qraftReactAPIClientPattern,
    'petsService',
    'storesService',
    ...exclude,
  ]),
});

const mixedScenario = ({ name, entry, include, exclude }) => ({
  name,
  mode: 'mixed',
  entry,
  include: unique([
    qraftReactAPIClientPattern,
    qraftAPIClientPattern,
    ...include,
  ]),
  exclude: unique(['allCallbacks', 'petsService', 'storesService', ...exclude]),
});

export const scenarios = [
  contextScenario({
    name: 'barrel-context-relative',
    entry: 'src/barrel-context-relative.ts',
    include: [
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
  }),
  precreatedScenario({
    name: 'barrel-precreated-relative',
    entry: 'src/barrel-precreated-relative.ts',
    clientToken: 'BarrelClient',
    optionsToken: 'createBarrelClientOptions',
    include: [
      'qraftAPIClient',
      '@openapi-qraft/react/callbacks/useQuery',
      'getPets',
      'createBarrelClientOptions',
    ],
    exclude: [
      'BarrelAPIClientContext',
      'createAPIClientOptions',
      'allCallbacks',
      '@openapi-qraft/react/callbacks/useMutation',
      'getStores',
      'createPet',
      'createBarrelPrecreatedAPIClient',
    ],
  }),
  contextScenario({
    name: 'barrel-context-alias',
    entry: 'src/barrel-context-alias.ts',
    include: [
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
  }),
  precreatedScenario({
    name: 'barrel-precreated-alias',
    entry: 'src/barrel-precreated-alias.ts',
    clientToken: 'BarrelClient',
    optionsToken: 'createBarrelClientOptions',
    include: [
      'qraftAPIClient',
      '@openapi-qraft/react/callbacks/useQuery',
      'getStores',
      'createBarrelClientOptions',
    ],
    exclude: [
      'AliasAPIClientContext',
      'createAPIClientOptions',
      'allCallbacks',
      '@openapi-qraft/react/callbacks/useMutation',
      'getPets',
      'createPet',
      'createBarrelPrecreatedAPIClient',
    ],
  }),
  contextScenario({
    name: 'file-context-relative',
    entry: 'src/file-context-relative.ts',
    include: [
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
  }),
  precreatedScenario({
    name: 'file-precreated-relative',
    entry: 'src/file-precreated-relative.ts',
    clientToken: 'RelativeClient',
    optionsToken: 'buildRelativeClientOptions',
    include: [
      'qraftAPIClient',
      '@openapi-qraft/react/callbacks/useMutation',
      'createPet',
      'buildRelativeClientOptions',
    ],
    exclude: [
      'RelativeAPIClientContext',
      'createAPIClientOptions',
      'allCallbacks',
      '@openapi-qraft/react/callbacks/useQuery',
      'getPets',
      'getStores',
      'createBarrelClientOptions',
      'createRelativePrecreatedAPIClient',
    ],
  }),
  contextScenario({
    name: 'file-context-alias',
    entry: 'src/file-context-alias.ts',
    include: [
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
  }),
  precreatedScenario({
    name: 'file-precreated-alias',
    entry: 'src/file-precreated-alias.ts',
    clientToken: 'AliasDirectClient',
    optionsToken: 'createAliasDirectClientOptions',
    include: [
      'qraftAPIClient',
      '@openapi-qraft/react/callbacks/useQuery',
      'getStores',
      'createAliasDirectClientOptions',
    ],
    exclude: [
      'AliasDirectAPIClientContext',
      'createAPIClientOptions',
      'allCallbacks',
      '@openapi-qraft/react/callbacks/useMutation',
      'getPets',
      'createPet',
      'createAliasDirectPrecreatedAPIClient',
    ],
  }),
  contextScenario({
    name: 'file-context-relative-ext',
    entry: 'src/file-context-relative-ext.ts',
    include: [
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
  }),
  precreatedScenario({
    name: 'file-precreated-relative-ext',
    entry: 'src/file-precreated-relative-ext.ts',
    clientToken: 'RelativeExtClient',
    optionsToken: 'createRelativeExtClientOptions',
    include: [
      'qraftAPIClient',
      '@openapi-qraft/react/callbacks/useMutation',
      'createPet',
      'createRelativeExtClientOptions',
    ],
    exclude: [
      'RelativeExtAPIClientContext',
      'createAPIClientOptions',
      'allCallbacks',
      '@openapi-qraft/react/callbacks/useQuery',
      'getStores',
      'getPets',
      'createRelativeExtPrecreatedAPIClient',
    ],
  }),
  mixedScenario({
    name: 'mixed-context-precreated-mirrors',
    entry: 'src/mixed-context-precreated-mirrors.ts',
    include: [
      'qraftAPIClient',
      'qraftReactAPIClient',
      '@openapi-qraft/react/callbacks/useQuery',
      '@openapi-qraft/react/callbacks/useMutation',
      'getPets',
      'getPets.schema',
      'getStores',
      'getStores.schema',
      'createPet',
      'createPet.schema',
      'BarrelAPIClientContext',
      'RelativeAPIClientContext',
      'RelativeExtAPIClientContext',
      'AliasAPIClientContext',
      'AliasDirectAPIClientContext',
      'createBarrelClientOptions',
      'buildRelativeClientOptions',
      'createAliasDirectClientOptions',
      'createRelativeExtClientOptions',
      'barrelPrecreatedFromRelativeApi_pets_getPets',
      'barrelPrecreatedFromAliasApi_stores_getStores',
      'fileRelativePrecreatedApi_pets_createPet',
      'fileAliasPrecreatedApi_stores_getStores',
      'fileRelativeExtPrecreatedApi_pets_createPet',
    ],
    exclude: [],
  }),
];

export const apiClient = [
  {
    client: 'BarrelClient',
    clientModule: '@/precreated/clients/barrel',
    createAPIClientFn: 'createBarrelPrecreatedAPIClient',
    createAPIClientFnModule: '@/precreated/clients/barrel', // re-export of './generated-api/create-barrel-precreated-api-client.ts'
    createAPIClientFnOptions: 'createBarrelClientOptions',
    createAPIClientFnOptionsModule: '@/precreated/clients/barrel',
  },
  {
    client: 'RelativeClient',
    clientModule: './precreated/clients/file-relative.ts',
    createAPIClientFn: 'createRelativePrecreatedAPIClient',
    createAPIClientFnModule:
      './generated-api/create-relative-precreated-api-client.ts',
    createAPIClientFnOptions: 'buildRelativeClientOptions',
    createAPIClientFnOptionsModule: './precreated/options/barrel',
  },
  {
    client: 'AliasDirectClient',
    clientModule: '@/precreated/clients/file-alias.ts',
    createAPIClientFn: 'createAliasDirectPrecreatedAPIClient',
    createAPIClientFnModule:
      './generated-api/create-alias-direct-precreated-api-client.ts',
    createAPIClientFnOptions: 'createAliasDirectClientOptions',
    createAPIClientFnOptionsModule: '@/precreated/options',
  },
  {
    client: 'RelativeExtClient',
    clientModule: './precreated/clients/file-relative-ext.ts',
    createAPIClientFn: 'createRelativeExtPrecreatedAPIClient',
    createAPIClientFnModule:
      './generated-api/create-relative-ts-precreated-api-client.ts',
    createAPIClientFnOptions: 'createRelativeExtClientOptions',
    createAPIClientFnOptionsModule: './precreated/options/direct.ts',
  },
];

export const createAPIClientFn = [
  {
    name: 'createBarrelAPIClient',
    module: './generated-api',
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
    module: './generated-api/create-relative-ts-api-client.ts',
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
    module: './generated-api/create-alias-direct-api-client',
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

export function getBundleMapPath(bundler, scenario) {
  return resolve(
    getBundlerOutputDir(bundler, scenario),
    `${scenario.name}.js.map`
  );
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
