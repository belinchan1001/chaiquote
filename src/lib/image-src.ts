/** Phone 400w + desktop file. The unsuffixed WebP is the larger fallback. */
export function webpSrcSet(path: string) {
  const webp = path.replace(/\.jpe?g$/i, ".webp");
  const phone = webp.replace(/\.webp$/i, "-400.webp");
  return `${phone} 400w, ${webp} 800w`;
}

export const CARD_IMAGE_SIZES = "(max-width: 767px) 400px, 800px";
