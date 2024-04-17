import { describe, expect, it } from 'vitest';

import openAPI from '../__fixtures__/openapi.json' assert { type: 'json' };
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
      getServices(
        openAPI,
        { serviceNameBase: 'endpoint[0]', postfixServices: 'Service' },
        ['/files/**']
      )
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
