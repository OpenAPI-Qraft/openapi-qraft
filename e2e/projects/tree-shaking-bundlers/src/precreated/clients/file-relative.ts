import { createRelativePrecreatedAPIClient } from '../../generated-api/create-relative-precreated-api-client';
import { buildRelativeClientOptions } from '../options/barrel/create-relative-client-options';

export const RelativeClient = createRelativePrecreatedAPIClient(
  buildRelativeClientOptions()
);
