import type { API, FileInfo, Options } from 'jscodeshift';

export default function transformer(
  file: FileInfo,
  api: API,
  options: Options
) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Получаем название пакета из опций или используем значение по умолчанию
  const packageName = options.packageName || '@openapi-qraft/react-client';

  // Проверяем, импортирован ли qraftAPIClient из нашего модуля
  const hasQraftImport =
    root
      .find(j.ImportDeclaration, {
        source: {
          type: 'StringLiteral',
          value: packageName,
        },
      })
      .find(j.ImportSpecifier, {
        imported: {
          type: 'Identifier',
          name: 'qraftAPIClient',
        },
      })
      .size() > 0;

  // Если нет импорта из нашего модуля, не делаем никаких изменений
  if (!hasQraftImport) {
    return file.source;
  }

  // Тип TypeParameters отличается в разных парсерах
  // Проверяем оба возможных варианта
  return root
    .find(j.CallExpression, {
      callee: {
        type: 'Identifier',
        name: 'qraftAPIClient',
      },
    })
    .forEach((path) => {
      // Приводим node к типу с возможными свойствами typeParameters/typeArguments
      const node = path.node as unknown as {
        typeParameters?: any;
        typeArguments?: any;
      };

      // Удаляем дженерики, проверяя разные возможные имена свойств
      if (node.typeParameters) {
        delete node.typeParameters;
      }

      if (node.typeArguments) {
        delete node.typeArguments;
      }
    })
    .toSource();
}
