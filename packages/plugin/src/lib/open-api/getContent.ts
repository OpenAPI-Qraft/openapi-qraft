export const getContentMediaType = (
  content:
    | {
        [contentType: string]: { schema: unknown } | { type: unknown };
      }
    | undefined
) => {
  const mediaTypes = Object.keys(content || {});

  if (!mediaTypes.length) return null;

  return mediaTypes;
};
