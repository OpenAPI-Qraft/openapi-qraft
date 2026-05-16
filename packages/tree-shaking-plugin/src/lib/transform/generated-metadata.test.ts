import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createFixtureModuleAccess,
  createPrecreatedFixtureFiles,
  getContextFixtureFiles,
  SERVICES_INDEX_TS,
  writeFixtureFiles,
} from '../../__tests__/core/fixtures.js';
import { normalizeEntrypoints } from './entrypoints.js';
import { inspectGeneratedEntrypoints } from './generated-metadata.js';

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
        resolve: async () => '/virtual/src/api/index.ts',
        load: async () => null,
      },
    });

    expect(result.metadataByEntrypointKey.get(entrypoints[0].key)).toBeNull();
    expect(result.reasons).toEqual([
      {
        layer: 'generated-metadata',
        code: 'entrypoint-source-unavailable',
        message: 'Generated entrypoint source is unavailable.',
        entrypointKey: entrypoints[0].key,
      },
    ]);
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
});

function createTempFixture() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'qraft-generated-metadata-'));
}
