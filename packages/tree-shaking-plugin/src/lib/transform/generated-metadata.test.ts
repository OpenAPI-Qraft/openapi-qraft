import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  contextApiIndexTsBody,
  createFixtureModuleAccess,
  createPrecreatedFixtureFiles,
  getContextFixtureFiles,
  PRECREATED_API_INDEX_TS,
  SERVICES_INDEX_TS,
  writeFixtureFiles,
} from '../../__tests__/core/fixtures.js';
import { normalizeEntrypoints } from './entrypoints.js';
import { inspectGeneratedEntrypoints } from './generated-metadata.js';
import { createTransformState } from './state.js';

describe('inspectGeneratedEntrypoints', () => {
  it('reads generated factory metadata with static services ownership', async () => {
    const root = await createTempFixture();
    await writeFixtureFiles(
      root,
      getContextFixtureFiles('APIClientContext', './APIClientContext', true)
    );
    const importerId = path.join(root, 'src/App.tsx');
    const entrypoints = normalizeEntrypoints({
      entrypoints: [
        {
          kind: 'clientFactory',
          factory: { exportName: 'createAPIClient', moduleSpecifier: './api' },
          reactContext: { exportName: 'APIClientContext' },
        },
      ],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId,
      entrypoints,
      moduleAccess: createFixtureModuleAccess(root),
    });

    const metadata = result.metadataByEntrypointKey.get(entrypoints[0].key);

    expect(result.reasons).toEqual([]);
    expect(metadata).toMatchObject({
      entrypoint: entrypoints[0],
      factoryFile: path.join(root, 'src/api/index.ts'),
      servicesDir: './services',
      serviceImportPaths: {
        pets: './PetsService',
        stores: './StoresService',
      },
      reactContext: {
        exportName: 'APIClientContext',
        moduleSpecifier: './APIClientContext',
      },
    });
  });

  it('returns unresolved reason when generated source is unavailable', async () => {
    const importerId = '/virtual/src/App.tsx';
    const resolvedFactoryId = '/virtual/src/api/index.ts?client#factory';
    const load = vi.fn(async () => null);
    const entrypoints = normalizeEntrypoints({
      entrypoints: [
        {
          kind: 'clientFactory',
          factory: { exportName: 'createAPIClient', moduleSpecifier: './api' },
        },
      ],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId,
      entrypoints,
      moduleAccess: {
        resolve: async () => resolvedFactoryId,
        load,
      },
    });

    expect(result.metadataByEntrypointKey.get(entrypoints[0].key)).toBeNull();
    expect(load).toHaveBeenCalledWith(resolvedFactoryId);
    expect(result.reasons).toEqual([
      {
        layer: 'generated-metadata',
        code: 'entrypoint-source-unavailable',
        message: 'Generated entrypoint source is unavailable.',
        entrypointKey: entrypoints[0].key,
      },
    ]);
  });

  it('loads generated factory metadata through exact query and hash ids', async () => {
    const importerId = '/virtual/src/App.tsx';
    const factoryId = '/virtual/src/api/index.ts?client#factory';
    const servicesId = '/virtual/src/api/services/index.ts?client#services';
    const load = vi.fn(async (id: string) => {
      if (id === factoryId) {
        return contextApiIndexTsBody('APIClientContext');
      }
      if (id === servicesId) {
        return SERVICES_INDEX_TS;
      }
      return null;
    });
    const entrypoints = normalizeEntrypoints({
      entrypoints: [
        {
          kind: 'clientFactory',
          factory: { exportName: 'createAPIClient', moduleSpecifier: './api' },
          reactContext: { exportName: 'APIClientContext' },
        },
      ],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId,
      entrypoints,
      moduleAccess: {
        resolve: async (specifier) => {
          if (specifier === './api') return factoryId;
          if (specifier === './services/index') return servicesId;
          return null;
        },
        load,
      },
    });

    const metadata = result.metadataByEntrypointKey.get(entrypoints[0].key);

    expect(result.reasons).toEqual([]);
    expect(load).toHaveBeenCalledWith(factoryId);
    expect(load).toHaveBeenCalledWith(servicesId);
    expect(metadata).toMatchObject({
      factoryFile: '/virtual/src/api/index.ts',
      factoryLoadId: factoryId,
      serviceImportPaths: {
        pets: './PetsService',
        stores: './StoresService',
      },
    });
  });

  it('loads re-export chains through exact ids while matching cycles canonically', async () => {
    const importerId = '/virtual/src/App.tsx';
    const indexId = '/virtual/src/api/index.ts?entry#client';
    const barrelId = '/virtual/src/api/barrel.ts?barrel#client';
    const factoryId = '/virtual/src/api/createAPIClient.ts?factory#client';
    const servicesId = '/virtual/src/api/services/index.ts?services#client';
    const load = vi.fn(async (id: string) => {
      if (id === indexId) return `export { createAPIClient } from './barrel';`;
      if (id === barrelId) {
        return `export { createAPIClient } from './createAPIClient';`;
      }
      if (id === factoryId) return contextApiIndexTsBody('APIClientContext');
      if (id === servicesId) return SERVICES_INDEX_TS;
      return null;
    });
    const entrypoints = normalizeEntrypoints({
      entrypoints: [
        {
          kind: 'clientFactory',
          factory: { exportName: 'createAPIClient', moduleSpecifier: './api' },
          reactContext: { exportName: 'APIClientContext' },
        },
      ],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId,
      entrypoints,
      moduleAccess: {
        resolve: async (specifier, importer) => {
          if (specifier === './api') return indexId;
          if (
            specifier === './barrel' &&
            importer === '/virtual/src/api/index.ts'
          ) {
            return barrelId;
          }
          if (
            specifier === './createAPIClient' &&
            importer === '/virtual/src/api/barrel.ts'
          ) {
            return factoryId;
          }
          if (
            specifier === './services/index' &&
            importer === '/virtual/src/api/createAPIClient.ts'
          ) {
            return servicesId;
          }
          return null;
        },
        load,
      },
    });

    const metadata = result.metadataByEntrypointKey.get(entrypoints[0].key);

    expect(result.reasons).toEqual([]);
    expect(load.mock.calls.map(([id]) => id)).toEqual([
      indexId,
      barrelId,
      factoryId,
      servicesId,
    ]);
    expect(metadata).toMatchObject({
      factoryFile: '/virtual/src/api/createAPIClient.ts',
      factoryLoadId: factoryId,
    });
  });

  it('returns unresolved reason for factories without static services imports', async () => {
    const root = await createTempFixture();
    await writeFixtureFiles(root, {
      'src/api/index.ts': `
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { APIClientContext } from './APIClientContext';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(services, callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, APIClientContext);
}
`,
      'src/api/APIClientContext.ts': `
export const APIClientContext = {};
`,
      'src/api/services/index.ts': SERVICES_INDEX_TS,
    });
    const importerId = path.join(root, 'src/App.tsx');
    const entrypoints = normalizeEntrypoints({
      entrypoints: [
        {
          kind: 'clientFactory',
          factory: { exportName: 'createAPIClient', moduleSpecifier: './api' },
          reactContext: { exportName: 'APIClientContext' },
        },
      ],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId,
      entrypoints,
      moduleAccess: createFixtureModuleAccess(root),
    });

    expect(result.metadataByEntrypointKey.get(entrypoints[0].key)).toBeNull();
    expect(result.reasons).toEqual([
      {
        layer: 'generated-metadata',
        code: 'generated-services-import-missing',
        message: 'Generated entrypoint does not import static services.',
        entrypointKey: entrypoints[0].key,
      },
    ]);
  });

  it('reads generated factory metadata through a re-export chain', async () => {
    const root = await createTempFixture();
    await writeFixtureFiles(root, {
      ...getContextFixtureFiles('APIClientContext', './APIClientContext', true),
      'src/api/index.ts': `
export { createAPIClient } from './barrel';
`,
      'src/api/barrel.ts': `
export { createAPIClient } from './createAPIClient';
`,
      'src/api/createAPIClient.ts': `
import { APIClientContext } from './APIClientContext';
${contextApiIndexTsBody('APIClientContext')}
`,
    });
    const importerId = path.join(root, 'src/App.tsx');
    const entrypoints = normalizeEntrypoints({
      entrypoints: [
        {
          kind: 'clientFactory',
          factory: { exportName: 'createAPIClient', moduleSpecifier: './api' },
          reactContext: { exportName: 'APIClientContext' },
        },
      ],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId,
      entrypoints,
      moduleAccess: createFixtureModuleAccess(root),
    });

    const metadata = result.metadataByEntrypointKey.get(entrypoints[0].key);

    expect(result.reasons).toEqual([]);
    expect(metadata).toMatchObject({
      factoryFile: path.join(root, 'src/api/createAPIClient.ts'),
      servicesDir: './services',
      reactContext: {
        exportName: 'APIClientContext',
        moduleSpecifier: './APIClientContext',
      },
    });
  });

  it('validates precreated clients against configured factory', async () => {
    const root = await createTempFixture();
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(`
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`)
    );
    const importerId = path.join(root, 'src/App.tsx');
    const entrypoints = normalizeEntrypoints({
      entrypoints: [
        {
          kind: 'precreatedClient',
          client: { exportName: 'APIClient', moduleSpecifier: './client' },
          factory: { exportName: 'createAPIClient', moduleSpecifier: './api' },
          optionsFactory: {
            exportName: 'createAPIClientOptions',
            moduleSpecifier: './client-options',
          },
        },
      ],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId,
      entrypoints,
      moduleAccess: createFixtureModuleAccess(root),
    });

    const metadata = result.metadataByEntrypointKey.get(entrypoints[0].key);

    expect(result.reasons).toEqual([]);
    expect(metadata).toMatchObject({
      entrypoint: entrypoints[0],
      factoryFile: path.join(root, 'src/api/index.ts'),
      servicesDir: './services',
      serviceImportPaths: {
        pets: './PetsService',
        stores: './StoresService',
      },
      reactContext: null,
      optionsFactory: {
        exportName: 'createAPIClientOptions',
        moduleSpecifier: './client-options',
      },
    });
  });

  it('validates precreated clients that import the configured factory barrel', async () => {
    const root = await createTempFixture();
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(
        `
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`,
        {
          'src/api/index.ts': `
export { createAPIClient } from './createAPIClient';
`,
          'src/api/createAPIClient.ts': PRECREATED_API_INDEX_TS,
        }
      )
    );
    const importerId = path.join(root, 'src/App.tsx');
    const entrypoints = normalizeEntrypoints({
      entrypoints: [
        {
          kind: 'precreatedClient',
          client: { exportName: 'APIClient', moduleSpecifier: './client' },
          factory: { exportName: 'createAPIClient', moduleSpecifier: './api' },
          optionsFactory: {
            exportName: 'createAPIClientOptions',
            moduleSpecifier: './client-options',
          },
        },
      ],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId,
      entrypoints,
      moduleAccess: createFixtureModuleAccess(root),
    });

    const metadata = result.metadataByEntrypointKey.get(entrypoints[0].key);

    expect(result.reasons).toEqual([]);
    expect(metadata).toMatchObject({
      factoryFile: path.join(root, 'src/api/createAPIClient.ts'),
      servicesDir: './services',
      reactContext: null,
    });
  });

  it('returns mismatch reason when a precreated client uses another factory', async () => {
    const root = await createTempFixture();
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(
        `
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`,
        {
          'src/other-api.ts': PRECREATED_API_INDEX_TS,
        }
      )
    );
    const importerId = path.join(root, 'src/App.tsx');
    const entrypoints = normalizeEntrypoints({
      entrypoints: [
        {
          kind: 'precreatedClient',
          client: { exportName: 'APIClient', moduleSpecifier: './client' },
          factory: {
            exportName: 'createAPIClient',
            moduleSpecifier: './other-api',
          },
          optionsFactory: {
            exportName: 'createAPIClientOptions',
            moduleSpecifier: './client-options',
          },
        },
      ],
    });

    const result = await inspectGeneratedEntrypoints({
      importerId,
      entrypoints,
      moduleAccess: createFixtureModuleAccess(root),
    });

    expect(result.metadataByEntrypointKey.get(entrypoints[0].key)).toBeNull();
    expect(result.reasons).toEqual([
      {
        layer: 'generated-metadata',
        code: 'precreated-client-factory-mismatch',
        message: 'Precreated client export does not match configured factory.',
        entrypointKey: entrypoints[0].key,
      },
    ]);
  });

  it('seeds legacy planner metadata without reloading inspected factories', async () => {
    const root = await createTempFixture();
    await writeFixtureFiles(
      root,
      getContextFixtureFiles('APIClientContext', './APIClientContext', true)
    );
    const importerId = path.join(root, 'src/App.tsx');
    const factoryFile = path.join(root, 'src/api/index.ts');
    const fixtureModuleAccess = createFixtureModuleAccess(root);
    let factoryLoadCount = 0;

    const state = await createTransformState(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.useQuery();
`,
      importerId,
      {
        entrypoints: [
          {
            kind: 'clientFactory',
            factory: {
              exportName: 'createAPIClient',
              moduleSpecifier: './api',
            },
            reactContext: {
              exportName: 'APIClientContext',
            },
          },
        ],
      },
      {
        resolve: fixtureModuleAccess.resolve,
        load: async (id) => {
          if (id === factoryFile) factoryLoadCount += 1;
          return fixtureModuleAccess.load(id);
        },
      }
    );

    expect(state.namedUsages).toHaveLength(1);
    expect(factoryLoadCount).toBe(1);
  });
});

function createTempFixture() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'qraft-generated-metadata-'));
}
