import type { SourceMapInput } from '@jridgewell/trace-mapping';
import path from 'node:path';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';
import { describe, expect, it } from 'vitest';
import { createFixture, transformQraftTreeShaking } from './harness.js';

describe('transformQraftTreeShaking source maps', () => {
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
      },
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
