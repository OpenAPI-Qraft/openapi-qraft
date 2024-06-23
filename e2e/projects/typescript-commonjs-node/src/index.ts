import { createAPIClient as createAPIClientMjs } from './api';
import { createAPIClient } from './commonjs-client.cjs';

if (createAPIClient) {
  console.log('Client is imported successfully from commonjs project.');
} else {
  console.error('Client is not imported from commonjs project.');
  process.exit(1);
}

if (typeof createAPIClientMjs !== 'undefined') {
  console.log('Client is imported successfully from esm project.');
} else {
  console.error('Client is not imported from esm project.');
  process.exit(1);
}
