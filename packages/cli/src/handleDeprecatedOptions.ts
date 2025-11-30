import c from 'ansi-colors';

const deprecatedOptionsMap: Record<string, { replacement: string }> = {
  '-rm': { replacement: '-c' },
};

export function handleDeprecatedOptions(argv: string[]): string[] {
  return argv.map((arg) => {
    const deprecated = deprecatedOptionsMap[arg];
    if (deprecated) {
      console.warn(
        c.yellow(
          `⚠ Option '${arg}' is deprecated and will be removed in v3.0. Please use '${deprecated.replacement}' instead.`
        )
      );
      return deprecated.replacement;
    }
    return arg;
  });
}
