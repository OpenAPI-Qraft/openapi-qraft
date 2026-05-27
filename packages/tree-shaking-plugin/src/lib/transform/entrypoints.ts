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
      const services = normalizeServices(
        entrypoint.factory.moduleSpecifier,
        entrypoint.services
      );
      const reactContext = normalizeReactContext(
        entrypoint.factory.moduleSpecifier,
        entrypoint.reactContext
      );

      return {
        kind: 'generatedFactory',
        key: composeGeneratedFactoryEntrypointKey(
          entrypoint.factory.exportName,
          entrypoint.factory.moduleSpecifier,
          services.moduleSpecifierBase,
          reactContext?.moduleSpecifier ?? ''
        ),
        factory: entrypoint.factory,
        services,
        reactContext,
      };
    }

    return normalizePrecreatedEntrypoint(entrypoint);
  });
}

function normalizePrecreatedEntrypoint(
  config: QraftPrecreatedClientEntrypointConfig
): ClientEntrypoint {
  const services = normalizeServices(
    config.factory.moduleSpecifier,
    config.services
  );

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
      services.moduleSpecifierBase,
    ].join(':'),
    client: config.client,
    factory: config.factory,
    optionsFactory: config.optionsFactory,
    services,
  };
}

function composeGeneratedFactoryEntrypointKey(
  exportName: string,
  moduleSpecifier: string,
  servicesModuleSpecifierBase: string,
  contextModuleSpecifier: string
) {
  return [
    'generatedFactory',
    exportName,
    moduleSpecifier,
    servicesModuleSpecifierBase,
    contextModuleSpecifier,
  ].join(':');
}

function normalizeServices(
  factoryModuleSpecifier: string,
  services: { moduleSpecifierBase: string } | undefined
) {
  return {
    moduleSpecifierBase:
      services?.moduleSpecifierBase ?? factoryModuleSpecifier,
  };
}

function normalizeReactContext(
  factoryModuleSpecifier: string,
  reactContext:
    | { exportName: string; moduleSpecifier?: string }
    | undefined
) {
  return reactContext
    ? {
        exportName: reactContext.exportName,
        moduleSpecifier:
          reactContext.moduleSpecifier ?? factoryModuleSpecifier,
      }
    : null;
}
