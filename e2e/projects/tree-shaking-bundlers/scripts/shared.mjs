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

const apiOnlyScenario = ({ name, entry, include, exclude, ...scenario }) => ({
  name,
  mode: 'apiOnly',
  entry,
  ...scenario,
  include: unique([qraftAPIClientPattern, ...include]),
  exclude: unique([
    qraftReactAPIClientPattern,
    'allCallbacks',
    'APIClientContext',
    ...exclude,
  ]),
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
  apiOnlyScenario({
    name: 'node-api-helper-selection',
    entry: 'src/node-api-helper-selection.ts',
    include: ['getQueryKey', 'invalidateQueries', 'setQueryData', 'getPets'],
    exclude: ['createNodeAPIClient'],
  }),
  {
    name: 'barrel-mixed-helper-selection',
    mode: 'mixed',
    entry: 'src/barrel-mixed-helper-selection.ts',
    include: unique([
      qraftReactAPIClientPattern,
      qraftAPIClientPattern,
      'useQuery',
      'getQueryKey',
      'BarrelAPIClientContext',
    ]),
    exclude: [],
  },
  contextScenario({
    name: 'file-context-query-hash-user-load',
    entry: 'src/file-context-query-hash-user-load.ts',
    include: [
      '@openapi-qraft/react/callbacks/useQuery',
      /method:\s*["']get["']/,
      'QueryHashAPIClientContext',
    ],
    exclude: [
      'qraftAPIClient(',
      'allCallbacks',
      /method:\s*["']post["']|mediaType/,
      'virtual:qraft-query-hash-api',
      'createQueryHashAPIClient',
      '@openapi-qraft/react/callbacks/useMutation',
      'getStores',
      'createPet',
    ],
  }),
  apiOnlyScenario({
    name: 'node-api-virtual-load-only',
    bundlers: ['esbuild'],
    entry: 'src/node-api-virtual-load-only.ts',
    include: ['getQueryKey', 'invalidateQueries', 'setQueryData', 'getPets'],
    exclude: [
      'createVirtualNodeAPIClient',
      'virtual:qraft-node-api',
      'createNodeAPIClient',
    ],
  }),
];

const precreatedClientEntrypoints = [
  {
    kind: 'precreatedClient',
    client: {
      exportName: 'BarrelClient',
      moduleSpecifier: '@/precreated/clients/barrel',
    },
    factory: {
      exportName: 'createBarrelPrecreatedAPIClient',
      moduleSpecifier: '@/precreated/clients/barrel', // re-export of './generated-api/create-barrel-precreated-api-client.ts'
    },
    optionsFactory: {
      exportName: 'createBarrelClientOptions',
      moduleSpecifier: '@/precreated/clients/barrel',
    },
  },
  {
    kind: 'precreatedClient',
    client: {
      exportName: 'RelativeClient',
      moduleSpecifier: './precreated/clients/file-relative.ts',
    },
    factory: {
      exportName: 'createRelativePrecreatedAPIClient',
      moduleSpecifier:
        './generated-api/create-relative-precreated-api-client.ts',
    },
    optionsFactory: {
      exportName: 'buildRelativeClientOptions',
      moduleSpecifier: './precreated/options/barrel',
    },
  },
  {
    kind: 'precreatedClient',
    client: {
      exportName: 'AliasDirectClient',
      moduleSpecifier: '@/precreated/clients/file-alias.ts',
    },
    factory: {
      exportName: 'createAliasDirectPrecreatedAPIClient',
      moduleSpecifier:
        './generated-api/create-alias-direct-precreated-api-client.ts',
    },
    optionsFactory: {
      exportName: 'createAliasDirectClientOptions',
      moduleSpecifier: '@/precreated/options',
    },
  },
  {
    kind: 'precreatedClient',
    client: {
      exportName: 'RelativeExtClient',
      moduleSpecifier: './precreated/clients/file-relative-ext.ts',
    },
    factory: {
      exportName: 'createRelativeExtPrecreatedAPIClient',
      moduleSpecifier:
        './generated-api/create-relative-ts-precreated-api-client.ts',
    },
    optionsFactory: {
      exportName: 'createRelativeExtClientOptions',
      moduleSpecifier: './precreated/options/direct.ts',
    },
  },
];

const clientFactoryEntrypoints = [
  {
    kind: 'clientFactory',
    factory: {
      exportName: 'createBarrelAPIClient',
      moduleSpecifier: './generated-api',
    },
    reactContext: {
      exportName: 'BarrelAPIClientContext',
      moduleSpecifier: './generated-api',
    },
  },
  {
    kind: 'clientFactory',
    factory: {
      exportName: 'createRelativeAPIClient',
      moduleSpecifier: '@/generated-api/create-relative-api-client',
    },
    reactContext: {
      exportName: 'RelativeAPIClientContext',
      moduleSpecifier: './generated-api/RelativeAPIClientContext',
    },
  },
  {
    kind: 'clientFactory',
    factory: {
      exportName: 'createRelativeExtAPIClient',
      moduleSpecifier: './generated-api/create-relative-ts-api-client.ts',
    },
    reactContext: {
      exportName: 'RelativeExtAPIClientContext',
      moduleSpecifier: '@/generated-api/RelativeExtAPIClientContext',
    },
  },
  {
    kind: 'clientFactory',
    factory: {
      exportName: 'createAliasAPIClient',
      moduleSpecifier: '@/generated-api',
    },
    reactContext: {
      exportName: 'AliasAPIClientContext',
      moduleSpecifier: '@/generated-api',
    },
  },
  {
    kind: 'clientFactory',
    factory: {
      exportName: 'createNodeAPIClient',
      moduleSpecifier: './generated-api/create-node-api-client',
    },
  },
  {
    kind: 'clientFactory',
    factory: {
      exportName: 'createAliasDirectAPIClient',
      moduleSpecifier: './generated-api/create-alias-direct-api-client',
    },
    reactContext: {
      exportName: 'AliasDirectAPIClientContext',
      moduleSpecifier: './generated-api/AliasDirectAPIClientContext',
    },
  },
];

export const entrypoints = [
  ...clientFactoryEntrypoints,
  ...precreatedClientEntrypoints,
];

export function getScenario(name) {
  const scenario = scenarios.find((candidate) => candidate.name === name);

  if (!scenario) {
    throw new Error(`Unknown tree-shaking scenario: ${name}`);
  }

  return scenario;
}

export function supportsScenarioBundler(bundler, scenario) {
  return !scenario.bundlers || scenario.bundlers.includes(bundler);
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
