import c from 'ansi-colors';
import fs from 'node:fs';
import { resolve } from 'node:path';
import { Readable } from 'node:stream';
import { OpenAPI3 } from 'openapi-typescript';
import ora from 'ora';

import { getServices, Service } from './lib/open-api/getServices.js';
import { readSchema } from './lib/open-api/readSchema.js';
import { astToString } from './lib/ts-factory/astToString.js';
import { getClientFactory } from './lib/ts-factory/getClientFactory.js';
import { getIndexFactory } from './lib/ts-factory/getIndexFactory.js';
import {
  getServiceFactory,
  ServiceImportsFactoryOptions,
} from './lib/ts-factory/getServiceFactory.js';
import { getServiceIndexFactory } from './lib/ts-factory/getServiceIndexFactory.js';

type OutputOptions = {
  fileHeader?: string;
  dir: string;
  clean: boolean;
  postfixServices?: string;
  explicitImportExtensions?: boolean;
  servicesDirName: string;
};

export const writeOpenAPIServices = async ({
  source,
  servicesGlob,
  serviceImports,
  output,
}: {
  source: string | URL | OpenAPI3 | Readable | Buffer;
  servicesGlob: string[] | undefined;
  serviceImports: ServiceImportsFactoryOptions;
  output: OutputOptions;
}) => {
  const schema = await readSchema(source);
  const services = getServices(schema, output, servicesGlob);

  await writeServices(services, serviceImports, output);
  await writeServiceIndex(services, output);
  await writeClient(output, services);
  await writeIndex(output);
};

const writeServices = async (
  services: Service[],
  serviceImports: ServiceImportsFactoryOptions,
  output: OutputOptions
) => {
  const servicesDir = resolve(output.dir, output.servicesDirName);

  if (output.clean)
    await fs.promises.rm(servicesDir, {
      recursive: true,
      force: true,
    });

  await fs.promises.mkdir(servicesDir, { recursive: true });

  const spinner = ora(`Generating services`).start();

  for (const service of services) {
    const { operations, name, typeName, variableName, fileBaseName } = service;

    spinner.text = `Generating ${c.magenta(name)} service`;

    try {
      const code =
        getFileHeader(output) +
        astToString(
          getServiceFactory(
            {
              typeName,
              variableName,
            },
            operations,
            serviceImports
          )
        );

      await fs.promises.writeFile(
        resolve(servicesDir, `${fileBaseName}.ts`),
        code
      );
    } catch (error) {
      spinner.fail(
        c.redBright(
          `Error occurred during ${c.magenta(name)} service generation`
        )
      );

      throw error;
    }
  }

  spinner.succeed(c.green('Services has been generated'));
};

const writeServiceIndex = async (
  services: Service[],
  output: OutputOptions
) => {
  const spinner = ora('Generating services index').start();

  try {
    const code =
      getFileHeader(output) +
      astToString(
        getServiceIndexFactory(services, {
          explicitImportExtensions: Boolean(output.explicitImportExtensions),
        })
      );

    await fs.promises.writeFile(
      resolve(output.dir, output.servicesDirName, 'index.ts'),
      code
    );
  } catch (error) {
    spinner.fail(
      c.redBright('Error occurred during services index generation')
    );

    throw error;
  }

  spinner.succeed(c.green('Services index has been generated'));
};

const writeClient = async (output: OutputOptions, services: Service[]) => {
  const spinner = ora('Generating client').start();

  try {
    const code =
      getFileHeader(output) +
      astToString(
        getClientFactory({
          servicesDirName: output.servicesDirName,
          explicitImportExtensions: Boolean(output.explicitImportExtensions),
          services,
        })
      );

    await fs.promises.writeFile(
      resolve(output.dir, 'create-api-client.ts'),
      code
    );
  } catch (error) {
    spinner.fail(c.redBright('Error occurred during client generation'));

    throw error;
  }

  spinner.succeed(c.green('Client has been generated'));
};

const writeIndex = async (output: OutputOptions) => {
  const spinner = ora('Generating index').start();

  try {
    const code =
      getFileHeader(output) +
      astToString(
        getIndexFactory({
          servicesDirName: output.servicesDirName,
          explicitImportExtensions: Boolean(output.explicitImportExtensions),
        })
      );

    await fs.promises.writeFile(resolve(output.dir, 'index.ts'), code);
  } catch (error) {
    spinner.fail(c.redBright('Error occurred during index generation'));

    throw error;
  }

  spinner.succeed(c.green('Index has been generated'));
};

const getFileHeader = ({ fileHeader }: Pick<OutputOptions, 'fileHeader'>) => {
  return fileHeader && `${fileHeader}\n`;
};
