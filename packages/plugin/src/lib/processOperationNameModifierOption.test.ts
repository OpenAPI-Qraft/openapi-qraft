import openAPI from '@openapi-qraft/test-fixtures/openapi.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';
import { getServices } from './open-api/getServices.js';
import {
  parseOperationNameModifier,
  processOperationNameModifierOption,
} from './processOperationNameModifierOption.js';

describe('# processOperationNameModifierOption', () => {
  describe('parseOperationNameModifier(...)', () => {
    it('parses operation name modifier without method', () => {
      expect(
        parseOperationNameModifier(
          '/foo,/bar/**:post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+ ==> createOne'
        )
      ).toEqual([
        {
          methods: undefined,
          operationNameModifierRegex: 'post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+',
          operationNameModifierReplace: 'createOne',
          pathGlobs: '/foo,/bar/**',
        },
      ]);
    });

    it('parses operation name modifier with specified methods', () => {
      expect(
        parseOperationNameModifier(
          'post,get /foo,/bar/**:post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+ ==> createOne'
        )
      ).toEqual([
        {
          methods: ['get', 'post'],
          operationNameModifierRegex: 'post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+',
          operationNameModifierReplace: 'createOne',
          pathGlobs: '/foo,/bar/**',
        },
      ]);
    });

    it('parses operation name modifier with trailing spaces anywhere', () => {
      expect(
        parseOperationNameModifier(
          ' /foo,/bar/**  : post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+   ==>   createOne '
        )
      ).toEqual([
        {
          methods: undefined,
          operationNameModifierRegex: 'post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+',
          operationNameModifierReplace: 'createOne',
          pathGlobs: '/foo,/bar/**',
        },
      ]);

      expect(
        parseOperationNameModifier(
          '  get ,  , post /foo   ,  /bar/**  : post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+   ==>   createOne '
        )
      ).toEqual([
        {
          methods: ['get', 'post'],
          operationNameModifierRegex: 'post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+',
          operationNameModifierReplace: 'createOne',
          pathGlobs: '/foo,/bar/**',
        },
      ]);
    });
  });

  describe('processOperationNameModifierOption(...)', () => {
    it('processes operation name modifier with single modifier', () => {
      const { services, errors } = processOperationNameModifierOption(
        parseOperationNameModifier(
          '/entities/{entity_id}/documents:post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+ ==> createOne'
        ),
        getServices(openAPI)
      );

      expect(errors).toEqual([]);
      expect(
        services
          .find(({ name }) => name === 'entities')
          ?.operations.map(({ name }) => ({ name }))
      ).toMatchInlineSnapshot(`
        [
          {
            "name": "createOne",
          },
        ]
      `);
    });

    it('processes operation name modifier with regex capture group', () => {
      const { errors, services } = processOperationNameModifierOption(
        parseOperationNameModifier(
          '/entities/{entity_id}/documents:post([A-Z][A-Za-z]+sId[A-Z][A-Za-z]+) ==> $1'
        ),
        getServices(openAPI)
      );

      expect(errors).toEqual([]);
      expect(
        services
          .find(({ name }) => name === 'entities')
          ?.operations.map(({ name }) => ({ name }))
      ).toMatchInlineSnapshot(`
        [
          {
            "name": "entitiesIdDocuments",
          },
        ]
      `);
    });

    it('generates errors for multiple modifiers for the same operation', () => {
      const { errors } = processOperationNameModifierOption(
        parseOperationNameModifier(
          '/entities/{entity_id}/documents:post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+ ==> createOne',
          '/**:post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+ ==> createSingle'
        ),
        getServices(openAPI)
      );

      expect(errors).toMatchInlineSnapshot(`
        [
          {
            "modifiers": [
              {
                "methods": undefined,
                "operationNameModifierRegex": "post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+",
                "operationNameModifierReplace": "createOne",
                "pathGlobs": "/entities/{entity_id}/documents",
              },
              {
                "methods": undefined,
                "operationNameModifierRegex": "post[A-Z][A-Za-z]+sId[A-Z][A-Za-z]+",
                "operationNameModifierReplace": "createSingle",
                "pathGlobs": "/**",
              },
            ],
            "originalOperationName": "postEntitiesIdDocuments",
            "replacedOperationName": "createOne",
            "serviceName": "entities",
          },
        ]
      `);
    });

    it('generates errors for modifiers with overlapping patterns', () => {
      const { errors } = processOperationNameModifierOption(
        parseOperationNameModifier(
          '/approval_policies/{approval_policy_id}:delete[A-Za-z]+sId ==> deleteOne',
          '/approval_policies/{approval_policy_id}:get[A-Za-z]+Id ==> deleteOne'
        ),
        getServices(openAPI)
      );

      expect(errors).toMatchInlineSnapshot(`
        [
          {
            "modifiers": [
              {
                "methods": undefined,
                "operationNameModifierRegex": "get[A-Za-z]+Id",
                "operationNameModifierReplace": "deleteOne",
                "pathGlobs": "/approval_policies/{approval_policy_id}",
              },
            ],
            "originalOperationName": "getApprovalPoliciesId",
            "replacedOperationName": "deleteOne",
            "serviceName": "approvalPolicies",
          },
          {
            "modifiers": [
              {
                "methods": undefined,
                "operationNameModifierRegex": "delete[A-Za-z]+sId",
                "operationNameModifierReplace": "deleteOne",
                "pathGlobs": "/approval_policies/{approval_policy_id}",
              },
            ],
            "originalOperationName": "deleteApprovalPoliciesId",
            "replacedOperationName": "deleteOne",
            "serviceName": "approvalPolicies",
          },
        ]
      `);
    });

    it('processes operation name modifier with multiple modifiers', () => {
      const { services, errors } = processOperationNameModifierOption(
        parseOperationNameModifier(
          '/approval_policies/{approval_policy_id}:delete[A-Za-z]+sId ==> deleteOne',
          '/approval_policies/{approval_policy_id}:get[A-Za-z]+Id ==> findOne'
        ),
        getServices(openAPI)
      );

      expect(errors).toEqual([]);
      expect(
        services
          .find(({ name }) => name === 'approvalPolicies')
          ?.operations.map(({ name }) => ({ name }))
      ).toMatchInlineSnapshot(`
        [
          {
            "name": "findOne",
          },
          {
            "name": "deleteOne",
          },
          {
            "name": "patchApprovalPoliciesId",
          },
        ]
      `);
    });

    it('not processes services if no modifiers', () => {
      const sourceServices = Object.freeze(getServices(openAPI));

      const { services: processedServices, errors } =
        processOperationNameModifierOption([], getServices(openAPI));

      expect(errors).toEqual([]);
      expect(processedServices).toEqual(sourceServices);
    });
  });
});
