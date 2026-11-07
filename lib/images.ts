const imageTypes: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp',
};
export function validateImage(file: {type: string; size: number}): string {
  if (!imageTypes[file.type]) throw new Error('Choose a PNG, JPEG or WebP screenshot.');
  if (file.size <= 0) throw new Error('This image is empty. Choose another screenshot.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Choose a screenshot smaller than 5 MB.');
  return imageTypes[file.type];
}
