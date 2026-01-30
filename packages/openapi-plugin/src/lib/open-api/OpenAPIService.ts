import type { OpenAPISchemaType } from './OpenAPISchemaType.js';

export type OpenAPIService = {
  name: string;
  variableName: string;
  typeName: string;
  fileBaseName: string;
  operations: ServiceOperation[];
};

export type ServiceOperation = {
  method:
    | 'get'
    | 'put'
    | 'post'
    | 'patch'
    | 'delete'
    | 'options'
    | 'head'
    | 'trace';
  path: string;
  name: string;
  description: string | undefined;
  summary: string | undefined;
  deprecated: boolean | undefined;
  /**
   * Contains error response types like 400, 401, 404, 500, etc.
   * The mapping contains status codes as keys and response types as values.
   * If the response type is `null`, it typically indicates an error response with no content.
   */
  errors: Record<string, string[] | null | undefined>;
  requestBody: OpenAPISchemaType['paths'][string]['post']['requestBody'];
  /**
   * Contains successful response types like 200, 201, 204, etc.
   * The mapping contains status codes as keys and response types as values.
   * If the response type is `null`, it typically indicates a 204-like response with no content.
   */
  success: Record<string, string[] | null | undefined>;
  parameters:
    | {
        name: string;
        in: 'header' | 'query' | 'cookie';
        description: string;
        required: boolean;
        schema: any;
        example: string | undefined;
      }[]
    | undefined;
  security: Array<Record<string, string[] | undefined>> | undefined;
};
