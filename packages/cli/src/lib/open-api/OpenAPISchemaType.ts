export type OpenAPISchemaType = {
  paths: {
    [path: string]: {
      [method: string]: {
        tags?: string[];
        description?: string;
        summary?: string;
        operationId?: string;
        parameters?: Record<string, any>;
        deprecated?: boolean;
        requestBody?: {
          content: {
            [contentType: string]: {
              schema: any;
            };
          };
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
      };
    };
  };
};
