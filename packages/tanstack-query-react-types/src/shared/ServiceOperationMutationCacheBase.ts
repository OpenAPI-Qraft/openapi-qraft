import type { MutationCache } from '@tanstack/react-query';

export type ServiceOperationMutationCacheBase = Omit<
  MutationCache,
  'find' | 'findAll'
>;
