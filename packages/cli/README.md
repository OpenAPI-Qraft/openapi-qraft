# @openapi-qraft/cli

`@openapi-qraft/cli` is a powerful command-line utility designed to streamline the development process by generating
service declarations and typed React Query interfaces directly from an OpenAPI Schema. With `@openapi-qraft/cli`,
frontend developers can easily generate typed API clients, ensuring type safety and improving development efficiency
within React applications.

## Features

- **Typed React Query Interfaces:** Create typed React Query hooks for seamless and type-safe API requests.
- **Generate Typed Services:** Automatically generate service declarations from an OpenAPI Schema.

## Installation

```bash
npm install -g @openapi-qraft/cli
```

## Usage

```
Usage: openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript [input] [options]

Generate a type-safe TanStack Query client for React from an OpenAPI Document.

Arguments:
  input                                               Input OpenAPI Document file path, URL (json, yml) (default: null)

Options:
  -o, --output-dir <path>                             Output directory for generated services
  -rm, --clean                                        Clean output directory before generating services
  --filter-services <glob-patterns...>                Filter services to be generated using glob patterns. Example: "/user/**,/post/**". For more details, see the NPM `micromatch` package documentation.
  --operation-predefined-parameters <patterns...>     Predefined parameters for services. The specified service parameters will be optional. Example: "/**:header.x-monite-version,query.x-api-key" or
                                                      "get /**:header.x-monite-entity-id"
  --operation-name-modifier <patterns...>             Modifies operation names using a pattern. Use the `==>` operator to separate the regular expression (left) and the substitution string (right). For
                                                      example: "post /**:[A-Za-z]+Id ==> createOne"
  --postfix-services <string>                         Postfix to be added to the generated service name (eg: Service)
  --service-name-base <endpoint[<index>] | tags>      Use OpenAPI Operation `endpoint[<index>]` path part (e.g.: "/0/1/2") or `tags` as the base name of the service. (default: "endpoint[0]")
  --file-header <string>                              Header to be added to the generated file (eg: /* eslint-disable */)
  --redocly [config]                                  Use the Redocly configuration to generate multiple API clients
                                                      If the [config] parameter is not specified, the default Redocly configuration will be used: [redocly.yaml | redocly.yml | .redocly.yaml |
                                                      .redocly.yml].
                                                      For more information about this option, use the command: --redocly-help
                                                      Examples:
                                                      $ bin --redocly
                                                      $ bin my-api --redocly
                                                      $ bin my-api@v1 my-api@v2 --redocly
                                                      $ bin --redocly ./my-redocly-config.yaml
  --openapi-types-import-path <path>                  Path to schema types file (.d.ts), e.g.: "../schema.d.ts"
  --explicit-import-extensions [extension]            All import statements will contain an explicit file extension. Ideal for projects using ECMAScript modules. (choices: ".js", ".ts", preset: ".js")
  --export-openapi-types [bool]                       Add an export statement of the generated OpenAPI document types from the `./index.ts' file. Useful for sharing types within your project. Default:
                                                      true when --plugin openapi-typescript is used. (default: true)
  --queryable-write-operations [bool]                 Enable generation of query hooks (useQuery, useSuspenseQuery, etc.) for writable HTTP methods like POST, PUT, PATCH. By default, only mutation hooks
                                                      are generated for writable operations.
  --create-api-client-fn <functionName> [options...]  Configure API client creation function. Allows specifying the function name, included services, and callbacks. Can be specified multiple times to
                                                      generate several different API client functions from a single OpenAPI document. (default: null)
  --override-import-type <pathname overrides...>      Override import paths for specific types in generated files. This allows using custom type implementations instead of the default ones. Expected
                                                      format: filepath originalModule:importTypeName:customImportPath
  --openapi-types-file-name <path>                    OpenAPI Schema types file name, e.g.: "schema.d.ts" (default: "schema.ts")
  --enum                                              Export true TS enums instead of unions
  --enum-values                                       Export enum values as arrays.
  --dedupe-enums                                      Dedupe enum types when `--enum` is set
  -t, --export-type                                   Export top-level `type` instead of `interface`
  --immutable                                         Generate readonly types
  --additional-properties                             Treat schema objects as if `additionalProperties: true` is set
  --empty-objects-unknown                             Generate `unknown` instead of `Record<string, never>` for empty objects
  --default-non-nullable                              Set to `false` to ignore default values when generating non-nullable types
  --properties-required-by-default                    Treat schema objects as if `required` is set to all properties by default
  --array-length                                      Generate tuples using array minItems / maxItems
  --path-params-as-types                              Convert paths to template literal types
  --alphabetize                                       Sort object keys alphabetically
  --exclude-deprecated                                Exclude deprecated types
  --no-blob-from-binary                               If this option is enabled, binary format fields will not be converted to Blob types, preserving the native representation
  --explicit-component-exports                        Enabling this option will export API components as separate type aliases, alongside `components` interface
  --tanstack-query-version [semver]                   TanStack Query version to use (automatically detected if not specified)

  -h, --help                                          display help for command
