// Preview images are generated ahead of time and stored under public/learn/previews,
// named by a hash of the link they show. A link without an image falls back to a text card.
export function previewSrc(url: string): string {
  // FNV-1a, 32 bit.
  let hash = 2166136261;
  for (let i = 0; i < url.length; i++) {
    hash ^= url.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `/learn/previews/${(hash >>> 0).toString(16).padStart(8, "0")}.jpg`;
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
