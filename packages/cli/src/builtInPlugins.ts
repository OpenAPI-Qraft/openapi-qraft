import type { BuiltInPlugins } from '@qraft/cli-utils';

export const openApiBuiltInPlugins = {
  'tanstack-query-react': () =>
    import('@openapi-qraft/tanstack-query-react-plugin'),
  'openapi-typescript': () =>
    import('@openapi-qraft/openapi-typescript-plugin'),
} as const satisfies BuiltInPlugins;

export const asyncApiBuiltInPlugins = {
  'asyncapi-typescript': () => import('@qraft/asyncapi-typescript-plugin'),
} as const satisfies BuiltInPlugins;
