import { requestFn } from '@openapi-qraft/react';
import { vi } from 'vitest';
import { qraftPredefinedParametersRequestFn } from '../qraftPredefinedParametersRequestFn.js';
import { services } from './fixtures/api/index.js';

describe('qraftPredefinedParametersRequestFn(...)', () => {
  it('predefine parameters if method specified', async () => {
    const requestFnMock = vi.fn(requestFn);

    const predefinedRequestFn = qraftPredefinedParametersRequestFn(
      [
        {
          requestPattern: '/**',
          parameters: [
            {
              in: 'header',
              name: 'x-monite-version',
              value: () => Promise.resolve('1.0.0'),
            },
          ],
        },
      ],
      [
        {
          requestPattern: '/**',
          methods: ['patch'],
          paths: ['/approval_policies/{approval_policy_id}'],
        },
      ],
      requestFnMock
    );

    await predefinedRequestFn(
      services.approvalPolicies.patchApprovalPoliciesId.schema,
      {}
    ).catch(() => {});

    await predefinedRequestFn(
      services.approvalPolicies.getApprovalPoliciesId.schema,
      {}
    ).catch(() => {});

    await predefinedRequestFn(
      services.entities.postEntitiesIdDocuments.schema,
      {}
    ).catch(() => {});

    expect(requestFnMock.mock.calls).toEqual([
      [
        services.approvalPolicies.patchApprovalPoliciesId.schema,
        {
          parameters: {
            header: {
              'x-monite-version': '1.0.0',
            },
          },
        },
        undefined,
      ],
      [services.approvalPolicies.getApprovalPoliciesId.schema, {}, undefined],
      [services.entities.postEntitiesIdDocuments.schema, {}, undefined],
    ]);
  });

  it('predefine multiple parameters', async () => {
    const requestFnMock = vi.fn(requestFn);

    const predefinedRequestFn = qraftPredefinedParametersRequestFn(
      [
        {
          requestPattern: '/**',
          parameters: [
            {
              in: 'header',
              name: 'x-monite-version',
              value: '1.0.0',
            },
          ],
        },
        {
          requestPattern: '/foo/**',
          parameters: [
            {
              in: 'header',
              name: 'x-entity-id',
              value: () => Promise.resolve('custom-entity-id'),
            },
          ],
        },
      ],
      [
        {
          requestPattern: '/**',
          methods: ['patch'],
          paths: ['/approval_policies/{approval_policy_id}'],
        },
        {
          requestPattern: '/foo/**',
          methods: ['patch'],
          paths: ['/approval_policies/{approval_policy_id}'],
        },
      ],
      requestFnMock
    );

    await predefinedRequestFn(
      services.approvalPolicies.patchApprovalPoliciesId.schema,
      {}
    ).catch(() => {});

    expect(requestFnMock.mock.calls).toEqual([
      [
        services.approvalPolicies.patchApprovalPoliciesId.schema,
        {
          parameters: {
            header: {
              'x-entity-id': 'custom-entity-id',
              'x-monite-version': '1.0.0',
            },
          },
        },
        undefined,
      ],
    ]);
  });

  it('skips not matched globs', async () => {
    const requestFnMock = vi.fn(requestFn);

    const predefinedRequestFn = qraftPredefinedParametersRequestFn(
      [
        {
          requestPattern: '/foo/bar',
          parameters: [
            {
              in: 'header',
              name: 'x-monite-version',
              value: '1.0.0',
            },
          ],
        },
      ],
      [
        {
          requestPattern: '/**',
          methods: ['patch'],
          paths: ['/approval_policies/{approval_policy_id}'],
        },
      ],
      requestFnMock
    );

    await predefinedRequestFn(
      services.approvalPolicies.patchApprovalPoliciesId.schema,
      {}
    ).catch(() => {});

    expect(requestFnMock.mock.calls).toEqual([
      [services.approvalPolicies.patchApprovalPoliciesId.schema, {}, undefined],
    ]);
  });

  it('predefine parameters for globs and methods', async () => {
    const requestFnMock = vi.fn(requestFn);

    const predefinedRequestFn = qraftPredefinedParametersRequestFn(
      [
        {
          requestPattern: '/**',
          parameters: [
            {
              in: 'header',
              name: 'x-monite-version',
              value: '1.0.0',
            },
          ],
        },
        {
          requestPattern: '/entities/**',
          parameters: [
            {
              in: 'header',
              name: 'x-api-version',
              value: 'c.1.b',
            },
            {
              in: 'header',
              name: 'x-entity-id',
              value: 'custom-entity-id',
            },
          ],
        },
      ],
      [
        {
          requestPattern: '/**',
          methods: ['patch', 'post'],
          paths: [
            '/approval_policies/{approval_policy_id}',
            '/entities/{entity_id}/documents',
          ],
        },
        {
          requestPattern: '/entities/**',
          methods: ['get', 'post'],
          paths: ['/entities/{entity_id}/documents'],
        },
      ],
      requestFnMock
    );

    await predefinedRequestFn(
      services.approvalPolicies.patchApprovalPoliciesId.schema,
      {}
    ).catch(() => {});

    await predefinedRequestFn(
      services.approvalPolicies.getApprovalPoliciesId.schema,
      {}
    ).catch(() => {});

    await predefinedRequestFn(
      services.entities.postEntitiesIdDocuments.schema,
      {}
    ).catch(() => {});

    expect(requestFnMock.mock.calls).toEqual([
      [
        services.approvalPolicies.patchApprovalPoliciesId.schema,
        {
          parameters: {
            header: {
              'x-monite-version': '1.0.0',
            },
          },
        },
        undefined,
      ],
      [services.approvalPolicies.getApprovalPoliciesId.schema, {}, undefined],
      [
        services.entities.postEntitiesIdDocuments.schema,
        {
          parameters: {
            header: {
              'x-monite-version': '1.0.0',
              'x-api-version': 'c.1.b',
              'x-entity-id': 'custom-entity-id',
            },
          },
        },
        undefined,
      ],
    ]);
  });
});
