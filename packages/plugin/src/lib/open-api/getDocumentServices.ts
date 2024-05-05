import { getServices, ServiceOutputOptions } from './getServices.js';
import { OpenAPISchemaType } from './OpenAPISchemaType.js';

export const getDocumentServices = async ({
  schema,
  servicesGlob,
  output,
}: {
  schema: OpenAPISchemaType;
  servicesGlob: string[] | undefined;
  output: ServiceOutputOptions;
}) => {
  return getServices(schema, output, servicesGlob);
};
