import { createAliasAPIClient } from '@/generated-api';

const api = createAliasAPIClient();

export const result = api.stores.getStores.useQuery();
