type DefaultExportWrapper = {
  default?: unknown;
};

/**
 * Resolves default exports from CJS/ESM interop wrappers.
 */
export function resolveDefaultExport<T>(module: unknown): T {
  if (hasDefaultExport(module)) {
    const firstDefault = module.default;

    if (hasDefaultExport(firstDefault) && firstDefault.default != null) {
      return firstDefault.default as T;
    }

    if (firstDefault != null) {
      return firstDefault as T;
    }
  }

  return module as T;
}

function hasDefaultExport(value: unknown): value is DefaultExportWrapper {
  return typeof value === 'object' && value !== null && 'default' in value;
}
