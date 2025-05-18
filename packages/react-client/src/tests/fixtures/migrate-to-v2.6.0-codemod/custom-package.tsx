// Import from custom package (not standard '@openapi-qraft/react-client')
import { qraftAPIClient } from '@custom/package';

// This call should be modified when correct package name is specified in options
const api = qraftAPIClient<Services, Callbacks>(services, callbacks, options);

// Additional call
const api2 = qraftAPIClient<Services, Callbacks>(services, callbacks, {
  requestFn,
  baseUrl,
  queryClient,
});

interface Services {
  service1: {
    operation1: {
      schema: any;
    };
  };
}

interface Callbacks {
  operation1: () => void;
}
