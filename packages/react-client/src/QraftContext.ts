import { createContext } from 'react';

import type { RequestClient } from './RequestClient.js';

export type QraftContextValue =
  | {
      /** The request client to use for making requests. Will be invoked with every request. */
      requestClient: RequestClient;
    }
  | undefined;

export const QraftContext = createContext<QraftContextValue>(undefined);
