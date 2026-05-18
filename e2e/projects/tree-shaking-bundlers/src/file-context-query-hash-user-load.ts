import { createQueryHashAPIClient } from 'virtual:qraft-query-hash-api';

const api = createQueryHashAPIClient();

export const result = api.pets.getPets.useQuery();
