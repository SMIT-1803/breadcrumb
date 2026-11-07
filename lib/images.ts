const imageTypes: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp',
};
export function validateImage(file: {type: string; size: number}): string {
  if (!imageTypes[file.type]) throw new Error('Choose a PNG, JPEG or WebP screenshot.');
  if (file.size <= 0) throw new Error('This image is empty. Choose another screenshot.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Choose a screenshot smaller than 5 MB.');
  return imageTypes[file.type];
}
export function imagePath(owner:string,id:string,extension:string) {return `${owner}/${id}.${extension}`;}
export function validateImagePath(path:unknown,owner:string,id:string):string {
 if(typeof path!=='string'||!['png','jpg','webp'].some(ext=>path===imagePath(owner,id,ext)))throw new Error('This screenshot does not belong to this capture.');
 return path;
}
