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

function createTestLanguageService(filePath: string, source: string) {
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    baseUrl: packageRoot,
    paths: {
      '@openapi-qraft/react': ['./src/index.ts'],
      '@openapi-qraft/react/callbacks/index': ['./src/callbacks/index.ts'],
      '@openapi-qraft/react/Unstable_QraftSecureRequestFn': [
        './src/Unstable_QraftSecureRequestFn.ts',
      ],
    },
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    jsx: ts.JsxEmit.React,
    verbatimModuleSyntax: true,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
  };

  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => [filePath],
    getScriptVersion: () => '1',
    getScriptSnapshot: (fileName) => {
      if (fileName === filePath) {
        return ts.ScriptSnapshot.fromString(source);
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
      fileName === filePath || ts.sys.fileExists(fileName),
    readFile: (fileName) =>
      fileName === filePath ? source : ts.sys.readFile(fileName),
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
    realpath: ts.sys.realpath,
  };

  return ts.createLanguageService(host, ts.createDocumentRegistry());
}

function getOffset(
  source: string,
  needle: string,
  offsetInsideNeedle: number
): number {
  const index = source.indexOf(needle);
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
  const languageService = createTestLanguageService(
    virtualFilePath,
    virtualSource
  );

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
        getOffset(virtualSource, calleeNeedle, calleeOffset)
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
        getOffset(virtualSource, callNeedle, callOffset),
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
      getOffset(
        virtualSource,
        "servicesClient.files.overloaded({ id: '1' });",
        23
      )
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
        virtualSource,
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
      getOffset(
        virtualSource,
        'servicesClient.files.overloaded({ all: true });',
        23
      )
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
        virtualSource,
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
        getOffset(virtualSource, callNeedle, callOffset),
        undefined
      );

      expect(signatureHelp).toBeDefined();
      expect(signatureHelp?.items).toHaveLength(1);
    }
  );
});

const fixturesVirtualFilePath = path.join(
  packageRoot,
  'src/tests/__virtual_generated_fixtures_tsdoc__.ts'
);

