import type {
  ClientEntrypoint,
  QraftPrecreatedClientEntrypointConfig,
  QraftTreeShakeOptions,
} from './types.js';

export function normalizeEntrypoints(
  options: Pick<QraftTreeShakeOptions, 'entrypoints'>
): ClientEntrypoint[] {
  return (options.entrypoints ?? []).map((entrypoint) => {
    if (entrypoint.kind === 'clientFactory') {
      return {
        kind: 'generatedFactory',
        key: composeGeneratedFactoryEntrypointKey(
          entrypoint.factory.exportName,
          entrypoint.factory.moduleSpecifier
        ),
        factory: entrypoint.factory,
        reactContext: entrypoint.reactContext
          ? {
              exportName: entrypoint.reactContext.exportName,
              moduleSpecifier: entrypoint.reactContext.moduleSpecifier ?? null,
            }
          : null,
      };
    }

    return normalizePrecreatedEntrypoint(entrypoint);
  });
}

function normalizePrecreatedEntrypoint(
  config: QraftPrecreatedClientEntrypointConfig
): ClientEntrypoint {
  return {
    kind: 'precreatedClient',
    key: [
      'precreatedClient',
      config.client.exportName,
      config.client.moduleSpecifier,
      config.factory.exportName,
      config.factory.moduleSpecifier,
      config.optionsFactory.exportName,
      config.optionsFactory.moduleSpecifier,
    ].join(':'),
    client: config.client,
    factory: config.factory,
    optionsFactory: config.optionsFactory,
  };
}

function composeGeneratedFactoryEntrypointKey(
  exportName: string,
  moduleSpecifier: string
) {
  return ['generatedFactory', exportName, moduleSpecifier].join(':');
}
