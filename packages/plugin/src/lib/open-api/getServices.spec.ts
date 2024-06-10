import openAPI from '@openapi-qraft/test-fixtures/openapi.json' assert { type: 'json' };

import { describe, expect, it } from 'vitest';

import { filterDocumentPaths } from '../filterDocumentPaths.js';
import { getServices } from './getServices.js';

describe('getServices', () => {
  it('matches snapshot with default options', () => {
    expect(getServices(openAPI)).toMatchSnapshot();
  });

  it('matches snapshot with custom `postfixServices`', () => {
    expect(getServices(openAPI, { postfixServices: 'Srv' })).toMatchSnapshot();
  });

  it('matches snapshot with custom `servicesGlob`', () => {
    expect(
      // @ts-expect-error - JSON OpenAPI schema does not match to OpenAPI3
      getServices(filterDocumentPaths(openAPI, ['/files/**']), {
        serviceNameBase: 'endpoint[0]',
        postfixServices: 'Service',
      })
    ).toMatchSnapshot();
  });

  it('matches snapshot with "serviceNameBase: endpoint"', () => {
    expect(
      getServices(openAPI, { serviceNameBase: 'endpoint[0]' })
    ).toMatchSnapshot();
  });

  it('matches snapshot with "serviceNameBase: tags"', () => {
    expect(getServices(openAPI, { serviceNameBase: 'tags' })).toMatchSnapshot();
  });
});