const fixturesVirtualSource = `
import { QueryClient } from '@tanstack/react-query';
import * as callbacks from '../callbacks/index.js';
import {
  qraftAPIClient,
  qraftReactAPIClient,
  requestFn,
} from '../index.js';
import { createAPIClient, services } from './fixtures/api/index.js';
import { findAll, getFiles } from './fixtures/api/services/FilesService.js';

interface CustomAbortSignal extends AbortSignal {
  readonly customBrand: 'custom-signal';
}

declare const customSignal: CustomAbortSignal;

const baseUrl = 'https://api.example.com';

const filesParameters = {
  header: { 'x-monite-version': '2023-06-04' },
  query: { id__in: ['file-1'] },
} as const;

const approvalPolicyParameters = {
  header: { 'x-monite-version': '2023-06-04' },
  path: { approval_policy_id: 'policy-1' },
} as const;

const documentsParameters = {
  path: { entity_id: 'entity-1' },
} as const;

const documentsBody = {
  verification_document_front: 'front.pdf',
} as const;

const client = qraftAPIClient(services, callbacks, {
  queryClient: new QueryClient(),
  requestFn,
  baseUrl,
});

const generatedClient = createAPIClient({
  queryClient: new QueryClient(),
  requestFn,
  baseUrl,
});

const apiBasicClient = qraftAPIClient(services, callbacks, {
  requestFn,
  baseUrl,
});

const generatedBasicClient = createAPIClient({
  requestFn,
  baseUrl,
});

const partialCallbacksClient = qraftAPIClient(
  services,
  {
    operationInvokeFn: callbacks.operationInvokeFn,
    getQueryKey: callbacks.getQueryKey,
  },
  {
    requestFn,
    baseUrl,
  }
);

const serviceClient = qraftAPIClient(
  { getFiles, findAll },
  callbacks,
  {
    requestFn,
    baseUrl,
  }
);

const singleOpClient = qraftAPIClient(getFiles, callbacks, {
  requestFn,
  baseUrl,
});

const deprecatedSingleOpClient = qraftAPIClient(findAll, callbacks, {
  requestFn,
  baseUrl,
});

const reactClient = qraftReactAPIClient(services, callbacks, {
  requestFn,
  baseUrl,
});

// Direct invocations across all client shapes
client.files.getFiles({ parameters: filesParameters });
generatedClient.files.getFiles({ parameters: filesParameters });
apiBasicClient.files.getFiles({ parameters: filesParameters });
generatedBasicClient.files.getFiles({ parameters: filesParameters });
partialCallbacksClient.files.getFiles({ parameters: filesParameters });
serviceClient.getFiles({ parameters: filesParameters });
singleOpClient({ parameters: filesParameters });
reactClient.files.getFiles({ parameters: filesParameters });

// Explicit <TMeta, TSignal> generic preservation on generated fixtures
apiBasicClient.files.getFiles<{ readonly traceId: string }, CustomAbortSignal>(
  {
    parameters: filesParameters,
    meta: { traceId: 'trace-1' },
    signal: customSignal,
  },
  (_schema, reqOptions) => {
    reqOptions.meta satisfies { readonly traceId: string } | undefined;
    reqOptions.signal satisfies CustomAbortSignal | undefined;
    return Promise.reject(new Error('type-only'));
  }
);

client.files.findAll<{ readonly listTrace: string }, CustomAbortSignal>(
  {
    parameters: {},
    meta: { listTrace: 'list-1' },
    signal: customSignal,
  },
  (_schema, reqOptions) => {
    reqOptions.meta satisfies { readonly listTrace: string } | undefined;
    reqOptions.signal satisfies CustomAbortSignal | undefined;
    return Promise.reject(new Error('type-only'));
  }
);

apiBasicClient.entities.postEntitiesIdDocuments<
  { readonly auditId: number },
  CustomAbortSignal
>(
  {
    parameters: documentsParameters,
    body: documentsBody,
    meta: { auditId: 42 },
    signal: customSignal,
  },
  (_schema, reqOptions) => {
    reqOptions.meta satisfies { readonly auditId: number } | undefined;
    reqOptions.signal satisfies CustomAbortSignal | undefined;
    return Promise.reject(new Error('type-only'));
  }
);

singleOpClient<{ readonly single: true }, CustomAbortSignal>(
  {
    parameters: filesParameters,
    meta: { single: true },
    signal: customSignal,
  },
  (_schema, reqOptions) => {
    reqOptions.meta satisfies { readonly single: true } | undefined;
    reqOptions.signal satisfies CustomAbortSignal | undefined;
    return Promise.reject(new Error('type-only'));
  }
);

// @summary + @description on generated query and mutation operations
client.approvalPolicies.getApprovalPoliciesId({
  parameters: approvalPolicyParameters,
});
apiBasicClient.approvalPolicies.getApprovalPoliciesId({
  parameters: approvalPolicyParameters,
});
apiBasicClient.entities.postEntitiesIdDocuments({
  parameters: documentsParameters,
  body: documentsBody,
});

// @deprecated findAll across all client shapes
client.files.findAll({ parameters: {} });
apiBasicClient.files.findAll({ parameters: {} });
generatedBasicClient.files.findAll({ parameters: {} });
serviceClient.findAll({ parameters: {} });
deprecatedSingleOpClient({ parameters: {} });
reactClient.files.findAll({ parameters: {} });
`;

