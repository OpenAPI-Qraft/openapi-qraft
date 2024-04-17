import c from 'ansi-colors';
import fs from 'node:fs';
import { Ora } from 'ora';

import { GeneratorFiles } from '../generators/tanstack-query-react/generateCode.js';

export const writeGeneratorFiles = async ({
  spinner,
  fileItems,
}: {
  spinner: Ora;
  fileItems: GeneratorFiles;
}) => {
  await setupDirectories(spinner, fileItems);
  await writeFiles(spinner, fileItems);
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

const writeFiles = async (spinner: Ora, fileItems: GeneratorFiles) => {
  for (const fileItem of fileItems) {
    if ('directory' in fileItem) continue;

    const { file, code } = fileItem;

    spinner.text = `Writing ${c.magenta(file.pathname)}`;

    try {
      await fs.promises.writeFile(file, code, {
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
