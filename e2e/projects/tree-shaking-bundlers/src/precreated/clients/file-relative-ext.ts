import { createRelativeExtPrecreatedAPIClient } from '../../generated-api/create-relative-ts-precreated-api-client.ts';
import { createRelativeExtClientOptions } from '../../precreated/options/direct';

export const RelativeExtClient = createRelativeExtPrecreatedAPIClient(
  createRelativeExtClientOptions()
);
