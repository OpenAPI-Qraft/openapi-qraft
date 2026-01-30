import { shouldQuoteCommandLineArg } from './shouldQuoteCommandLineArg.js';

export function maybeEscapeShellArg(arg: string): string {
  if (shouldQuoteCommandLineArg(arg)) {
    // bash-safe single-quote escaping
    return `'${arg.replace(/'/g, `'\\''`)}'`;
  }

  return arg;
}
