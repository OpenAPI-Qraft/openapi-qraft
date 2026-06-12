import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { entrypoints } from './shared.mjs';

const queryHashFactorySpecifier = 'virtual:qraft-query-hash-api';
const queryHashContextSpecifier = 'virtual:qraft-query-hash-context';
const queryHashFactorySourceFile = resolve(
  process.cwd(),
  'src/generated-api/create-relative-api-client.ts'
);
const queryHashContextSourceFile = resolve(
  process.cwd(),
  'src/generated-api/RelativeAPIClientContext.ts'
);
const queryHashFactoryId = `${queryHashFactorySourceFile}?tree-shaking#factory`;
const queryHashContextId = `${queryHashContextSourceFile}?tree-shaking#context`;

const virtualNodeFactorySpecifier = 'virtual:qraft-node-api';
const virtualNodeFactorySourceFile = resolve(
  process.cwd(),
  'src/generated-api/create-node-api-client.ts'
);
const virtualNodeFactoryId = `${virtualNodeFactorySourceFile}?tree-shaking#factory`;

const queryHashEntrypoint = {
  kind: 'clientFactory',
  factory: {
    exportName: 'createQueryHashAPIClient',
    moduleSpecifier: queryHashFactorySpecifier,
  },
  services: {
    moduleSpecifierBase: './generated-api',
  },
  reactContext: {
    exportName: 'QueryHashAPIClientContext',
    moduleSpecifier: queryHashContextSpecifier,
  },
};

const virtualNodeEntrypoint = {
  kind: 'clientFactory',
  factory: {
    exportName: 'createVirtualNodeAPIClient',
    moduleSpecifier: virtualNodeFactorySpecifier,
  },
  services: {
    moduleSpecifierBase: './generated-api',
  },
};

export function getTreeShakePluginOptions(scenario) {
  const customEntrypoints = [...entrypoints];

  if (scenario.name === 'file-context-query-hash-user-load') {
    customEntrypoints.push(queryHashEntrypoint);
  }

  if (scenario.name === 'node-api-virtual-load-only') {
    customEntrypoints.push(virtualNodeEntrypoint);
  }

  return {
    entrypoints: customEntrypoints,
    moduleAccess: {
      resolve: (specifier) => resolveVirtualModule(specifier, scenario),
      load: (resolvedId) => loadVirtualModule(resolvedId, scenario),
    },
  };
}

function resolveVirtualModule(specifier, scenario) {
  if (scenario.name === 'file-context-query-hash-user-load') {
    if (specifier === queryHashFactorySpecifier) return queryHashFactoryId;
    if (specifier === queryHashContextSpecifier) {
      return queryHashContextId;
    }
  }

  return null;
}

async function loadVirtualModule(resolvedId, scenario) {
  if (
    scenario.name === 'file-context-query-hash-user-load' &&
    (resolvedId === queryHashFactoryId ||
      resolvedId === queryHashFactorySpecifier)
  ) {
    const source = await readFile(queryHashFactorySourceFile, 'utf8');
    return source
      .replaceAll('createRelativeAPIClient', 'createQueryHashAPIClient')
      .replaceAll('RelativeAPIClientContext', 'QueryHashAPIClientContext')
      .replaceAll(
        './QueryHashAPIClientContext.js',
        resolvedId === queryHashFactorySpecifier
          ? queryHashContextSourceFile
          : './QueryHashAPIClientContext.js'
      );
  }

  if (
    scenario.name === 'file-context-query-hash-user-load' &&
    (resolvedId === queryHashContextId ||
      resolvedId === queryHashContextSpecifier)
  ) {
    const source = await readFile(queryHashContextSourceFile, 'utf8');
    return source.replaceAll(
      'RelativeAPIClientContext',
      'QueryHashAPIClientContext'
    );
  }

  if (
    scenario.name === 'node-api-virtual-load-only' &&
    (resolvedId === virtualNodeFactoryId ||
      resolvedId === virtualNodeFactorySpecifier)
  ) {
    const source = await readFile(virtualNodeFactorySourceFile, 'utf8');
    return source.replaceAll(
      'createNodeAPIClient',
      'createVirtualNodeAPIClient'
    );
  }

  return null;
}
