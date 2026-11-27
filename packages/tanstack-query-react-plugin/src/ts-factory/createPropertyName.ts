import ts from 'typescript';

export function isValidIdentifierName(value: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value);
}

/**
 * Creates a property name node suitable for type signatures and interface members.
 */
export function createPropertyName(name: string): ts.PropertyName {
  return isValidIdentifierName(name)
    ? ts.factory.createIdentifier(name)
    : ts.factory.createStringLiteral(name);
}

/**
 * Creates a property name node safe for object literals, emitting a computed key
 * for `"__proto__"` so it defines an own property instead of mutating the prototype.
 */
export function createObjectLiteralPropertyName(name: string): ts.PropertyName {
  if (name === '__proto__') {
    return ts.factory.createComputedPropertyName(
      ts.factory.createStringLiteral('__proto__')
    );
  }

  return createPropertyName(name);
}
