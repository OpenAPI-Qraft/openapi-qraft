import c from 'ansi-colors';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import { URL } from 'node:url';
import { OpenAPI3 } from 'openapi-typescript';
import ora, { Ora } from 'ora';

import {
  getServices,
  Service,
  ServiceBaseName,
} from './lib/open-api/getServices.js';
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
  dir: URL;
  clean: boolean;
  postfixServices?: string;
  explicitImportExtensions?: boolean;
  servicesDirName: string;
  serviceNameBase?: ServiceBaseName;
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

  const spinner = ora('Starting generation').start();

  const fileItems = await generateCode({
    spinner,
    services,
    serviceImports,
    output,
  });

  await setupDirectories(spinner, fileItems);
  await writeFiles(spinner, fileItems, output);

  spinner.succeed(c.green('Services has been generated'));
};

const setupDirectories = async (spinner: Ora, fileItems: GeneratorFiles) => {
  for (const fileItem of fileItems) {
    if (!('directory' in fileItem)) continue;

    if (fileItem.clean) {
      spinner.text = `Cleaning ${c.magenta(fileItem.directory.pathname)}`;

      try {
        await fs.promises.rm(fileItem.directory, {
          recursive: true,
          force: true,
        });
      } catch (error) {
        spinner.fail(
          c.redBright(
            `Error occurred during ${c.magenta(
              fileItem.directory.pathname
            )} directory cleaning`
          )
        );

        throw error;
      }
    }

    try {
      spinner.text = `Creating directory ${c.magenta(fileItem.directory.pathname)}`;

      await fs.promises.mkdir(fileItem.directory, { recursive: true });
    } catch (error) {
      spinner.fail(
        c.redBright(
          `Error occurred during ${c.magenta(
            fileItem.directory.pathname
          )} directory creation`
        )
      );

      throw error;
    }
  }
};

const writeFiles = async (
  spinner: Ora,
  fileItems: GeneratorFiles,
  output: Pick<OutputOptions, 'fileHeader'>
) => {
  for (const fileItem of fileItems) {
    if ('directory' in fileItem) continue;

    const { file, code } = fileItem;

    spinner.text = `Writing ${c.magenta(file.pathname)}`;

    try {
      await fs.promises.writeFile(file, getFileHeader(output) + code, {
        encoding: 'utf-8',
      });
    } catch (error) {
      spinner.fail(
        c.redBright(
          `Error occurred during ${c.magenta(file.pathname)} file writing`
        )
      );

      throw error;
    }
  }
};

const generateCode = async ({
  spinner,
  services,
  serviceImports,
  output,
}: {
  spinner: Ora;
  services: Service[];
  serviceImports: ServiceImportsFactoryOptions;
  output: OutputOptions;
}) => {
  return [
    ...(await generateServices(spinner, services, serviceImports, output)),
    ...(await generateServiceIndex(spinner, services, output)),
    ...(await generateClient(spinner, output)),
    ...(await generateIndex(spinner, output)),
  ];
};

type GeneratorFiles = Array<
  { file: URL; code: string } | { directory: URL; clean: boolean }
>;

const composeServicesDirPath = (
  output: Pick<OutputOptions, 'servicesDirName' | 'dir'>
) => {
  return new URL(`${output.servicesDirName}/`, output.dir);
};

const generateServices = async (
  spinner: Ora,
  services: Service[],
  serviceImports: ServiceImportsFactoryOptions,
  output: OutputOptions
) => {
  const servicesDir = composeServicesDirPath(output);

  spinner.start('Generating services');

  const serviceFiles: GeneratorFiles = [
    {
      directory: servicesDir,
      clean: output.clean,
    },
  ];

  for (const service of services) {
    const { operations, name, typeName, variableName, fileBaseName } = service;

    spinner.text = `Generating ${c.magenta(name)} service`;

    try {
      const code = astToString(
        getServiceFactory(
          {
            typeName,
            variableName,
          },
          operations,
          serviceImports
        )
      );

      serviceFiles.push({
        file: new URL(`${fileBaseName}.ts`, servicesDir),
        code,
      });
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

  return serviceFiles;
};

const generateServiceIndex = async (
  spinner: Ora,
  services: Service[],
  output: OutputOptions
) => {
  spinner.start('Generating services index');

  const serviceIndexFiles: GeneratorFiles = [
    {
      directory: composeServicesDirPath(output),
      clean: output.clean,
    },
  ];

  try {
    const code = astToString(
      getServiceIndexFactory(services, {
        explicitImportExtensions: Boolean(output.explicitImportExtensions),
      })
    );

    serviceIndexFiles.push({
      file: new URL('index.ts', composeServicesDirPath(output)),
      code,
    });
  } catch (error) {
    spinner.fail(
      c.redBright('Error occurred during services index generation')
    );

    throw error;
  }

  spinner.succeed(c.green('Services index has been generated'));

  return serviceIndexFiles;
};

const generateClient = async (spinner: Ora, output: OutputOptions) => {
  spinner.start('Generating client');

  const clientFiles: GeneratorFiles = [];

  try {
    const code = astToString(
      getClientFactory({
        servicesDirName: output.servicesDirName,
        explicitImportExtensions: Boolean(output.explicitImportExtensions),
      })
    );

    clientFiles.push({
      file: new URL('create-api-client.ts', output.dir),
      code,
    });
  } catch (error) {
    spinner.fail(c.redBright('Error occurred during client generation'));

    throw error;
  }

  spinner.succeed(c.green('Client has been generated'));

  return clientFiles;
};

const generateIndex = async (spinner: Ora, output: OutputOptions) => {
  spinner.start('Generating index');

  const indexFiles: GeneratorFiles = [];

  try {
    const code = astToString(
      getIndexFactory({
        servicesDirName: output.servicesDirName,
        explicitImportExtensions: Boolean(output.explicitImportExtensions),
      })
    );

    indexFiles.push({
      file: new URL('index.ts', output.dir),
      code,
    });
  } catch (error) {
    spinner.fail(c.redBright('Error occurred during index generation'));

    throw error;
  }

  spinner.succeed(c.green('Index has been generated'));

  return indexFiles;
};

const getFileHeader = ({ fileHeader }: Pick<OutputOptions, 'fileHeader'>) => {
  return fileHeader && `${fileHeader}\n`;
};
