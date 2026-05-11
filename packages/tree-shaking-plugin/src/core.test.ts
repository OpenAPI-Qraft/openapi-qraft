import type { SourceMapInput } from '@jridgewell/trace-mapping';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { describe, expect, it, vi } from 'vitest';
import {
  createFixtureModuleAccess,
  createPrecreatedFixtureFiles,
  writeFixtureFiles,
} from './__tests__/core/fixtures.js';
import {
  createFixture,
  createTransformPlan,
  transformQraftTreeShaking,
} from './__tests__/core/harness.js';
import { transformQraftTreeShaking as transformQraftTreeShakingImpl } from './core.js';

describe('transformQraftTreeShaking', () => {
  it('uses module access from options by default when creating a transform plan', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);
    const load = vi.fn(fixtureModuleAccess.load);

    const plan = await createTransformPlan(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`,
      sourceFile,
      {
        createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
        moduleAccess: {
          resolve: fixtureModuleAccess.resolve,
          load,
        },
      }
    );

    expect(plan.clients).toHaveLength(1);
    expect(plan.namedUsages).toHaveLength(1);
    expect(load).toHaveBeenCalledWith(path.join(fixture, 'src/api/index.ts'));
  });

  it('keeps a rewritten user call site traceable through an incoming source map', async () => {
    const fixture = await createFixture();
    const generatedSourceFile = path.join(fixture, 'src/App.generated.tsx');
    const originalSourceFile = path.join(fixture, 'src/App.tsx');
    const code = [
      "import { createAPIClient } from './api';",
      '',
      'const api = createAPIClient();',
      '',
      'export function App() {',
      '  return api.pets.getPets.useQuery();',
      '}',
    ].join('\n');
    const inputSourceMap = createIdentitySourceMap(
      generatedSourceFile,
      originalSourceFile,
      code
    );

    const result = await transformQraftTreeShaking(
      code,
      generatedSourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] },
      inputSourceMap
    );

    if (!result) {
      throw new Error('Expected transform result');
    }

    const generatedLineIndex = result.code
      .split('\n')
      .findIndex((line) => line.includes('api_pets_getPets.useQuery()'));

    if (generatedLineIndex === -1) {
      throw new Error('Expected rewritten user call site in generated output');
    }

    const generatedLine = generatedLineIndex + 1;
    const generatedColumn = result.code
      .split('\n')
      [generatedLineIndex].indexOf('api_pets_getPets');

    const traceMapInput = result.map! as SourceMapInput;

    const position = originalPositionFor(new TraceMap(traceMapInput), {
      line: generatedLine,
      column: generatedColumn,
    });

    expect(position).toMatchObject({
      source: originalSourceFile,
      line: 6,
    });
  });

  it('rewrites schema accesses from context-based and zero-arg createAPIClient calls', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  api.pets.findPetsByStatus.schema;
  createAPIClient().pets.findPetsByStatus.schema;
}
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { findPetsByStatus } from "./api/services/PetsService";
      export function App() {
        findPetsByStatus.schema;
        findPetsByStatus.schema;
      }"
      `);
  });

  it('rewrites schema accesses from precreated API clients directly to operations', async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), 'qraft-tree-shaking-')
    );
    await writeFixtureFiles(
      root,
      createPrecreatedFixtureFiles(`
import { createAPIClient } from './api';
import { createAPIClientOptions } from './client-options';

export const APIClient = createAPIClient(createAPIClientOptions());
`)
    );
    const sourceFile = path.join(root, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { APIClient } from './client';

export function App() {
  return APIClient.pets.findPetsByStatus.schema;
}
`,
      sourceFile,
      {
        apiClient: [
          {
            client: 'APIClient',
            clientModule: './client',
            createAPIClientFn: 'createAPIClient',
            createAPIClientFnModule: './api',
            createAPIClientFnOptions: 'createAPIClientOptions',
            createAPIClientFnOptionsModule: './client-options',
          },
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { findPetsByStatus } from "./api/services/PetsService";
      export function App() {
        return findPetsByStatus.schema;
      }"
      `);
  });

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
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
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
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result).toBeNull();
  });

  it('resolves a factory module through the fixture resolver when the bundler cannot', async () => {
    const fixture = await createFixture({ apiDirName: 'generated-api' });
    const sourceFile = path.join(fixture, 'src/App.tsx');

    await fs.writeFile(
      sourceFile,
      `
import { createAPIClient } from './generated-api';

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`
    );

    const result = await transformQraftTreeShaking(
      await fs.readFile(sourceFile, 'utf8'),
      sourceFile,
      {
        createAPIClientFn: [
          { name: 'createAPIClient', module: './generated-api' },
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { qraftReactAPIClient } from "@openapi-qraft/react";
      import { useQuery } from "@openapi-qraft/react/callbacks/useQuery";
      import { getPets } from "./generated-api/services/PetsService";
      import { APIClientContext } from "./generated-api/APIClientContext";
      const api_pets_getPets = qraftReactAPIClient(getPets, {
        useQuery
      }, APIClientContext);
      export function App() {
        return api_pets_getPets.useQuery();
      }"
    `);
  });

  it('does not read generated modules from the filesystem when moduleAccess.load returns null', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureResolver = createFixtureModuleAccess(fixture).resolve;
    const readFileSpy = vi.spyOn(fs, 'readFile');
    const load = vi.fn(async () => null);

    try {
      const result = await transformQraftTreeShakingImpl(
        `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`,
        sourceFile,
        {
          createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
        },
        {
          resolve: fixtureResolver,
          load,
        }
      );

      expect(result).toBeNull();
      expect(load).toHaveBeenCalledWith(path.join(fixture, 'src/api/index.ts'));
      expect(readFileSpy).not.toHaveBeenCalled();
    } finally {
      readFileSpy.mockRestore();
    }
  });

  it('supports a legacy resolver 4th argument together with module access load options', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);
    const load = vi.fn(fixtureModuleAccess.load);

    const result = await transformQraftTreeShakingImpl(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`,
      sourceFile,
      {
        createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
        moduleAccess: {
          load,
        },
      },
      fixtureModuleAccess.resolve
    );

    expect(result?.code).toContain('api_pets_getPets.useQuery()');
    expect(load).toHaveBeenCalledWith(path.join(fixture, 'src/api/index.ts'));
  });

  it('prefers module access resolve from options over a conflicting legacy resolver 4th argument', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');
    const fixtureModuleAccess = createFixtureModuleAccess(fixture);
    const load = vi.fn(fixtureModuleAccess.load);
    const legacyResolver = vi.fn(async () => {
      throw new Error('legacy resolver should not be called');
    });

    const result = await transformQraftTreeShakingImpl(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

export function App() {
  return api.pets.getPets.useQuery();
}
`,
      sourceFile,
      {
        createAPIClientFn: [{ name: 'createAPIClient', module: './api' }],
        moduleAccess: {
          resolve: fixtureModuleAccess.resolve,
          load,
        },
      },
      legacyResolver
    );

    expect(result?.code).toContain('api_pets_getPets.useQuery()');
    expect(legacyResolver).not.toHaveBeenCalled();
    expect(load).toHaveBeenCalledWith(path.join(fixture, 'src/api/index.ts'));
  });

  it('does not match a same-named import that resolves to a different module', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    // Write an unrelated module that exports a same-named symbol but is NOT
    // configured as a factory.
    const otherFile = path.join(fixture, 'src/other.ts');
    await fs.writeFile(
      otherFile,
      `export function createAPIClient() { return { ping: () => 'pong' }; }\n`
    );

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './other';

const lookalike = createAPIClient();

lookalike.pets.getPets.useQuery();
`,
      sourceFile,
      { createAPIClientFn: [{ name: 'createAPIClient', module: './api' }] }
    );

    expect(result).toBeNull();
  });

  it('returns null when the specifier cannot be resolved', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from 'unresolvable-module';

const api = createAPIClient();

api.pets.getPets.useQuery();
`,
      sourceFile,
      {
        createAPIClientFn: [
          { name: 'createAPIClient', module: 'unresolvable-module' },
        ],
        resolve: () => null,
      }
    );

    expect(result).toBeNull();
  });

  it('skips when createAPIClientFn is empty', async () => {
    const fixture = await createFixture();
    const sourceFile = path.join(fixture, 'src/App.tsx');

    const result = await transformQraftTreeShaking(
      `
import { createAPIClient } from './api';

const api = createAPIClient();

api.pets.getPets.useQuery();
`,
      sourceFile,
      { createAPIClientFn: [] }
    );

    expect(result).toBeNull();
  });
});

function createIdentitySourceMap(
  generatedSourceFile: string,
  originalSourceFile: string,
  source: string
): SourceMapInput {
  const lineCount = source.split('\n').length;
  const mappings = Array.from({ length: lineCount }, (_, index) =>
    index === 0 ? 'AAAA' : 'AACA'
  ).join(';');

  return {
    version: 3,
    file: generatedSourceFile,
    names: [],
    sources: [originalSourceFile],
    sourcesContent: [source],
    mappings,
  };
}
