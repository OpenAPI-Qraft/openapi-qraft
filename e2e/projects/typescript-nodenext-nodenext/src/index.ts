import * as callbacks from '@openapi-qraft/react/callbacks/index';
import { useMutation } from '@openapi-qraft/react/callbacks/useMutation';
import { useQuery } from '@openapi-qraft/react/callbacks/useQuery';
import {
  QraftSecureRequestFn,
  createSecureRequestFn,
} from '@openapi-qraft/react/Unstable_QraftSecureRequestFn';

import { createAPIClient as createAPIClientMjs } from './api/index.js';

if (typeof createAPIClientMjs !== 'undefined') {
  console.log('Client is imported successfully from esm project.');
} else {
  console.error('Client is not imported from esm project.');
  process.exit(1);
}

if (typeof callbacks !== 'undefined') {
  console.log('Callbacks are imported successfully from esm project.');
} else {
  console.error('Callbacks are not imported from esm project.');
  process.exit(1);
}

if (typeof useMutation !== 'undefined') {
  console.log('useMutation is imported successfully from esm project.');
} else {
  console.error('useMutation is not imported from esm project.');
  process.exit(1);
}

if (typeof useQuery !== 'undefined') {
  console.log('useQuery is imported successfully from esm project.');
} else {
  console.error('useQuery is not imported from esm project.');
  process.exit(1);
}

if (typeof createSecureRequestFn !== 'undefined') {
  console.log(
    'createSecureRequestFn is imported successfully from esm project.'
  );
} else {
  console.error('createSecureRequestFn is not imported from esm project.');
  process.exit(1);
}

if (typeof QraftSecureRequestFn !== 'undefined') {
  console.log(
    'QraftSecureRequestFn is imported successfully from esm project.'
  );
} else {
  console.error('QraftSecureRequestFn is not imported from esm project.');
  process.exit(1);
}
