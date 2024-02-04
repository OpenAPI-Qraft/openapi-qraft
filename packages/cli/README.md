# @radist2s/qraft-cli

`@radist2s/qraft-cli` is a powerful command-line utility designed to streamline the development process by generating service declarations and typed React Query interfaces directly from an OpenAPI Schema. With `@radist2s/qraft-cli`, frontend developers can easily generate typed API clients, ensuring type safety and improving development efficiency within React applications.

## Features

- **Typed React Query Interfaces:** Create typed React Query hooks for seamless and type-safe API requests.
- **Generate Typed Services:** Automatically generate service declarations from an OpenAPI Schema.

## Installation

```bash
npm install -g @radist2s/qraft-cli
```

## Usage

```
Usage: qraft-openapi-services [options] [input]

Arguments:
  input   Input OpenAPI Schema file path, URL (json, yml)

Options:
  -o, --output-dir <path>           Output directory for generated services.
  --operation-generics-path <path>  Path to operation generics file (default: "@radist2s/qraft/ServiceOperation").
  --schema-types-path <path>        Path to schema types file (.d.ts) (default: "./schema").
  --file-header <string>            Header to be added to the generated file (eg: /* eslint-disable */).
  -rm, --clean                      Clean output directory before generating services.
  --postfix-services <string>       Postfix to be added to the generated service name (eg: Service).
  -h, --help                        Display help for command.
```

### Example

To generate services from an OpenAPI schema file:

```bash
qraft-openapi-services https://example.com/openapi.json --output-dir src/api --schema-types-path ../openapi.d.ts
```

This command generates service declarations and React Query hooks types in the `src/api` directory based on the `schema.json` file.

## Configuration

- **`-o <path>, --output-dir <path>`:** Specify where to output the generated services.
- **`--schema-types-path <path>`:** Set the path to the schema types definition file to ensure consistent type usage (assumed, you already have `openapi.d.ts` as a result of the [`openapi-typescript`](https://github.com/drwpow/openapi-typescript) utility).
- **`--operation-generics-path <path>`:** Define the path to the operation generics file, allowing for custom operation handling _(optional, default: `@radist2s/qraft/ServiceOperation`)_.
- **`--file-header`:** Add a custom header to each generated file, useful for disabling linting rules or adding file comments _(optional)_.
- **`-rm, --clean`:** Clean the specified output directory services before generating to remove stale files _(optional)_.
- **`--postfix-services`:** Customize the generated service names with a specific postfix _(optional)_.

## Contributing

Contributions to `@radist2s/qraft-cli` are welcome! Please feel free to submit issues, pull requests, or suggest features to help improve the utility.

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).
