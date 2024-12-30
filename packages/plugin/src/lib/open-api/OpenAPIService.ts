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
  errors: Record<string, string | undefined>;
  requestBody: OpenAPISchemaType['paths'][string]['post']['requestBody'];
  success: Record<string, string | undefined>;
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
