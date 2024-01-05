import fs from "fs";
import { OpenAPISchemaType } from "./OpenAPISchemaType";

export const readSchemaFromFile = async (filePath: string) => {
  return JSON.parse(
    await fs.promises.readFile(filePath, {
      encoding: "utf-8",
    }),
  ) as OpenAPISchemaType;
};
