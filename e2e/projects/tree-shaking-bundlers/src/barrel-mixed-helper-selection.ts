import { createBarrelAPIClient } from './generated-api';
import { createNodeAPIClient } from './generated-api/create-node-api-client';

const contextApi = createBarrelAPIClient();
const nodeApiUtility = createNodeAPIClient();

export const result = [
  contextApi.pets.getPets.useQuery(),
  nodeApiUtility.pets.getPets.getQueryKey(),
];
