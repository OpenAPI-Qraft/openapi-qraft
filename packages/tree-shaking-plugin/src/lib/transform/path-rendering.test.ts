import { describe, expect, it } from 'vitest';
import {
  composeImportPath,
  composeResolvedSourceImportPath,
  normalizeResolvedId,
  resolvePrecreatedOptionsImportPath,
  resolveRelativeImportPath,
  stripIndexSourceExtension,
  stripQueryAndHash,
  stripSourceExtension,
} from './path-rendering.js';

describe('path rendering helpers', () => {
  it('drops source extensions and trailing index segments from relative imports', () => {
    expect(
      composeResolvedSourceImportPath(
        '/repo/src/App.tsx',
        '/repo/src/api/services/PetsService.ts'
      )
    ).toBe('./api/services/PetsService');

    expect(
      composeResolvedSourceImportPath(
        '/repo/src/App.tsx',
        '/repo/src/api/services/index.ts'
      )
    ).toBe('./api/services');
  });

  it('keeps bare specifiers unchanged when resolving precreated options imports', () => {
    expect(
      resolvePrecreatedOptionsImportPath(
        '/repo/src/App.tsx',
        'react-query',
        '/repo/node_modules/react-query/index.js'
      )
    ).toBe('react-query');
  });

  it('renders path-like precreated options imports relative to the importer', () => {
    expect(
      resolvePrecreatedOptionsImportPath(
        '/repo/src/App.tsx',
        './client-options',
        '/repo/src/client-options/index.ts'
      )
    ).toBe('./client-options');
  });

  it('normalizes resolved ids by removing query and hash suffixes', () => {
    expect(normalizeResolvedId('/repo/src/api.ts?query=1#hash')).toBe(
      '/repo/src/api.ts'
    );
    expect(stripQueryAndHash('/repo/src/api.ts?query=1#hash')).toBe(
      '/repo/src/api.ts'
    );
  });

  it('preserves path joining helpers for relative imports', () => {
    expect(
      composeImportPath('/repo/src/App.tsx', '/repo/src/api/index.ts')
    ).toBe('./api/index.ts');
    expect(
      resolveRelativeImportPath(
        '/repo/src/App.tsx',
        '/repo/src/api/index.ts',
        './services/PetsService.ts'
      )
    ).toBe('./api/services/PetsService.ts');
  });

  it('strips source extensions and trailing index suffixes independently', () => {
    expect(stripSourceExtension('./services/PetsService.ts')).toBe(
      './services/PetsService'
    );
    expect(stripIndexSourceExtension('./services/index')).toBe('./services');
  });
});
