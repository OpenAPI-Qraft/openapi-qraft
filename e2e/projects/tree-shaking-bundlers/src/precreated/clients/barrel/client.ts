import { createBarrelPrecreatedAPIClient } from '../../../generated-api/create-barrel-precreated-api-client';
import { createBarrelClientOptions } from '../../../precreated/options/barrel';

export const BarrelClient = createBarrelPrecreatedAPIClient(
  createBarrelClientOptions()
);
