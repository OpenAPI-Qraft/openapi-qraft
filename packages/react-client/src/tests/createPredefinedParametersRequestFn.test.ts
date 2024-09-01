import { requestFn } from '@openapi-qraft/react';
import { createPredefinedParametersRequestFn } from './fixtures/api/create-predefined-parameters-request-fn.js';

describe('createPredefinedParametersRequestFn(...)', () => {
  it('no emits type error', () => {
    createPredefinedParametersRequestFn(
      [
        {
          requestPattern: 'post /entities/{entity_id}/documents',
          parameters: [
            { name: 'x-monite-version', in: 'header', value: '2023-06-04' },
          ],
        },
        {
          requestPattern:
            'get,delete,patch /approval_policies/{approval_policy_id}/**',
          parameters: [
            {
              name: 'x-monite-entity-id',
              in: 'header',
              value: () => Promise.resolve('custom-entity-id'),
            },
          ],
        },
      ],
      requestFn
    );
  });

  it('emits type error', () => {
    createPredefinedParametersRequestFn(
      [
        {
          requestPattern: 'post /entities/{entity_id}/documents',
          parameters: [
            {
              // @ts-expect-error - wrong name
              name: 'x-monite-version!!',
              in: 'header',
              // @ts-expect-error - wrong value type
              value: 111,
            },
          ],
        },
        {
          requestPattern:
            'get,delete,patch /approval_policies/{approval_policy_id}/**',
          parameters: [
            {
              name: 'x-monite-entity-id',
              // @ts-expect-error - wrong in usage
              in: 'query',
              // @ts-expect-error - wrong value type
              value: () => Promise.resolve(999),
            },
          ],
        },
      ],
      requestFn
    );
  });
});
