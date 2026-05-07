import { createRelativeAPIClient } from './generated-api/create-relative-api-client';

const api = createRelativeAPIClient();

export const result = api.pets.createPet.useMutation();
