export function createClientNameRegex(clientNamePattern: string | undefined) {
  clientNamePattern = clientNamePattern?.trim();

  if (clientNamePattern) {
    // Check if pattern is in regex format: /pattern/flags
    const regexMatch = clientNamePattern.match(/^\/(.*)\/([gimuy]*)$/);

    if (regexMatch) {
      const regexPattern = regexMatch[1].trim();
      const flags = regexMatch[2];

      // Validate that regex pattern is not empty or whitespace-only
      if (regexPattern === '') {
        throw new Error(
          'clientNamePattern cannot be empty or contain only whitespace'
        );
      }

      return new RegExp(regexPattern, flags);
    }

    // Fallback to treating as plain string pattern
    return new RegExp(clientNamePattern);
  } else if (clientNamePattern === '') {
    throw new Error(
      'clientNamePattern cannot be empty or contain only whitespace'
    );
  }

  // Default if no pattern provided
  return /qraft|api/i;
}
