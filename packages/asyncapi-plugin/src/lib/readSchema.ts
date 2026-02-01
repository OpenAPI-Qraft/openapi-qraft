import type { Readable } from 'node:stream';
import type { AsyncAPIDocumentInterface } from '@asyncapi/parser';
import { fromFile, fromURL, Parser } from '@asyncapi/parser';

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

  if (
    source instanceof URL ||
    (typeof source === 'string' &&
      (source.startsWith('http://') || source.startsWith('https://')))
  ) {
    const url = source instanceof URL ? source.toString() : source;
    parseResult = await fromURL(parser, url).parse();
  } else if (typeof source === 'string') {
    parseResult = await fromFile(parser, source).parse();
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
    ? (JSON.parse(rawSchemaSource) as Record<string, unknown>)
    : (document.json() as Record<string, unknown>);

  return { document, rawSchema };
}

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}
