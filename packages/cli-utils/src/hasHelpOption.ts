/**
 * Checks if the argv array contains help option flags (--help or -h).
 */
export function hasHelpOption(argv: string[]): boolean {
  return argv.includes('--help') || argv.includes('-h');
}
