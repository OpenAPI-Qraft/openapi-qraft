export type OpenAPISchemaType = {
  paths: {
    [path: string]: {
      [method: string]: {
        description?: string;
        summary?: string;
        operationId?: string;
        parameters?: Record<string, never>;
        deprecated?: boolean;
        requestBody?: {
          content: {
            [contentType: string]: {
              schema: never;
            };
          };
        };
        responses: {
          [statusCode in number | 'default']: {
            description: string;
            content: {
              [contentType: string]: {
                schema: never;
              };
            };
          };
        };
      };
    };
  };
};
