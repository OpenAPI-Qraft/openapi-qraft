import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createFixtureModuleAccess } from './fixtures.js';
import { createFixture, transformQraftTreeShaking } from './harness.js';

describe('transformQraftTreeShaking unsupported and safety', () => {
  it('keeps the original client when an unsupported reference remains', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

// Unsupported raw client reference keeps the original client binding alive.
console.log(api);
api.pets.getPets.useQuery();
`,
      sourceFile,
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
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { createAPIClient } from './api';
      import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./api/services/PetsService";
      import { APIClientContext } from "./api/APIClientContext";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      const api = createAPIClient();

      // Unsupported raw client reference keeps the original client binding alive.
      console.log(api);
      api_pets_getPets.useQuery();"
    `);
  });

  it('skips exported clients', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

export const api = createAPIClient();

api.pets.getPets.useQuery();
`,
      sourceFile,
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
      }
    );

    expect(result).toBeNull();
  });

  it('does not report unavailable generated source for exported clients', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

export const api = createAPIClient();

api.pets.getPets.useQuery();
`,
      sourceFile,
      {
        entrypoints: [
          {
            kind: 'clientFactory',
            factory: {
              exportName: 'createAPIClient',
              moduleSpecifier: './api',
            },
          },
        ],
        moduleAccess: {
          resolve: fixtureModuleAccess.resolve,
          load: async () => null,
        },
      }
    );

    expect(result).toBeNull();
  });

  it('does not rewrite computed member access', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();
const serviceName = 'pets';

api[serviceName].getPets.useQuery();
api.pets['getPets'].useQuery();
`,
      sourceFile,
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
      }
    );

    expect(result).toBeNull();
  });

  it('does not rewrite destructured client aliases', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();
const { pets } = api;

pets.getPets.useQuery();
`,
      sourceFile,
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
      }
    );

    expect(result).toBeNull();
  });

  it('does not rewrite optional member chains until short-circuit semantics can be preserved', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api?.pets?.getPets?.useQuery();
`,
      sourceFile,
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
      }
    );

    expect(result).toBeNull();
  });

  it('does not report unavailable generated source for optional member chains', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api?.pets?.getPets?.useQuery();
`,
      sourceFile,
      {
        entrypoints: [
          {
            kind: 'clientFactory',
            factory: {
              exportName: 'createAPIClient',
              moduleSpecifier: './api',
            },
          },
        ],
        moduleAccess: {
          resolve: fixtureModuleAccess.resolve,
          load: async () => null,
        },
      }
    );

    expect(result).toBeNull();
  });

  it('does not report unavailable generated source for unsupported callbacks', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.unsupportedCallback();
`,
      sourceFile,
      {
        entrypoints: [
          {
            kind: 'clientFactory',
            factory: {
              exportName: 'createAPIClient',
              moduleSpecifier: './api',
            },
          },
        ],
        moduleAccess: {
          resolve: fixtureModuleAccess.resolve,
          load: async () => null,
        },
      }
    );

    expect(result).toBeNull();
  });

  it('does not report unavailable generated source for operation property reads', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets;
`,
      sourceFile,
      {
        entrypoints: [
          {
            kind: 'clientFactory',
            factory: {
              exportName: 'createAPIClient',
              moduleSpecifier: './api',
            },
          },
        ],
        moduleAccess: {
          resolve: fixtureModuleAccess.resolve,
          load: async () => null,
        },
      }
    );

    expect(result).toBeNull();
  });

  it('does not report unavailable generated source for inline operation property reads', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

createAPIClient().pets.getPets;
`,
      sourceFile,
      {
        entrypoints: [
          {
            kind: 'clientFactory',
            factory: {
              exportName: 'createAPIClient',
              moduleSpecifier: './api',
            },
          },
        ],
        moduleAccess: {
          resolve: fixtureModuleAccess.resolve,
          load: async () => null,
        },
      }
    );

    expect(result).toBeNull();
  });
});
