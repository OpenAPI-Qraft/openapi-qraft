import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterAll, describe, expect, it } from 'vitest';

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const virtualFilePath = path.join(
  packageRoot,
  'src/tests/__virtual_invoke_tsdoc__.ts'
);

const virtualSource = `
import type {
  QraftServiceOperationInvokeToken,
  QraftServiceOperationsToken,
  RequestFnResponse,
} from '@openapi-qraft/tanstack-query-react-types';
import {
  qraftAPIClient,
  qraftReactAPIClient,
  requestFn,
} from '../index.js';
import * as callbacks from '../callbacks/index.js';

type GetFilesInvoke = {
  /**
   * Fetch files from the API.
   *
   * @summary Get files by ID
   * @deprecated Use getFilesV2 instead
   */
  <TMeta extends Record<string, any>, TSignal extends AbortSignal = AbortSignal>(
    options: {
      parameters: { id: string };
      meta?: TMeta;
      signal?: TSignal;
    },
    client?: (
      schema: { readonly url: '/files'; readonly method: 'get' },
      options: {
        parameters: { id: string };
        meta?: TMeta;
        signal?: TSignal;
      }
    ) => Promise<RequestFnResponse<string, Error>>
  ): Promise<RequestFnResponse<string, Error>>;
};

interface OverloadedInvoke {
  /**
   * Fetch a single file by ID.
   *
   * @summary Get single file
   */
  (options: { id: string }): Promise<string>;
  /**
   * Fetch all files in one request.
   *
   * @summary List all files
   * @deprecated Use paginated endpoint
   */
  (options: { all: true }): Promise<string[]>;
}

const getFilesOp = {
  schema: { url: '/files', method: 'get' },
} as {
  schema: { readonly url: '/files'; readonly method: 'get' };
  [QraftServiceOperationsToken]: GetFilesInvoke & {
    getQueryKey(parameters: { id: string }): readonly unknown[];
    useQuery(parameters: { id: string }): unknown;
    schema: { readonly url: '/files'; readonly method: 'get' };
    types: { parameters: { id: string }; data: string; error: Error };
  };
  [QraftServiceOperationInvokeToken]: GetFilesInvoke;
};

const overloadedOp = {
  schema: { url: '/files/list', method: 'get' },
} as {
  schema: { readonly url: '/files/list'; readonly method: 'get' };
  [QraftServiceOperationsToken]: OverloadedInvoke & {
    getQueryKey(parameters: { id: string }): readonly unknown[];
    schema: { readonly url: '/files/list'; readonly method: 'get' };
    types: { parameters: { id: string }; data: string; error: Error };
  };
  readonly [QraftServiceOperationInvokeToken]: OverloadedInvoke;
};

const legacyOp = {
  schema: { url: '/files/legacy', method: 'get' },
} as {
  schema: { readonly url: '/files/legacy'; readonly method: 'get' };
  [QraftServiceOperationsToken]: {
    (options: { id: string }): Promise<number>;
    getQueryKey(parameters: { id: string }): readonly unknown[];
    schema: { readonly url: '/files/legacy'; readonly method: 'get' };
    types: { parameters: { id: string }; data: number; error: Error };
  };
};

const filesService = {
  getFiles: getFilesOp,
  overloaded: overloadedOp,
  legacy: legacyOp,
} as const;

const servicesClient = qraftAPIClient(
  { files: filesService } as const,
  callbacks,
  {
    requestFn,
    baseUrl: 'https://api.example.com',
  }
);

const serviceClient = qraftAPIClient(filesService, callbacks, {
  requestFn,
  baseUrl: 'https://api.example.com',
});

const singleOpClient = qraftAPIClient(getFilesOp, callbacks, {
  requestFn,
  baseUrl: 'https://api.example.com',
});

const legacySingleOpClient = qraftAPIClient(legacyOp, callbacks, {
  requestFn,
  baseUrl: 'https://api.example.com',
});

const reactClient = qraftReactAPIClient(
  { files: filesService } as const,
  callbacks,
  {
    requestFn,
    baseUrl: 'https://api.example.com',
  }
);

servicesClient.files.getFiles({
  parameters: { id: '1' },
  meta: { traceId: 't-1' },
});
serviceClient.getFiles({ parameters: { id: '1' } });
singleOpClient({ parameters: { id: '1' } });
reactClient.files.getFiles({ parameters: { id: '1' } });
servicesClient.files.overloaded({ id: '1' });
servicesClient.files.overloaded({ all: true });
servicesClient.files.legacy({ id: '1' });
serviceClient.legacy({ id: '1' });
legacySingleOpClient({ id: '1' });
`;

