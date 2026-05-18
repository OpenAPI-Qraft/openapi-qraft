import { describe, expect, it } from 'vitest';
import { normalizeEntrypoints } from './entrypoints.js';

describe('normalizeEntrypoints', () => {
  it('normalizes clientFactory entrypoints with reactContext moduleSpecifier', () => {
    expect(
      normalizeEntrypoints({
        entrypoints: [
          {
            kind: 'clientFactory',
            factory: {
              exportName: 'createReactAPIClient',
              moduleSpecifier: './api',
            },
            reactContext: {
              exportName: 'APIClientContext',
              moduleSpecifier: './api/APIClientContext',
            },
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
        reactContext: {
          exportName: 'APIClientContext',
          moduleSpecifier: './api/APIClientContext',
        },
      },
    ]);
  });

  it('normalizes precreatedClient entrypoints', () => {
    expect(
      normalizeEntrypoints({
        entrypoints: [
          {
            kind: 'precreatedClient',
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
      },
    ]);
  });

  it('normalizes omitted reactContext moduleSpecifier to null', () => {
    const [entrypoint] = normalizeEntrypoints({
      entrypoints: [
        {
          kind: 'clientFactory',
          factory: {
            exportName: 'createReactAPIClient',
            moduleSpecifier: './api',
          },
          reactContext: {
            exportName: 'APIClientContext',
          },
        },
      ],
    });

    expect(entrypoint).toMatchObject({
      kind: 'generatedFactory',
      reactContext: {
        exportName: 'APIClientContext',
        moduleSpecifier: null,
      },
    });
  });
});
