import { createAliasDirectPrecreatedAPIClient } from '@/generated-api/create-alias-direct-precreated-api-client';
import { createAliasDirectClientOptions } from '@/precreated/options';

export const AliasDirectClient = createAliasDirectPrecreatedAPIClient(
  createAliasDirectClientOptions()
);