function createTestLanguageService() {
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    jsx: ts.JsxEmit.React,
    verbatimModuleSyntax: true,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
  };

  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => [virtualFilePath],
    getScriptVersion: () => '1',
    getScriptSnapshot: (fileName) => {
      if (fileName === virtualFilePath) {
        return ts.ScriptSnapshot.fromString(virtualSource);
      }
      const content = ts.sys.readFile(fileName);
      return content !== undefined
        ? ts.ScriptSnapshot.fromString(content)
        : undefined;
    },
    getCurrentDirectory: () => packageRoot,
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: (fileName) =>
      fileName === virtualFilePath || ts.sys.fileExists(fileName),
    readFile: (fileName) =>
      fileName === virtualFilePath ? virtualSource : ts.sys.readFile(fileName),
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
    realpath: ts.sys.realpath,
  };

  return ts.createLanguageService(host, ts.createDocumentRegistry());
}

function getOffset(needle: string, offsetInsideNeedle: number): number {
  const index = virtualSource.indexOf(needle);
  if (index === -1) {
    throw new Error(`Could not find needle in virtual source: ${needle}`);
  }
  return index + offsetInsideNeedle;
}

function normalizeTags(
  tags: readonly ts.JSDocTagInfo[] | undefined
): Array<{ name: string; text: string }> {
  return (tags ?? []).map((tag) => ({
    name: tag.name,
    text: ts.displayPartsToString(tag.text),
  }));
}

