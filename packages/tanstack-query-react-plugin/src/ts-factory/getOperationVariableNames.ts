const reservedBindingNames = new Set([
  'arguments',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);

export function getOperationVariableNames(
  operationNames: string[],
  reservedNames: string[]
): Map<string, string> {
  const unavailableNames = new Set([...reservedBindingNames, ...reservedNames]);
  const usedNames = new Set([...operationNames, ...reservedNames]);
  const variableNames = new Map<string, string>();

  for (const name of operationNames) {
    if (!unavailableNames.has(name)) {
      variableNames.set(name, name);
      continue;
    }

    const baseName = `${name}Operation`;
    let variableName = baseName;
    let suffix = 2;

    while (usedNames.has(variableName)) {
      variableName = `${baseName}${suffix++}`;
    }

    usedNames.add(variableName);
    variableNames.set(name, variableName);
  }

  return variableNames;
}
