import type { ParseOptions } from 'commander';
import { runOpenAPI } from './runOpenAPI.js';

export async function qraftOpenapi(
  processArgv: string[],
  processArgvParseOptions?: ParseOptions
) {
  const { RedoclyConfigCommand } =
    await import('@qraft/plugin/lib/RedoclyConfigCommand');

  const redoclyConfigParseResult = await new RedoclyConfigCommand().parseConfig(
    runOpenAPI,
    processArgv,
    processArgvParseOptions
  );

  if (redoclyConfigParseResult?.length) return;

  await runOpenAPI(processArgv, processArgvParseOptions);
}
