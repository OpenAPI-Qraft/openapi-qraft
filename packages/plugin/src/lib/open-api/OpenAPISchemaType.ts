export type OpenAPISchemaType = {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  paths: {
    [path: string]: {
      [method: string]: {
        tags?: string[];
        description?: string;
        summary?: string;
        operationId?: string;
        parameters?: Array<any>;
        deprecated?: boolean;
        requestBody?: {
          content?: {
            [contentType: string]: {
              schema: any;
            };
          };
          $ref?: string;
        };
        responses: {
          [statusCode in number | 'default']: {
            description: string;
            content: {
              [contentType: string]: {
                schema: any;
              };
            };
          };
        };
        security?: Array<Record<string, string[] | undefined>>;
      };
    };
  };
  components: {
    parameters: Record<string, any> | undefined;
  };
};
