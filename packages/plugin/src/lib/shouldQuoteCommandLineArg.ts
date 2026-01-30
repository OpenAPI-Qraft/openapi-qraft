/**
 * Checks if a command-line argument needs to be quoted when used in a command line.
 *
 * Arguments containing special characters like spaces, quotes, or shell metacharacters
 * need to be wrapped in quotes to be properly interpreted by the shell.
 *
 * @param arg The command-line argument to check
 * @returns True if the argument needs quotes, false otherwise
 */
export function shouldQuoteCommandLineArg(arg: string): boolean {
  if (!arg) return false;

  // Check for spaces
  if (arg.includes(' ')) return true;

  // Check for quotes
  if (arg.includes('"') || arg.includes("'")) return true;

  // Check for shell metacharacters and special characters
  const shellSpecialChars = /[&|<>(){}[\]$;!*?~`\n\r\t#]/;
  if (shellSpecialChars.test(arg)) return true;

  // Check for control characters
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(arg)) return true;

  // Check if argument starts with a dash (to avoid confusion with options)
  if (arg.startsWith('-') && !arg.startsWith('--')) return true;

  // Check for wildcards
  return arg.includes('*') || arg.includes('?');
}
