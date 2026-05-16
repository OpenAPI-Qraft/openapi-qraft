import { describe, expect, it } from 'vitest';
import { normalizeEntrypoints } from './entrypoints.js';

describe('normalizeEntrypoints', () => {
  it('normalizes createAPIClientFn configs with contextModule', () => {
    expect(
      normalizeEntrypoints({
        createAPIClientFn: [
          {
            name: 'createReactAPIClient',
            module: './api',
            context: 'APIClientContext',
            contextModule: './api/APIClientContext',
          },
        ],
      })
    ).toEqual([
      {
        kind: 'generatedFactory',
        key: 'generatedFactory:createReactAPIClient:./api',
        factory: {
          exportName: 'createReactAPIClient',
          moduleSpecifier: './api',
        },
        runtimeContext: {
          exportName: 'APIClientContext',
          moduleSpecifier: './api/APIClientContext',
        },
        legacyConfig: {
          name: 'createReactAPIClient',
          module: './api',
          context: 'APIClientContext',
          contextModule: './api/APIClientContext',
        },
      },
    ]);
  });

  it('normalizes precreated apiClient configs with explicit options module', () => {
    expect(
      normalizeEntrypoints({
        apiClient: [
          {
            client: 'nodeAPIClient',
            clientModule: './client',
            createAPIClientFn: 'createNodeAPIClient',
            createAPIClientFnModule: './api',
            createAPIClientFnOptions: 'createNodeAPIClientOptions',
            createAPIClientFnOptionsModule: './client-options',
          },
        ],
      })
    ).toEqual([
      {
        kind: 'precreatedClient',
        key: 'precreatedClient:nodeAPIClient:./client:createNodeAPIClient:./api:createNodeAPIClientOptions:./client-options',
        client: {
          exportName: 'nodeAPIClient',
          moduleSpecifier: './client',
        },
        factory: {
          exportName: 'createNodeAPIClient',
          moduleSpecifier: './api',
        },
        optionsFactory: {
          exportName: 'createNodeAPIClientOptions',
          moduleSpecifier: './client-options',
        },
        legacyConfig: {
          client: 'nodeAPIClient',
          clientModule: './client',
          createAPIClientFn: 'createNodeAPIClient',
          createAPIClientFnModule: './api',
          createAPIClientFnOptions: 'createNodeAPIClientOptions',
          createAPIClientFnOptionsModule: './client-options',
        },
      },
    ]);
  });

  it('normalizes precreated options module fallback to clientModule', () => {
    const [entrypoint] = normalizeEntrypoints({
      apiClient: [
        {
          client: 'nodeAPIClient',
          clientModule: './client',
          createAPIClientFn: 'createNodeAPIClient',
          createAPIClientFnModule: './api',
          createAPIClientFnOptions: 'createNodeAPIClientOptions',
        },
      ],
    });

    expect(entrypoint).toMatchObject({
      kind: 'precreatedClient',
      optionsFactory: {
        exportName: 'createNodeAPIClientOptions',
        moduleSpecifier: './client',
      },
    });
  });
});
