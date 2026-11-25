import type { Img } from "./types";

// Sanity image URLs accept resize parameters; local fallback images are served as they are.
export function src(image: Img | null | undefined, width: number): string | undefined {
  if (!image?.url) return undefined;
  return image.url.includes("cdn.sanity.io") ? `${image.url}?w=${width}&auto=format&fit=max&q=80` : image.url;
}

export const money = (n: number) => "$" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

export const chapterLabel = (n?: number | null) => (n ? `Chapter ${n}` : "");
