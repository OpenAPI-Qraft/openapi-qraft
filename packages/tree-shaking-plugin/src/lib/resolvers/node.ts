import type {
  LoadStrategy,
  QraftModuleAccess,
  QraftModuleAccessOptions,
  ResolveStrategy,
} from './common.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ResolverFactory } from 'oxc-resolver';
import {
  createQraftModuleAccess,
  createUserResolverStrategy,
  createUserSourceLoaderStrategy,
  stripQueryAndHash,
} from './common.js';

type ResolverFactoryOptions = NonNullable<
  ConstructorParameters<typeof ResolverFactory>[0]
>;

export type NodeResolverOptions = Omit<
  Partial<ResolverFactoryOptions>,
  'tsconfig'
>;

export type NodeModuleAccessOptions = {
  root?: string;
  tsconfig?: 'auto' | string;
  resolverOptions?: NodeResolverOptions;
  moduleAccess?: QraftModuleAccessOptions;
};

function normalizeTsconfig(
  root: string,
  tsconfig: NodeModuleAccessOptions['tsconfig']
): ResolverFactoryOptions['tsconfig'] {
  if (tsconfig === undefined || tsconfig === 'auto') return 'auto';

  return {
    configFile: path.resolve(root, tsconfig),
    references: 'auto',
  };
}

function createNodeResolveStrategy({
  root = process.cwd(),
  tsconfig,
  resolverOptions,
}: NodeModuleAccessOptions): ResolveStrategy {
  const resolvedRoot = path.resolve(root);
  const resolver = new ResolverFactory({
    conditionNames: ['node', 'import'],
    extensions: ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'],
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    },
    ...resolverOptions,
    tsconfig: normalizeTsconfig(resolvedRoot, tsconfig),
  });

  return {
    name: 'native',
    async resolve({ specifier, importer }) {
      try {
        const result = await resolver.resolveFileAsync(importer, specifier);
        if (result.error || result.builtin || !result.path) return null;

        return result.path;
      } catch {
        return null;
      }
    },
  };
}

function createNodeFileLoadStrategy(): LoadStrategy {
  return {
    name: 'adapter-fallback',
    async load({ id }) {
      try {
        return await fs.readFile(stripQueryAndHash(id), 'utf8');
      } catch {
        return null;
      }
    },
  };
}

export function createNodeModuleAccess(
  options: NodeModuleAccessOptions = {}
): QraftModuleAccess {
  return createQraftModuleAccess(
    [
      createUserResolverStrategy(options.moduleAccess?.resolve),
      createNodeResolveStrategy(options),
    ],
    [
      createUserSourceLoaderStrategy(options.moduleAccess?.load),
      createNodeFileLoadStrategy(),
    ]
  );
}
