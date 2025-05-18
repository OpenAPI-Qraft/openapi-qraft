// Import from our package
import { qraftAPIClient } from '@openapi-qraft/react-client';
// Import another function with the same name from another package
import { qraftAPIClient as otherClient } from 'other-library';

// This call should be modified (it uses our import)
const api = qraftAPIClient<Services, Callbacks>(services, callbacks, options);

// This call should NOT be modified (it uses another import)
const otherApi = otherClient<OtherServices, OtherCallbacks>(
  otherServices,
  otherCallbacks,
  otherOptions
);

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

interface OtherServices {
  otherService: {
    otherOperation: {
      schema: any;
    };
  };
}

interface OtherCallbacks {
  otherOperation: () => void;
}
