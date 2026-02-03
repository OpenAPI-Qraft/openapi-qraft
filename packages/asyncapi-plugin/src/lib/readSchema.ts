import type { Readable } from 'node:stream';
// eslint-disable-next-line import-x/no-extraneous-dependencies
import type { AsyncAPIDocumentInterface } from '@asyncapi/parser';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
// eslint-disable-next-line import-x/no-extraneous-dependencies
import { Parser } from '@asyncapi/parser';
import { load } from 'js-yaml';

export interface AsyncAPISchemaResult {
  document: AsyncAPIDocumentInterface;
  rawSchema: Record<string, unknown>;
}

export async function readSchema(
  source: string | URL | Readable
): Promise<AsyncAPISchemaResult> {
  if (!source) {
    throw new Error(
      'Empty schema. Please specify a URL, file path, or AsyncAPI document'
    );
  }

  const parser = new Parser();
  let parseResult: {
    document: AsyncAPIDocumentInterface | undefined;
    diagnostics: unknown[];
  };
  let rawSchemaSource: string | undefined;

  if (source instanceof URL) {
    if (source.protocol === 'file:') {
      rawSchemaSource = fs.readFileSync(fileURLToPath(source), 'utf-8');
      parseResult = await parser.parse(rawSchemaSource);
    } else {
      rawSchemaSource = await fetchContent(source.toString());
      parseResult = await parser.parse(rawSchemaSource);
    }
  } else if (
    typeof source === 'string' &&
    (source.startsWith('http://') || source.startsWith('https://'))
  ) {
    rawSchemaSource = await fetchContent(source);
    parseResult = await parser.parse(rawSchemaSource);
  } else if (typeof source === 'string') {
    rawSchemaSource = fs.readFileSync(source, 'utf-8');
    parseResult = await parser.parse(rawSchemaSource);
  } else {
    rawSchemaSource = await streamToString(source);
    parseResult = await parser.parse(rawSchemaSource);
  }

  const { document, diagnostics } = parseResult;

  if (!document) {
    const errors = (diagnostics as Array<{ message?: string }>)
      .filter((d) => d.message)
      .map((d) => d.message)
      .join('\n');
    throw new Error(
      `Failed to parse AsyncAPI document:\n${errors || 'Unknown error'}`
    );
  }

  const rawSchema = rawSchemaSource
    ? parseRawSchema(rawSchemaSource)
    : (document.json() as Record<string, unknown>);

  return { document, rawSchema };
}

function parseRawSchema(content: string): Record<string, unknown> {
  const trimmed = content.trim();
  if (trimmed[0] === '{' || trimmed[0] === '[') {
    return JSON.parse(trimmed);
  }
  return load(trimmed) as Record<string, unknown>;
}

async function fetchContent(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    );
  }
  return response.text();
}

async function streamToString(stream: Readable): Promise<string> {
  let result = '';
  stream.setEncoding('utf-8');
  for await (const chunk of stream) {
    result += chunk;
  }
  return result;
}
