import { describe, expect, it } from 'vitest';
import { normalizeEntrypoints } from './entrypoints.js';

describe('normalizeEntrypoints', () => {
  it('normalizes omitted clientFactory services and context modules to the factory module specifier', () => {
    expect(
      normalizeEntrypoints({
        entrypoints: [
          {
            kind: 'clientFactory',
            factory: {
              exportName: 'createReactAPIClient',
              moduleSpecifier: '@api/my-api',
            },
            reactContext: {
              exportName: 'APIClientContext',
            },
          },
        ],
      })
    ).toEqual([
      {
        kind: 'generatedFactory',
        key: 'generatedFactory:createReactAPIClient:@api/my-api:@api/my-api:@api/my-api',
        factory: {
          exportName: 'createReactAPIClient',
          moduleSpecifier: '@api/my-api',
        },
        services: {
          moduleSpecifierBase: '@api/my-api',
        },
        reactContext: {
          exportName: 'APIClientContext',
          moduleSpecifier: '@api/my-api',
        },
      },
    ]);
  });

  it('preserves explicit clientFactory services moduleSpecifierBase', () => {
    const [entrypoint] = normalizeEntrypoints({
      entrypoints: [
        {
          kind: 'clientFactory',
          factory: {
            exportName: 'createReactAPIClient',
            moduleSpecifier: '@api/my-api',
          },
          services: {
            moduleSpecifierBase: '@api/my-public-root',
          },
        },
      ],
    });

    expect(entrypoint).toMatchObject({
      kind: 'generatedFactory',
      key: 'generatedFactory:createReactAPIClient:@api/my-api:@api/my-public-root:',
      services: {
        moduleSpecifierBase: '@api/my-public-root',
      },
    });
  });

  it('normalizes omitted precreatedClient services to the factory module specifier', () => {
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
              moduleSpecifier: '@api/my-api',
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
        key: 'precreatedClient:nodeAPIClient:./client:createNodeAPIClient:@api/my-api:createNodeAPIClientOptions:./client-options:@api/my-api',
        client: {
          exportName: 'nodeAPIClient',
          moduleSpecifier: './client',
        },
        factory: {
          exportName: 'createNodeAPIClient',
          moduleSpecifier: '@api/my-api',
        },
        optionsFactory: {
          exportName: 'createNodeAPIClientOptions',
          moduleSpecifier: './client-options',
        },
        services: {
          moduleSpecifierBase: '@api/my-api',
        },
      },
    ]);
  });
});
