import type {
  QraftModuleAccess,
  QraftModuleAccessOptions,
} from '../../lib/resolvers/common.js';
import fs from 'node:fs/promises';
import path from 'node:path';

export const PRECREATED_API_INDEX_TS = `
import { qraftAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { services } from './services/index';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(options?: { queryClient: unknown }) {
  return qraftAPIClient(services, defaultCallbacks, options);
}
`;

export const SERVICES_INDEX_TS = `
import { petsService } from './PetsService';
import { storesService } from './StoresService';

export const services = {
  pets: petsService,
  stores: storesService,
} as const;
`;

export const PETS_SERVICE_TS = `
export const getPets = { schema: { method: 'get', url: '/pets' } };
export const createPet = { schema: { method: 'post', url: '/pets' } };
export const updatePet = { schema: { method: 'put', url: '/pets/{petId}' } };
export const getPetById = { schema: { method: 'get', url: '/pets/{petId}' } };
export const findPetsByStatus = { schema: { method: 'get', url: '/pets/findByStatus' } };

export const petsService = {
  getPets,
  createPet,
  updatePet,
  getPetById,
  findPetsByStatus,
} as const;
`;

export const STORES_SERVICE_TS = `
export const getStores = { schema: { method: 'get', url: '/stores' } };

export const storesService = {
  getStores,
} as const;
`;

export const DEFAULT_PRECREATED_CLIENT_OPTIONS_TS = `
export const createAPIClientOptions = () => ({
  queryClient: {}
});
`;

export function getContextFixtureFiles(
  contextName: string,
  contextModule: string,
  importContext: boolean,
  apiDirName = 'api'
) {
  const apiRoot = `src/${apiDirName}`;

  return {
    [`${apiRoot}/index.ts`]: `${importContext ? `import { ${contextName} } from '${contextModule}';\n` : ''}${contextApiIndexTsBody(contextName)}`,
    [`${apiRoot}/${contextName}.ts`]: `\nexport const ${contextName} = {};\n`,
    [`${apiRoot}/services/index.ts`]: SERVICES_INDEX_TS,
    [`${apiRoot}/services/PetsService.ts`]: PETS_SERVICE_TS,
    [`${apiRoot}/services/StoresService.ts`]: STORES_SERVICE_TS,
  } as const;
}

export function contextApiIndexTsBody(contextName: string) {
  return `
import { qraftReactAPIClient } from '@openapi-qraft/react';
import { useQuery } from '@openapi-qraft/react/callbacks/index';
import { services } from './services/index';

const defaultCallbacks = { useQuery } as const;

export function createAPIClient(callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, ${contextName});
}
export function createExtraAPIClient(callbacks = defaultCallbacks) {
  return qraftReactAPIClient(services, callbacks, ${contextName});
}
`;
}

export const PRECREATED_BASE_FILES = {
  'src/api/index.ts': PRECREATED_API_INDEX_TS,
  'src/api/services/index.ts': SERVICES_INDEX_TS,
  'src/api/services/PetsService.ts': PETS_SERVICE_TS,
  'src/api/services/StoresService.ts': STORES_SERVICE_TS,
  'src/client-options.ts': DEFAULT_PRECREATED_CLIENT_OPTIONS_TS,
} as const;

export function createPrecreatedFixtureFiles(
  clientTs: string,
  extraFiles: Record<string, string> = {}
) {
  return {
    ...PRECREATED_BASE_FILES,
    'src/client.ts': clientTs,
    ...extraFiles,
  } as const;
}

export async function writeFixtureFiles(
  root: string,
  files: Record<string, string>
) {
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(root, relativePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  }
}

function createFixtureResolver(fixtureRoot: string) {
  return async (specifier: string, importer: string) => {
    if (specifier.startsWith('@/')) {
      return resolveFixtureModule(
        path.join(fixtureRoot, 'src'),
        specifier.slice(2)
      );
    }

    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      return resolveFixtureModule(path.dirname(importer), specifier);
    }

    return null;
  };
}

export function createFixtureModuleAccess(
  fixtureRoot: string,
  userAccess: QraftModuleAccessOptions = {}
): QraftModuleAccess {
  const fixtureResolver = createFixtureResolver(fixtureRoot);

  return {
    resolve: async (specifier, importer) => {
      if (userAccess.resolve) {
        try {
          const resolved = await userAccess.resolve(specifier, importer);
          if (resolved) return resolved;
        } catch {
          // Fall through to the fixture resolver.
        }
      }

      return fixtureResolver(specifier, importer);
    },
    load: async (id) => {
      if (userAccess.load) {
        try {
          const loaded = await userAccess.load(id);
          if (loaded !== null && loaded !== undefined) return loaded;
        } catch {
          // Fall through to the fixture filesystem loader.
        }
      }

      try {
        return await fs.readFile(id, 'utf8');
      } catch {
        return null;
      }
    },
  };
}

export async function resolveFixtureModule(
  baseDir: string,
  importPath: string
) {
  const base = path.resolve(baseDir, importPath);
  const candidateBases = new Set([base]);
  const extension = path.extname(importPath);
  if (
    extension === '.js' ||
    extension === '.jsx' ||
    extension === '.mjs' ||
    extension === '.cjs'
  ) {
    candidateBases.add(base.slice(0, -extension.length));
  }

  const candidates = [...candidateBases].flatMap((candidateBase) => [
    candidateBase,
    `${candidateBase}.ts`,
    `${candidateBase}.tsx`,
    `${candidateBase}.js`,
    `${candidateBase}.jsx`,
    `${candidateBase}.mts`,
    `${candidateBase}.cts`,
    path.join(candidateBase, 'index.ts'),
    path.join(candidateBase, 'index.tsx'),
    path.join(candidateBase, 'index.js'),
    path.join(candidateBase, 'index.jsx'),
    path.join(candidateBase, 'index.mts'),
    path.join(candidateBase, 'index.cts'),
  ]);

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}
