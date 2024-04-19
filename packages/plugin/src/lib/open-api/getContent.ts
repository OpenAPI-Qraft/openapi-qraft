const BASIC_MEDIA_TYPES = [
  "application/json-patch+json",
  "application/json",
  "application/x-www-form-urlencoded",
  "text/json",
  "text/plain",
  "multipart/form-data",
  "multipart/mixed",
  "multipart/related",
  "multipart/batch",
];

export const getContentMediaType = (content: {
  [contentType: string]: { schema: unknown };
}) => {
  const basicMediaTypeWithSchema = Object.keys(content)
    .filter((mediaType) => {
      const cleanMediaType = mediaType.split(";")[0].trim();
      return BASIC_MEDIA_TYPES.includes(cleanMediaType);
    })
    .find((mediaType) => content[mediaType]?.schema);

  if (basicMediaTypeWithSchema) return basicMediaTypeWithSchema;

  return Object.keys(content).find((mediaType) => content[mediaType]?.schema);
};
