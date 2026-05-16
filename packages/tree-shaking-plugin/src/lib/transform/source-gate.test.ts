import { describe, expect, it } from 'vitest';
import { normalizeEntrypoints } from './entrypoints.js';
import { shouldInspectSource } from './source-gate.js';

describe('shouldInspectSource', () => {
  const entrypoints = normalizeEntrypoints({
    entrypoints: [
      {
        kind: 'clientFactory',
        factory: { exportName: 'createAPIClient', moduleSpecifier: './api' },
      },
      {
        kind: 'precreatedClient',
        client: { exportName: 'nodeAPIClient', moduleSpecifier: './client' },
        factory: { exportName: 'createNodeAPIClient', moduleSpecifier: './api' },
        optionsFactory: {
          exportName: 'createNodeAPIClientOptions',
          moduleSpecifier: './client-options',
        },
      },
    ],
  });

  it('skips when no entrypoints are configured', () => {
    expect(
      shouldInspectSource({
        code: `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.useQuery();
`,
        id: '/virtual/src/App.tsx',
        entrypoints: [],
      })
    ).toBe(false);
  });

  it('skips non-source ids and node_modules ids', () => {
    expect(
      shouldInspectSource({
        code: `createAPIClient().pets.getPets.useQuery()`,
        id: '/virtual/src/styles.css',
        entrypoints,
      })
    ).toBe(false);

    expect(
      shouldInspectSource({
        code: `createAPIClient().pets.getPets.useQuery()`,
        id: '/virtual/node_modules/pkg/index.ts',
        entrypoints,
      })
    ).toBe(false);
  });

  it('requires a configured entrypoint signal', () => {
    expect(
      shouldInspectSource({
        code: `
const pets = {
  getPets: {
    useQuery() {},
  },
};

pets.getPets.useQuery();
`,
        id: '/virtual/src/App.tsx',
        entrypoints,
      })
    ).toBe(false);

    expect(
      shouldInspectSource({
        code: `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.useQuery();
`,
        id: '/virtual/src/App.tsx',
        entrypoints,
      })
    ).toBe(true);
  });

  it('inspects direct operation invocation when an entrypoint signal is present', () => {
    expect(
      shouldInspectSource({
        code: `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets();
`,
        id: '/virtual/src/App.tsx',
        entrypoints,
      })
    ).toBe(true);
  });

  it('honors include and exclude filters', () => {
    expect(
      shouldInspectSource({
        code: `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.useQuery();
`,
        id: '/virtual/src/App.tsx',
        entrypoints,
        include: '/server/',
      })
    ).toBe(false);

    expect(
      shouldInspectSource({
        code: `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.useQuery();
`,
        id: '/virtual/src/App.tsx',
        entrypoints,
        exclude: ['/virtual/src/', /\.tsx$/],
      })
    ).toBe(false);

    expect(
      shouldInspectSource({
        code: `
import { nodeAPIClient } from './client';

nodeAPIClient.pets.getPets.fetchQuery();
`,
        id: '/virtual/src/App.ts',
        entrypoints,
        include: [/src\/App/, /\.ts$/],
        exclude: '/dist/',
      })
    ).toBe(true);
  });
});
