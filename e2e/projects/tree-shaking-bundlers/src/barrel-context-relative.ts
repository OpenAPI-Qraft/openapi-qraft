import { createBarrelAPIClient } from './generated-api';

const api = createBarrelAPIClient();

export const result = api.pets.getPets.useQuery();
