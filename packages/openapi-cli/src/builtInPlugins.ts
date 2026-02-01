import type { BuiltInPlugins } from '@qraft/cli-utils';

export const builtInPlugins = {
  'tanstack-query-react': () =>
    import('@openapi-qraft/tanstack-query-react-plugin'),
  'openapi-typescript': () =>
    import('@openapi-qraft/openapi-typescript-plugin'),
} as const satisfies BuiltInPlugins;
