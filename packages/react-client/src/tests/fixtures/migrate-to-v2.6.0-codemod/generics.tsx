import { qraftAPIClient } from '@openapi-qraft/react-client';

const services: Services = {
  service1: {
    operation1: {
      schema: {},
    },
  },
};

const callbacks: Callbacks = {
  operation1: () => {},
};

const options = {
  requestFn: () => Promise.resolve({}),
  baseUrl: 'https://api.example.com',
  queryClient: {},
};

const requestFn = () => Promise.resolve({});
const baseUrl = 'https://api.example.com';
const queryClient = {};

const api = qraftAPIClient<Services, Callbacks>(services, callbacks, options);

const api2 = qraftAPIClient<Services, Callbacks>(services, callbacks, {
  requestFn,
  baseUrl,
  queryClient,
});

const api3 = qraftAPIClient<Services, Callbacks>(services, callbacks, {
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
