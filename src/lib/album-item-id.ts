let sequence = 0;

export function createAlbumItemId(name: string, lastModified: number, size: number) {
  sequence += 1;
  return `${name}-${lastModified}-${size}-${sequence}`;
}
