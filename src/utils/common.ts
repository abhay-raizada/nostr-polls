export const isImageUrl = (url: string): boolean => {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
};
