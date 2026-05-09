import {
  createAliasAPIClient as createAliasFromAliasAPIClient,
  createBarrelAPIClient as createBarrelFromAliasAPIClient,
} from '@/generated-api';
import { createAliasDirectAPIClient as createAliasDirectFromAliasAPIClient } from '@/generated-api/create-alias-direct-api-client';
import { createRelativeAPIClient as createRelativeFromAliasAPIClient } from '@/generated-api/create-relative-api-client';
import { createRelativeExtAPIClient as createRelativeExtFromAliasAPIClient } from '@/generated-api/create-relative-ts-api-client.js';
import { BarrelClient as barrelPrecreatedFromAliasApi } from '@/precreated/clients/barrel';
import { AliasDirectClient as fileAliasPrecreatedApi } from '@/precreated/clients/file-alias';
import {
  createAliasAPIClient as createAliasFromRelativeAPIClient,
  createBarrelAPIClient as createBarrelFromRelativeAPIClient,
} from './generated-api';
import { createAliasDirectAPIClient as createAliasDirectFromRelativeAPIClient } from './generated-api/create-alias-direct-api-client';
import { createRelativeAPIClient as createRelativeFromRelativeAPIClient } from './generated-api/create-relative-api-client';
import { createRelativeExtAPIClient as createRelativeExtFromRelativeAPIClient } from './generated-api/create-relative-ts-api-client.ts';
import { BarrelClient as barrelPrecreatedFromRelativeApi } from './precreated/clients/barrel';
import { RelativeClient as fileRelativePrecreatedApi } from './precreated/clients/file-relative';
import { RelativeExtClient as fileRelativeExtPrecreatedApi } from './precreated/clients/file-relative-ext.ts';

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
  barrelFromRelativeApi.pets.getPets.schema,
  barrelFromAliasApi.pets.getPets.useQuery(),
  barrelFromAliasApi.pets.getPets.schema,
  relativeFromRelativeApi.pets.createPet.useMutation(),
  relativeFromRelativeApi.pets.createPet.schema,
  relativeFromAliasApi.pets.createPet.useMutation(),
  relativeFromAliasApi.pets.createPet.schema,
  relativeExtFromRelativeApi.pets.createPet.useMutation(),
  relativeExtFromRelativeApi.pets.createPet.schema,
  relativeExtFromAliasApi.pets.createPet.useMutation(),
  relativeExtFromAliasApi.pets.createPet.schema,
  aliasFromRelativeApi.stores.getStores.useQuery(),
  aliasFromRelativeApi.stores.getStores.schema,
  aliasFromAliasApi.stores.getStores.useQuery(),
  aliasFromAliasApi.stores.getStores.schema,
  aliasDirectFromRelativeApi.stores.getStores.useQuery(),
  aliasDirectFromRelativeApi.stores.getStores.schema,
  aliasDirectFromAliasApi.stores.getStores.useQuery(),
  aliasDirectFromAliasApi.stores.getStores.schema,
  barrelPrecreatedFromRelativeApi.pets.getPets.useQuery(),
  barrelPrecreatedFromRelativeApi.pets.getPets.schema,
  barrelPrecreatedFromAliasApi.stores.getStores.useQuery(),
  barrelPrecreatedFromAliasApi.stores.getStores.schema,
  fileRelativePrecreatedApi.pets.createPet.useMutation(),
  fileRelativePrecreatedApi.pets.createPet.schema,
  fileAliasPrecreatedApi.stores.getStores.useQuery(),
  fileAliasPrecreatedApi.stores.getStores.schema,
  fileRelativeExtPrecreatedApi.pets.createPet.useMutation(),
  fileRelativeExtPrecreatedApi.pets.createPet.schema,
];
