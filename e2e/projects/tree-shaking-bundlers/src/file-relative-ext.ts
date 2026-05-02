import { createRelativeExtAPIClient } from './generated-api/create-relative-ts-api-client.ts';

const api = createRelativeExtAPIClient();

export const result = api.pets.createPet.useMutation();
