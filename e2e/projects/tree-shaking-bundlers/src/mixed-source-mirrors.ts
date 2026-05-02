import { createBarrelAPIClient as createBarrelFromRelativeAPIClient } from './generated-api';
import { createBarrelAPIClient as createBarrelFromAliasAPIClient } from '@/generated-api';
import { createRelativeAPIClient as createRelativeFromRelativeAPIClient } from './generated-api/create-relative-api-client';
import { createRelativeAPIClient as createRelativeFromAliasAPIClient } from '@/generated-api/create-relative-api-client';
import { createRelativeExtAPIClient as createRelativeExtFromRelativeAPIClient } from './generated-api/create-relative-ts-api-client.ts';
import { createRelativeExtAPIClient as createRelativeExtFromAliasAPIClient } from '@/generated-api/create-relative-ts-api-client.js';
import { createAliasAPIClient as createAliasFromRelativeAPIClient } from './generated-api';
import { createAliasAPIClient as createAliasFromAliasAPIClient } from '@/generated-api';
import { createAliasDirectAPIClient as createAliasDirectFromRelativeAPIClient } from './generated-api/create-alias-direct-api-client';
import { createAliasDirectAPIClient as createAliasDirectFromAliasAPIClient } from '@/generated-api/create-alias-direct-api-client';

const barrelFromRelativeApi = createBarrelFromRelativeAPIClient();
const barrelFromAliasApi = createBarrelFromAliasAPIClient();
const relativeFromRelativeApi = createRelativeFromRelativeAPIClient();
const relativeFromAliasApi = createRelativeFromAliasAPIClient();
const relativeExtFromRelativeApi = createRelativeExtFromRelativeAPIClient();
const relativeExtFromAliasApi = createRelativeExtFromAliasAPIClient();
const aliasFromRelativeApi = createAliasFromRelativeAPIClient();
const aliasFromAliasApi = createAliasFromAliasAPIClient();
const aliasDirectFromRelativeApi = createAliasDirectFromRelativeAPIClient();
const aliasDirectFromAliasApi = createAliasDirectFromAliasAPIClient();

export const result = [
  barrelFromRelativeApi.pets.getPets.useQuery(),
  barrelFromAliasApi.pets.getPets.useQuery(),
  relativeFromRelativeApi.pets.createPet.useMutation(),
  relativeFromAliasApi.pets.createPet.useMutation(),
  relativeExtFromRelativeApi.pets.createPet.useMutation(),
  relativeExtFromAliasApi.pets.createPet.useMutation(),
  aliasFromRelativeApi.stores.getStores.useQuery(),
  aliasFromAliasApi.stores.getStores.useQuery(),
  aliasDirectFromRelativeApi.stores.getStores.useQuery(),
  aliasDirectFromAliasApi.stores.getStores.useQuery(),
];
