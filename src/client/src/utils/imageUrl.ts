/**
 * Normalizes image URLs to ensure they point to the correct server
 * If the URL is a relative path starting with /uploads/, prepends the server URL
 */
export const normalizeImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl) return '';
  
  // If it's already a full URL (http/https), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a data URI or blob URL, return as-is
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
    return imageUrl;
  }
  
  // If it's a relative path starting with /uploads/, prepend server URL
  if (imageUrl.startsWith('/uploads/')) {
    const serverUrl = process.env.REACT_APP_AUTH_URL || 'http://localhost:4000';
    return `${serverUrl}${imageUrl}`;
  }
  
  // For any other relative path or URL, return as-is
  return imageUrl;
};
