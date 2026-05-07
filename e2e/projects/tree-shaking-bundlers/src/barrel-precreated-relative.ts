import { BarrelClient } from './precreated/clients/barrel';

export const result = BarrelClient.pets.getPets.useQuery();
