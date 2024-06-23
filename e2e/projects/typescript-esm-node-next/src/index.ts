import { esmClient } from './esm-client.mjs';

if (esmClient) {
  console.log('Client is imported successfully from esm project.');
} else {
  console.error('Client is not imported from esm project.');
  process.exit(1);
}
