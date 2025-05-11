import { CommanderError } from 'commander';

type OptionSubValue = [key: string, value: Record<string, string[]>];

/**
 * Parse the following options syntax:
 * ```
 * --create-api-client-fn createAPIClient filename:create-api-client services:all callbacks:all
 * --create-api-client-fn createUsersAPIClient services:users,profile callbacks:setQueryData,getQueryData,fetchQuery
 * ```
 */
export function parseOptionSubValues<T extends Array<OptionSubValue>>(
  value: string,
  previous: undefined | NoInfer<T>
): T {
  const [subOptionName, subOptionValue] = value.split(':');

  if (typeof subOptionValue !== 'undefined') {
    const subOptionParsedValue = {
      [subOptionName]: subOptionValue
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const lastSubOptionItem = previous?.at(-1);

    if (lastSubOptionItem) {
      Object.assign(lastSubOptionItem[1], subOptionParsedValue);

      return previous as T;
    } else {
      throw new CommanderError(
        1,
        'ERR_INVALID_SUB_OPTION_VALUE',
        `Invalid sub-option value: ${value}`
      );
    }
  }

  const entry = [subOptionName, {}] as T[number];

  return (previous ? [...previous, entry] : [entry]) as T;
}
