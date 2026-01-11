export const FALLBACK_IMG =
  "https://img.icons8.com/color/96/marijuana-leaf.png";

export const getImageSrc = (imageUrl) => {
  if (!imageUrl) return FALLBACK_IMG;

  // If already proxied
  if (imageUrl.startsWith("/api/img")) return imageUrl;

  // Leafly or external URL → send through proxy
  if (imageUrl.startsWith("http")) {
    return `/api/img?url=${encodeURIComponent(imageUrl)}`;
  }

  // Local image path
  return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
};
