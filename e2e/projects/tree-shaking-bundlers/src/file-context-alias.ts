import { createAliasDirectAPIClient } from '@/generated-api/create-alias-direct-api-client';

const api = createAliasDirectAPIClient();

export const result = api.stores.getStores.useQuery();
