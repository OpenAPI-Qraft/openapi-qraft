import type {
  ClientEntrypoint,
  QraftPrecreatedClientConfig,
  QraftTreeShakeOptions,
} from './types.js';

export function normalizeEntrypoints(
  options: Pick<QraftTreeShakeOptions, 'createAPIClientFn' | 'apiClient'>
): ClientEntrypoint[] {
  return [
    ...(options.createAPIClientFn ?? []).map((factory) => ({
      kind: 'generatedFactory' as const,
      key: composeGeneratedFactoryEntrypointKey(factory.name, factory.module),
      factory: {
        exportName: factory.name,
        moduleSpecifier: factory.module,
      },
      runtimeContext: factory.context
        ? {
            exportName: factory.context,
            moduleSpecifier: factory.contextModule ?? null,
          }
        : null,
    })),
    ...(options.apiClient ?? []).map((config) =>
      normalizePrecreatedEntrypoint(config)
    ),
  ];
}

function normalizePrecreatedEntrypoint(
  config: QraftPrecreatedClientConfig
): ClientEntrypoint {
  const optionsModule =
    config.createAPIClientFnOptionsModule ?? config.clientModule;

  return {
    kind: 'precreatedClient',
    key: [
      'precreatedClient',
      config.client,
      config.clientModule,
      config.createAPIClientFn,
      config.createAPIClientFnModule,
      config.createAPIClientFnOptions,
      optionsModule,
    ].join(':'),
    client: {
      exportName: config.client,
      moduleSpecifier: config.clientModule,
    },
    factory: {
      exportName: config.createAPIClientFn,
      moduleSpecifier: config.createAPIClientFnModule,
    },
    optionsFactory: {
      exportName: config.createAPIClientFnOptions,
      moduleSpecifier: optionsModule,
    },
  };
}

function composeGeneratedFactoryEntrypointKey(
  exportName: string,
  moduleSpecifier: string
) {
  return ['generatedFactory', exportName, moduleSpecifier].join(':');
}
