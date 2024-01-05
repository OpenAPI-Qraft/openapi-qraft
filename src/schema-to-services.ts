import camelCase from 'camelcase';
import fs from 'fs';
import { resolve } from 'path';

import { getServices, ServiceOperation } from './lib/open-api/getServices.js';
import { readSchemaFromFile } from './lib/open-api/readSchemaFromFile.js';
import { astToString } from './lib/ts-factory/astToString.js';
import { getServiceFactory } from './lib/ts-factory/getServiceFactory.js';

const writeServices = async (
  services: Record<string, ServiceOperation[]>,
  outputPath: string
) => {
  await fs.promises.mkdir(outputPath, { recursive: true });

  await Promise.all(
    Object.entries(services).map(([serviceName, operations]) => {
      try {
        return fs.promises.writeFile(
          resolve(outputPath, `${serviceName}.ts`),
          getServiceOutputCode(serviceName, operations)
        );
      } catch (error) {
        console.error(serviceName, error);
      }
    })
  );
};

const getServiceOutputCode = (
  serviceName: string,
  operations: ServiceOperation[]
) => {
  const serviceFactory = getServiceFactory(
    {
      typeName: serviceName,
      variableName: camelCase(serviceName, {
        preserveConsecutiveUppercase: false,
      }),
    },
    operations
  );

  return astToString(serviceFactory);
};

const main = async () => {
  const schema = await readSchemaFromFile('./schema.json');
  const services = getServices(schema);
  await writeServices(services, './tmp/services');
};

main();