```

## Usage example

The command below generates Qraft API services for the OpenAPI schema and places them in the `src/api` directory:

```bash npm2yarn
npx openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml \
  --output-dir src/api
```

## Options

### Required

- **`-o <path>, --output-dir <path>`:** Specify where to output the generated services.
  - Example: `--output-dir src/api`

### Edge-case Options

- **`-rm, --clean`:** Clean the specified output directory services before generating to remove stale files _(optional)_.
- **`--filter-services <glob-patterns...>`:** Filter services to be generated by glob pattern _(optional)_.
  - **Pattern syntax:**
    - `<glob-pattern>,<glob-pattern>,...` - comma-separated list of glob patterns. See [`micromatch`](https://github.com/micromatch/micromatch)
      package for more details. More than one pattern can be specified.
  - Examples:
    - `--filter-services '/user/**,/post/**'` - include only API endpoints that start with `/user/` or `/post/`
    - `--filter-services '**,!/internal/**'` - include _all_ API endpoints _except_ those that start with `/internal/`
- **`--operation-predefined-parameters <patterns...> `:** Predefined parameters for services. The specified services parameters will be optional. _(optional)_

  - **Pattern syntax:**
    - `<path glob>:<operation parameter>,...`
    - `<method> <path glob>:<operation parameter>,...`
    - Each modifier consists of an _optional_ **method**, a **path glob** pattern,
      a colon, and a comma-separated list of **operation parameters** to be set as optional.
      More than one predefined parameter option can be specified.

  This option 💎 is arguably one of the most awesome features, allowing you to **set default parameters** across multiple endpoints.
  However, if an endpoint doesn't contain a parameter specified in this option, an error will be displayed. For example:

  ```text
  ⚠ Missing predefined parameter 'header' 'x-monite-version' in 'post /files' in '/**'
  ```

  To resolve such errors, you can exclude specific endpoints from the predefined parameters using the negation syntax in the glob pattern, like:

  ```
  --operation-predefined-parameters '/**,!/files:header.x-monite-version'
  ```

  - Examples:
    - `--operation-predefined-parameters '/**:header.x-monite-version'` - set `header.x-monite-version`
      as optional parameters for all services.
    - `--operation-predefined-parameters '/**,!/auth/token:header.x-entity-id'` - set `header.x-entity-id` as optional parameters for all services except `/auth/token`.
    - `--operation-predefined-parameters 'post,put /**:header.x-entity-id'` - set the `Header` record `x-entity-id` as an optional parameter for the `POST` and `PUT` methods.

- **`--operation-name-modifier <patterns...>`:** Modifies operation names using a pattern.

  - **Pattern syntax:**
    - `<path glob>:<regular expression> ==> <new operation name>`
    - `<method> <path glob>:<regular expression> ==> <new operation name>`
    - Each modifier consists of an _optional_ **method**, a **path glob** pattern,
      a colon, and a **regular expression** that matches the operation name. The part after `==>` is the new operation name.
      More than one modifier option can be specified.
  - Examples:
    - `--operation-name-modifier 'get /**:[A-Za-z]+Id ==> findOne'` - will change all `GET` operations with `Id` suffix to `findOne`.
    - `--operation-name-modifier 'get /**:get(.*) ==> find-$1'` - will change all `GET` operations with `get` prefix to `findById | findAll | ...`.
      - The pattern is a regular expression that matches the operation name.
      - The operation name is converted to Camel Case. Spaces, hyphens, and underscores are removed.
    - `--operation-name-modifier 'put,patch /**:[A-Za-z]+Id ==> updateOne'` - will change all `PUT` and `PATCH` operations with `Id` suffix to `updateOne`.
    - `--operation-name-modifier '/posts,/files:create[a-zA-Z]+ ==> createOne'` - will change all operations under `/posts` and `/files` to `createOne` if the operation name starts with `create`.
    - `--operation-name-modifier 'post /files ==> createOne' 'put /posts ==> updateOne'` - will change all `POST` operations under `/files` to `createOne` and all `PUT` operations under `/posts` to `updateOne`.

- **`--explicit-component-exports`:** Enabling this option will export API components as separate type aliases, alongside `components` interface.

- **`--redocly [config]`:** Use the Redocly configuration to generate multiple API clients. If the `[config]` parameter is not specified, the default Redocly configuration will be used: `[redocly.yaml | redocly.yml | .redocly.yaml | .redocly.yml]`. _(optional)_

  - Examples:
    - `--redocly` - use the default Redocly configuration file
    - `--redocly ./my-redocly-config.yaml` - use a custom Redocly configuration file
    - `openapi-qraft my-api@v1 external-api --redocly` - generate clients for multiple APIs defined in the Redocly configuration
  - For more information about this option, use the command: `--redocly-help`

- **`--service-name-base <endpoint[<index>] | tags>`:** Use OpenAPI Operation `endpoint[<index>]` path part (e.g.: `/0/1/2`) or `tags` as the base name of the service. _(optional, default: `endpoint[0]`)_.
  - **`endpoint[<index>]`** - Use the path segment (e.g., `/0/1/2`) as the base name for the service.
    - Examples:
      - `--service-name-base endpoint[0]` generates `services/FooService.ts` for the endpoint `/foo/bar/baz`
      - `--service-name-base endpoint[1]` generates `services/BarService.ts` for the endpoint `/foo/bar/baz`
      - `--service-name-base endpoint[3]` generates `services/BazService.ts` for the endpoint `/foo/bar/baz` _(if the endpoint is shorter than the index, the last part is used)_
      - If used `endpoint[<index>]` as the base name, operation names will be generated according to the specified index.
        - For example:
          - `--service-name-base endpoint[1]` for the endpoint `/api/bar` generates `get` operation name.
          - `--service-name-base endpoint[1]` for the endpoint `/api/foo/bar` generates `getBar` operation name.
  - **`tags`** - Use the OpenAPI Operation `tags` as the base name of the service.
    - Examples:
      - `--service-name-base tags` will generate services based on the OpenAPI Operation tags instead of the endpoint.
        - If multiple tags are present for the operation, similar services will be created for each tag. Operation with `tags: [Foo, Bar]` will generate `services/FooService.ts` and `services/BarService.ts`.
        - If there are no tags for the operation, the services will be created under the `default` tag. Operation with empty `tags: []` will generate `services/DefaultService.ts`.
        - If `tags` are used as the base name, operation names will be generated based on the `operationId` from the
          OpenAPI Operation, or from the path if `operationId` is not provided.
          You can use `--operation-name-modifier` to customize the operation names.
- **`--explicit-import-extensions [extension]`**: All import statements will contain an explicit file extension. Ideal for projects using ECMAScript modules
  when TypeScript's _--moduleResolution_ is `node16` or `nodenext`. Choices: `.js`, `.ts`, preset: `.js`. _(optional)_
- **`--file-header <string>`:** Add a custom header to each generated file, useful for disabling linting rules or adding file
  comments _(optional)_.
  - Example: `--file-header '/* eslint-disable */'`
- **`--postfix-services <string>`:** Customize the generated service names with a specific postfix _(optional, default: `Service`)_.
  - Example: `--postfix-services Endpoint` will generate `services/UserEndpoint.ts` instead of `services/UserService.ts`.
- **`--plugin <name_1> --plugin <name_2>`**: Generator plugins to be used. (choices: `tanstack-query-react`, `openapi-typescript`)
  - Examples:
    - `--plugin tanstack-query-react --plugin openapi-typescript` generates Qraft Services and `openapi-typescript` types file.
    - `--plugin tanstack-query-react` generates Qraft Services only.
    - `--plugin openapi-typescript` generates [`openapi-typescript`](https://github.com/drwpow/openapi-typescript) types file only.
- **`-h, --help`:** Display help for the command (optional).

## Plugin System

The following plugins are currently supported:

- `openapi-typescript` - Generates TypeScript types from an OpenAPI Document. The main difference from the original [`openapi-typescript`](https://www.npmjs.com/package/openapi-typescript) package is that `format: binary` fields default to `Blob` types instead of remaining as `string`. This behavior can be altered using the `--no-blob-from-binary` option.
- `tanstack-query-react` - Generates Qraft API services for React.

> Plugin must be provided with the `--plugin <name>` option. By default, the `tanstack-query-react` plugin is used.
> It is possible to use multiple plugins at the same time. For example, `--plugin tanstack-query-react --plugin openapi-typescript` generates Qraft API services & schema types file.

### `--plugin tanstack-query-react` options

- **`--openapi-types-import-path <path>`:** Set the path to the schema types definition file to ensure consistent type
  usage (assumed, you already have `schema.d.ts` as a result of the [`openapi-typescript`](https://github.com/drwpow/openapi-typescript) utility). You also probably
  don't need the ~~`--plugin openapi-typescript`~~ option in this case.
  - The path is the exact import specifier used in the _generated services_. It should be _relative_ to the service
    output directory. _Optional_, if the `--plugin openapi-typescript` is used. _Required_ otherwise.
    - Examples:
      - `--openapi-types-import-path ../openapi.d.ts`
      - `--openapi-types-import-path '@/api/openapi.d.ts'`
      - `--openapi-types-import-path '@external-package-types'`
- **`--operation-generics-import-path <path>`:** Define the path to the operation generics file, allowing for custom
  operation handling _(optional, default: `@openapi-qraft/react`)_.
- **`--export-openapi-types [bool]`:** Add an export statement of the generated OpenAPI document types from the `./index.ts` file. Useful for sharing types within your project. _(optional, default: `true`, if `--plugin openapi-typescript` is used)_

### `--plugin openapi-typescript` options

- **`--queryable-write-operations [bool]`**: Enable generation of query hooks (`useQuery`, `useSuspenseQuery`, etc.) for
  writable HTTP methods like _POST_, _PUT_, _PATCH_. By default, only mutation hooks are generated for writable operations.
- **`--openapi-types-file-name <path>`**: OpenAPI Schema types file name, e.g., `schema.d.ts` (default: `schema.ts`).
- **`--enum`**: Export true TypeScript enums instead of unions.
- **`--enum-values`**: Export enum values as arrays.
- **`--dedupe-enums`**: Dedupe enum types when `--enum` is set.
- **`-t, --export-type`**: Export top-level `type` instead of `interface`.
- **`--immutable`**: Generate readonly types.
- **`--additional-properties`**: Treat schema objects as if `additionalProperties: true` is set.
- **`--empty-objects-unknown`**: Generate `unknown` instead of `Record<string, never>` for empty objects.
- **`--default-non-nullable`**: Set to `false` to ignore default values when generating non-nullable types.
- **`--properties-required-by-default`**: Treat schema objects as if `required` is set to all properties by default.
- **`--array-length`**: Generate tuples using array `minItems` / `maxItems`.
- **`--path-params-as-types`**: Convert paths to template literal types.
- **`--alphabetize`**: Sort object keys alphabetically.
- **`--exclude-deprecated`**: Exclude deprecated types.
- **`--no-blob-from-binary`**: If this option is enabled, `format: binary` fields will not be converted to `Blob` types, preserving the native type. Could be used with `--plugin openapi-typescript` option.
- **`--explicit-component-exports`**: Enabling this option will export API components as separate type aliases, alongside `components` interface.

## In-project Setup

Add the following `"scripts"` to your `package.json` file:

```json5 title="package.json"
{
  devDependencies: {
    '@openapi-qraft/cli': 'latest',
  },
  scripts: {
    'generate-client': 'openapi-qraft --plugin tanstack-query-react --plugin openapi-typescript https://raw.githubusercontent.com/swagger-api/swagger-petstore/master/src/main/resources/openapi.yaml --output-dir src/api',
    // ...other scripts
  },
}
```

## Contributing

Contributions to `@openapi-qraft/cli` are welcome! Please feel free to submit issues, pull requests, or suggest features
to help improve the utility.

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
