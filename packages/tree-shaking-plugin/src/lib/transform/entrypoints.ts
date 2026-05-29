import type {
  ClientEntrypoint,
  QraftPrecreatedClientEntrypointConfig,
  QraftTreeShakeOptions,
  ServicesTarget,
} from './types.js';

export const CONVENTIONAL_GENERATED_SERVICES_DIR = './services';

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
          services.directory,
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
    key: composeEntrypointKey([
      'precreatedClient',
      config.client.exportName,
      config.client.moduleSpecifier,
      config.factory.exportName,
      config.factory.moduleSpecifier,
      config.optionsFactory.exportName,
      config.optionsFactory.moduleSpecifier,
      services.moduleSpecifierBase,
      services.directory,
    ]),
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
  servicesDirectory: string,
  contextModuleSpecifier: string
) {
  return composeEntrypointKey([
    'generatedFactory',
    exportName,
    moduleSpecifier,
    servicesModuleSpecifierBase,
    servicesDirectory,
    contextModuleSpecifier,
  ]);
}

function normalizeServices(
  factoryModuleSpecifier: string,
  services: ServicesTarget | undefined
) {
  return {
    moduleSpecifierBase:
      services?.moduleSpecifierBase ?? factoryModuleSpecifier,
    directory: services?.directory ?? CONVENTIONAL_GENERATED_SERVICES_DIR,
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

function composeEntrypointKey(parts: string[]) {
  return JSON.stringify(parts);
}
