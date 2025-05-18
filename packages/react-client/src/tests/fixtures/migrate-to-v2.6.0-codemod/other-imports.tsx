// Import from another package, should not be modified
import { qraftAPIClient } from 'other-library';

// Same identifier but different source
const api = qraftAPIClient<Services, Callbacks>(services, callbacks, options);

// Local function with the same name
function qraftAPIClient<T, K>(a: T, b: K, c: any) {
  return { a, b, c };
}

// Local function call should not be modified
const localApi = qraftAPIClient<number, string>(1, "test", {});

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