describe('qraftAPIClient invoke TSDoc and generic preservation with generated API fixtures', () => {
  const languageService = createTestLanguageService(
    fixturesVirtualFilePath,
    fixturesVirtualSource
  );

  afterAll(() => {
    languageService.dispose();
  });

  it('typechecks all generated fixture calls including explicit <TMeta, TSignal> generics without diagnostics', () => {
    const diagnostics = [
      ...languageService.getSyntacticDiagnostics(fixturesVirtualFilePath),
      ...languageService.getSemanticDiagnostics(fixturesVirtualFilePath),
    ];

    expect(
      diagnostics.map((d) =>
        ts.flattenDiagnosticMessageText(d.messageText, '\n')
      )
    ).toEqual([]);
  });

  it('preserves <TMeta, TSignal> type parameters in SignatureHelp and QuickInfo', () => {
    const signatureHelp = languageService.getSignatureHelpItems(
      fixturesVirtualFilePath,
      getOffset(
        fixturesVirtualSource,
        'apiBasicClient.files.getFiles<{ readonly traceId: string }, CustomAbortSignal>(',
        'apiBasicClient.files.getFiles<'.length
      ),
      undefined
    );

    expect(signatureHelp).toBeDefined();
    expect(signatureHelp?.items).toHaveLength(1);
    expect(
      ts.displayPartsToString(signatureHelp?.items[0].prefixDisplayParts)
    ).toBe('getFiles<');
    expect(
      signatureHelp?.items[0].parameters.map((parameter) =>
        ts.displayPartsToString(parameter.displayParts)
      )
    ).toEqual([
      'TMeta extends Record<string, any>',
      'TSignal extends AbortSignal = AbortSignal',
    ]);
    expect(normalizeTags(signatureHelp?.items[0].tags)).toEqual([
      { name: 'summary', text: 'Get a files by ID' },
    ]);

    const genericQuickInfo = languageService.getQuickInfoAtPosition(
      fixturesVirtualFilePath,
      getOffset(
        fixturesVirtualSource,
        'apiBasicClient.files.getFiles<{ readonly traceId: string }, CustomAbortSignal>(',
        'apiBasicClient.files.'.length + 2
      )
    );
    expect(ts.displayPartsToString(genericQuickInfo?.displayParts)).toContain(
      'CustomAbortSignal'
    );
    expect(ts.displayPartsToString(genericQuickInfo?.displayParts)).toContain(
      'readonly traceId: string'
    );
  });

  it.each([
    {
      label: 'qraftAPIClient with queryClient (client.files.getFiles)',
      calleeNeedle: 'client.files.getFiles({ parameters: filesParameters });',
      calleeOffset: 'client.files.'.length + 2,
      callNeedle: 'client.files.getFiles({ parameters: filesParameters });',
      callOffset: 'client.files.getFiles('.length + 1,
    },
    {
      label:
        'createAPIClient with queryClient (generatedClient.files.getFiles)',
      calleeNeedle:
        'generatedClient.files.getFiles({ parameters: filesParameters });',
      calleeOffset: 'generatedClient.files.'.length + 2,
      callNeedle:
        'generatedClient.files.getFiles({ parameters: filesParameters });',
      callOffset: 'generatedClient.files.getFiles('.length + 1,
    },
    {
      label: 'qraftAPIClient basic client (apiBasicClient.files.getFiles)',
      calleeNeedle:
        'apiBasicClient.files.getFiles({ parameters: filesParameters });',
      calleeOffset: 'apiBasicClient.files.'.length + 2,
      callNeedle:
        'apiBasicClient.files.getFiles({ parameters: filesParameters });',
      callOffset: 'apiBasicClient.files.getFiles('.length + 1,
    },
    {
      label:
        'createAPIClient basic client (generatedBasicClient.files.getFiles)',
      calleeNeedle:
        'generatedBasicClient.files.getFiles({ parameters: filesParameters });',
      calleeOffset: 'generatedBasicClient.files.'.length + 2,
      callNeedle:
        'generatedBasicClient.files.getFiles({ parameters: filesParameters });',
      callOffset: 'generatedBasicClient.files.getFiles('.length + 1,
    },
    {
      label: 'partial callbacks client (partialCallbacksClient.files.getFiles)',
      calleeNeedle:
        'partialCallbacksClient.files.getFiles({ parameters: filesParameters });',
      calleeOffset: 'partialCallbacksClient.files.'.length + 2,
      callNeedle:
        'partialCallbacksClient.files.getFiles({ parameters: filesParameters });',
      callOffset: 'partialCallbacksClient.files.getFiles('.length + 1,
    },
    {
      label: 'OperationsDeclaration client (serviceClient.getFiles)',
      calleeNeedle: 'serviceClient.getFiles({ parameters: filesParameters });',
      calleeOffset: 'serviceClient.'.length + 2,
      callNeedle: 'serviceClient.getFiles({ parameters: filesParameters });',
      callOffset: 'serviceClient.getFiles('.length + 1,
    },
    {
      label: 'single OperationDeclaration client (singleOpClient)',
      calleeNeedle: 'singleOpClient({ parameters: filesParameters });',
      calleeOffset: 2,
      callNeedle: 'singleOpClient({ parameters: filesParameters });',
      callOffset: 'singleOpClient('.length + 1,
    },
    {
      label: 'qraftReactAPIClient (reactClient.files.getFiles)',
      calleeNeedle:
        'reactClient.files.getFiles({ parameters: filesParameters });',
      calleeOffset: 'reactClient.files.'.length + 2,
      callNeedle:
        'reactClient.files.getFiles({ parameters: filesParameters });',
      callOffset: 'reactClient.files.getFiles('.length + 1,
    },
  ])(
    'preserves generated getFiles @summary TSDoc in QuickInfo and SignatureHelp for $label',
    ({ calleeNeedle, calleeOffset, callNeedle, callOffset }) => {
      const quickInfo = languageService.getQuickInfoAtPosition(
        fixturesVirtualFilePath,
        getOffset(fixturesVirtualSource, calleeNeedle, calleeOffset)
      );

      expect(quickInfo).toBeDefined();
      expect(normalizeTags(quickInfo?.tags)).toEqual([
        { name: 'summary', text: 'Get a files by ID' },
      ]);

      const signatureHelp = languageService.getSignatureHelpItems(
        fixturesVirtualFilePath,
        getOffset(fixturesVirtualSource, callNeedle, callOffset),
        undefined
      );

      expect(signatureHelp).toBeDefined();
      expect(signatureHelp?.items).toHaveLength(1);
      expect(normalizeTags(signatureHelp?.items[0].tags)).toEqual([
        { name: 'summary', text: 'Get a files by ID' },
      ]);
    }
  );

  it.each([
    {
      label:
        'qraftAPIClient query with @summary and @description (client.approvalPolicies.getApprovalPoliciesId)',
      calleeNeedle:
        'client.approvalPolicies.getApprovalPoliciesId({\n  parameters: approvalPolicyParameters,',
      calleeOffset: 'client.approvalPolicies.'.length + 2,
      callNeedle:
        'client.approvalPolicies.getApprovalPoliciesId({\n  parameters: approvalPolicyParameters,',
      callOffset: 'client.approvalPolicies.getApprovalPoliciesId('.length + 1,
      expectedTags: [
        { name: 'summary', text: 'Get an approval policy by ID' },
        {
          name: 'description',
          text: 'Retrieve a specific approval policy.',
        },
      ],
    },
    {
      label:
        'basic client query with @summary and @description (apiBasicClient.approvalPolicies.getApprovalPoliciesId)',
      calleeNeedle:
        'apiBasicClient.approvalPolicies.getApprovalPoliciesId({\n  parameters: approvalPolicyParameters,',
      calleeOffset: 'apiBasicClient.approvalPolicies.'.length + 2,
      callNeedle:
        'apiBasicClient.approvalPolicies.getApprovalPoliciesId({\n  parameters: approvalPolicyParameters,',
      callOffset:
        'apiBasicClient.approvalPolicies.getApprovalPoliciesId('.length + 1,
      expectedTags: [
        { name: 'summary', text: 'Get an approval policy by ID' },
        {
          name: 'description',
          text: 'Retrieve a specific approval policy.',
        },
      ],
    },
    {
      label:
        'basic client mutation with @summary and @description (apiBasicClient.entities.postEntitiesIdDocuments)',
      calleeNeedle:
        'apiBasicClient.entities.postEntitiesIdDocuments({\n  parameters: documentsParameters,',
      calleeOffset: 'apiBasicClient.entities.'.length + 2,
      callNeedle:
        'apiBasicClient.entities.postEntitiesIdDocuments({\n  parameters: documentsParameters,',
      callOffset: 'apiBasicClient.entities.postEntitiesIdDocuments('.length + 1,
      expectedTags: [
        { name: 'summary', text: 'Update entity onboarding documents' },
        {
          name: 'description',
          text: 'Update the onboarding documents of an entity.',
        },
      ],
    },
  ])(
    'preserves @summary and @description TSDoc for $label',
    ({ calleeNeedle, calleeOffset, callNeedle, callOffset, expectedTags }) => {
      const quickInfo = languageService.getQuickInfoAtPosition(
        fixturesVirtualFilePath,
        getOffset(fixturesVirtualSource, calleeNeedle, calleeOffset)
      );

      expect(quickInfo).toBeDefined();
      expect(normalizeTags(quickInfo?.tags)).toEqual(expectedTags);

      const signatureHelp = languageService.getSignatureHelpItems(
        fixturesVirtualFilePath,
        getOffset(fixturesVirtualSource, callNeedle, callOffset),
        undefined
      );

      expect(signatureHelp).toBeDefined();
      expect(signatureHelp?.items).toHaveLength(1);
      expect(normalizeTags(signatureHelp?.items[0].tags)).toEqual(expectedTags);
    }
  );

  it.each([
    {
      label: 'qraftAPIClient with queryClient (client.files.findAll)',
      calleeNeedle: 'client.files.findAll({ parameters: {} });',
      calleeOffset: 'client.files.'.length + 2,
      callNeedle: 'client.files.findAll({ parameters: {} });',
      callOffset: 'client.files.findAll('.length + 1,
    },
    {
      label: 'qraftAPIClient basic client (apiBasicClient.files.findAll)',
      calleeNeedle: 'apiBasicClient.files.findAll({ parameters: {} });',
      calleeOffset: 'apiBasicClient.files.'.length + 2,
      callNeedle: 'apiBasicClient.files.findAll({ parameters: {} });',
      callOffset: 'apiBasicClient.files.findAll('.length + 1,
    },
    {
      label:
        'createAPIClient basic client (generatedBasicClient.files.findAll)',
      calleeNeedle: 'generatedBasicClient.files.findAll({ parameters: {} });',
      calleeOffset: 'generatedBasicClient.files.'.length + 2,
      callNeedle: 'generatedBasicClient.files.findAll({ parameters: {} });',
      callOffset: 'generatedBasicClient.files.findAll('.length + 1,
    },
    {
      label: 'OperationsDeclaration client (serviceClient.findAll)',
      calleeNeedle: 'serviceClient.findAll({ parameters: {} });',
      calleeOffset: 'serviceClient.'.length + 2,
      callNeedle: 'serviceClient.findAll({ parameters: {} });',
      callOffset: 'serviceClient.findAll('.length + 1,
    },
    {
      label: 'single OperationDeclaration client (deprecatedSingleOpClient)',
      calleeNeedle: 'deprecatedSingleOpClient({ parameters: {} });',
      calleeOffset: 2,
      callNeedle: 'deprecatedSingleOpClient({ parameters: {} });',
      callOffset: 'deprecatedSingleOpClient('.length + 1,
    },
    {
      label: 'qraftReactAPIClient (reactClient.files.findAll)',
      calleeNeedle: 'reactClient.files.findAll({ parameters: {} });',
      calleeOffset: 'reactClient.files.'.length + 2,
      callNeedle: 'reactClient.files.findAll({ parameters: {} });',
      callOffset: 'reactClient.files.findAll('.length + 1,
    },
  ])(
    'preserves @deprecated and @summary TSDoc for generated findAll on $label',
    ({ calleeNeedle, calleeOffset, callNeedle, callOffset }) => {
      const quickInfo = languageService.getQuickInfoAtPosition(
        fixturesVirtualFilePath,
        getOffset(fixturesVirtualSource, calleeNeedle, calleeOffset)
      );

      expect(quickInfo).toBeDefined();
      expect(normalizeTags(quickInfo?.tags)).toEqual([
        { name: 'deprecated', text: '' },
        { name: 'summary', text: 'Get a file list' },
      ]);

      const signatureHelp = languageService.getSignatureHelpItems(
        fixturesVirtualFilePath,
        getOffset(fixturesVirtualSource, callNeedle, callOffset),
        undefined
      );

      expect(signatureHelp).toBeDefined();
      expect(signatureHelp?.items).toHaveLength(1);
      expect(normalizeTags(signatureHelp?.items[0].tags)).toEqual([
        { name: 'deprecated', text: '' },
        { name: 'summary', text: 'Get a file list' },
      ]);
    }
  );

  it('reports @deprecated suggestion diagnostics for generated findAll invocations without false positives', () => {
    const deprecatedSuggestions = languageService
      .getSuggestionDiagnostics(fixturesVirtualFilePath)
      .filter((diagnostic) => diagnostic.code === 6387)
      .map((diagnostic) => ({
        snippet: fixturesVirtualSource.slice(
          diagnostic.start,
          diagnostic.start + diagnostic.length
        ),
        message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      }));

    expect(deprecatedSuggestions.map((item) => item.snippet)).toEqual(
      expect.arrayContaining(['findAll', 'deprecatedSingleOpClient'])
    );
    expect(
      deprecatedSuggestions.some((item) =>
        item.message.includes('client.files.findAll')
      )
    ).toBe(true);
    expect(
      deprecatedSuggestions.some((item) =>
        item.message.includes('apiBasicClient.files.findAll')
      )
    ).toBe(true);
    expect(
      deprecatedSuggestions.some((item) =>
        item.message.includes('generatedBasicClient.files.findAll')
      )
    ).toBe(true);
    expect(
      deprecatedSuggestions.some((item) =>
        item.message.includes('serviceClient.findAll')
      )
    ).toBe(true);
    expect(
      deprecatedSuggestions.some((item) =>
        item.message.includes('deprecatedSingleOpClient')
      )
    ).toBe(true);
    expect(
      deprecatedSuggestions.some((item) =>
        item.message.includes('reactClient.files.findAll')
      )
    ).toBe(true);

    expect(
      deprecatedSuggestions.some((item) => item.message.includes('getFiles'))
    ).toBe(false);
    expect(
      deprecatedSuggestions.some((item) =>
        item.message.includes('getApprovalPoliciesId')
      )
    ).toBe(false);
    expect(
      deprecatedSuggestions.some((item) =>
        item.message.includes('postEntitiesIdDocuments')
      )
    ).toBe(false);
  });
});