describe('qraftAPIClient invoke TSDoc preservation via TypeScript Language Service', () => {
  const languageService = createTestLanguageService();

  afterAll(() => {
    languageService.dispose();
  });

  it('typechecks all invoke call shapes without syntactic or semantic diagnostics', () => {
    const diagnostics = [
      ...languageService.getSyntacticDiagnostics(virtualFilePath),
      ...languageService.getSemanticDiagnostics(virtualFilePath),
    ];

    expect(
      diagnostics.map((d) =>
        ts.flattenDiagnosticMessageText(d.messageText, '\n')
      )
    ).toEqual([]);
  });

  it.each([
    {
      label: 'ServicesDeclaration (client.<service>.<op>(...))',
      calleeNeedle: 'servicesClient.files.getFiles({',
      calleeOffset: 'servicesClient.files.'.length + 2,
      callNeedle: 'servicesClient.files.getFiles({',
      callOffset: 'servicesClient.files.getFiles('.length + 1,
    },
    {
      label: 'OperationsDeclaration (<service>.<op>(...))',
      calleeNeedle: 'serviceClient.getFiles({',
      calleeOffset: 'serviceClient.'.length + 2,
      callNeedle: 'serviceClient.getFiles({',
      callOffset: 'serviceClient.getFiles('.length + 1,
    },
    {
      label: 'single OperationDeclaration (<op>(...))',
      calleeNeedle: 'singleOpClient({',
      calleeOffset: 2,
      callNeedle: 'singleOpClient({',
      callOffset: 'singleOpClient('.length + 1,
    },
    {
      label: 'qraftReactAPIClient ServicesDeclaration',
      calleeNeedle: 'reactClient.files.getFiles({',
      calleeOffset: 'reactClient.files.'.length + 2,
      callNeedle: 'reactClient.files.getFiles({',
      callOffset: 'reactClient.files.getFiles('.length + 1,
    },
  ])(
    'preserves QuickInfo and SignatureHelp TSDoc for $label',
    ({ calleeNeedle, calleeOffset, callNeedle, callOffset }) => {
      const quickInfo = languageService.getQuickInfoAtPosition(
        virtualFilePath,
        getOffset(calleeNeedle, calleeOffset)
      );

      expect(quickInfo).toBeDefined();
      expect(ts.displayPartsToString(quickInfo?.documentation)).toContain(
        'Fetch files from the API.'
      );
      expect(normalizeTags(quickInfo?.tags)).toEqual([
        { name: 'summary', text: 'Get files by ID' },
        { name: 'deprecated', text: 'Use getFilesV2 instead' },
      ]);

      const signatureHelp = languageService.getSignatureHelpItems(
        virtualFilePath,
        getOffset(callNeedle, callOffset),
        undefined
      );

      expect(signatureHelp).toBeDefined();
      expect(signatureHelp?.items).toHaveLength(1);
      expect(
        ts.displayPartsToString(signatureHelp?.items[0].documentation)
      ).toContain('Fetch files from the API.');
      expect(normalizeTags(signatureHelp?.items[0].tags)).toEqual([
        { name: 'summary', text: 'Get files by ID' },
        { name: 'deprecated', text: 'Use getFilesV2 instead' },
      ]);
    }
  );

  it('reports @deprecated suggestion diagnostics for deprecated invoke calls across all shapes', () => {
    const deprecatedSuggestions = languageService
      .getSuggestionDiagnostics(virtualFilePath)
      .filter((diagnostic) => diagnostic.code === 6387)
      .map((diagnostic) => ({
        snippet: virtualSource.slice(
          diagnostic.start,
          diagnostic.start + diagnostic.length
        ),
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      }));

    expect(deprecatedSuggestions.map((item) => item.snippet)).toEqual(
      expect.arrayContaining(['getFiles', 'singleOpClient', 'overloaded'])
    );
    expect(
      deprecatedSuggestions.some((item) =>
        item.message.includes('servicesClient.files.getFiles')
      )
    ).toBe(true);
    expect(
      deprecatedSuggestions.some((item) =>
        item.message.includes('serviceClient.getFiles')
      )
    ).toBe(true);
    expect(
      deprecatedSuggestions.some((item) =>
        item.message.includes('singleOpClient')
      )
    ).toBe(true);
  });

  it('preserves overloaded invoke signatures and per-overload TSDoc', () => {
    const firstQuickInfo = languageService.getQuickInfoAtPosition(
      virtualFilePath,
      getOffset("servicesClient.files.overloaded({ id: '1' });", 23)
    );
    expect(ts.displayPartsToString(firstQuickInfo?.documentation)).toContain(
      'Fetch a single file by ID.'
    );
    expect(normalizeTags(firstQuickInfo?.tags)).toEqual([
      { name: 'summary', text: 'Get single file' },
    ]);

    const firstSigHelp = languageService.getSignatureHelpItems(
      virtualFilePath,
      getOffset(
        "servicesClient.files.overloaded({ id: '1' });",
        'servicesClient.files.overloaded('.length + 1
      ),
      undefined
    );
    expect(firstSigHelp?.items).toHaveLength(2);
    expect(firstSigHelp?.selectedItemIndex).toBe(0);
    expect(
      ts.displayPartsToString(firstSigHelp?.items[0].documentation)
    ).toContain('Fetch a single file by ID.');
    expect(
      ts.displayPartsToString(firstSigHelp?.items[1].documentation)
    ).toContain('Fetch all files in one request.');

    const secondQuickInfo = languageService.getQuickInfoAtPosition(
      virtualFilePath,
      getOffset('servicesClient.files.overloaded({ all: true });', 23)
    );
    expect(ts.displayPartsToString(secondQuickInfo?.documentation)).toContain(
      'Fetch all files in one request.'
    );
    expect(normalizeTags(secondQuickInfo?.tags)).toEqual([
      { name: 'summary', text: 'List all files' },
      { name: 'deprecated', text: 'Use paginated endpoint' },
    ]);

    const secondSigHelp = languageService.getSignatureHelpItems(
      virtualFilePath,
      getOffset(
        'servicesClient.files.overloaded({ all: true });',
        'servicesClient.files.overloaded('.length + 1
      ),
      undefined
    );
    expect(secondSigHelp?.items).toHaveLength(2);
    expect(secondSigHelp?.selectedItemIndex).toBe(1);
  });

  it.each([
    {
      label: 'ServicesDeclaration legacy operation',
      callNeedle: "servicesClient.files.legacy({ id: '1' });",
      callOffset: 'servicesClient.files.legacy('.length + 1,
    },
    {
      label: 'OperationsDeclaration legacy operation',
      callNeedle: "serviceClient.legacy({ id: '1' });",
      callOffset: 'serviceClient.legacy('.length + 1,
    },
    {
      label: 'single OperationDeclaration legacy operation',
      callNeedle: "legacySingleOpClient({ id: '1' });",
      callOffset: 'legacySingleOpClient('.length + 1,
    },
  ])(
    'keeps callable signature help for $label without QraftServiceOperationInvokeToken',
    ({ callNeedle, callOffset }) => {
      const signatureHelp = languageService.getSignatureHelpItems(
        virtualFilePath,
        getOffset(callNeedle, callOffset),
        undefined
      );

      expect(signatureHelp).toBeDefined();
      expect(signatureHelp?.items).toHaveLength(1);
    }
  );
});
