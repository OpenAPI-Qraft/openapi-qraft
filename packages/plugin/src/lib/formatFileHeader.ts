export const formatFileHeader = (fileHeader: string | undefined) => {
  if (!fileHeader) return '';
  return `${fileHeader}${fileHeader.endsWith('\n') ? '' : '\n'}`;
};
