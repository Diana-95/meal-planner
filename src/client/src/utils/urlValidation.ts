/**
 * Validates image URLs to prevent XSS attacks
 * @param url - The URL to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateImageUrl(url: string): { isValid: boolean; error?: string } {
  // Allow empty string (no image)
  if (!url || url.trim() === '') {
    return { isValid: true };
  }

  const trimmedUrl = url.trim();
  const lowerUrl = trimmedUrl.toLowerCase();

  // Check for dangerous protocols that could lead to XSS
  const dangerousProtocols = [
    'javascript:',
    'vbscript:',
    'data:text/html',
    'data:application/javascript',
    'data:application/x-javascript',
    'data:text/javascript',
  ];

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return {
        isValid: false,
        error: 'Dangerous protocols are not allowed for security reasons.',
      };
    }
  }

  // Allow data: URIs only for images (data:image/...)
  if (lowerUrl.startsWith('data:')) {
    if (!lowerUrl.startsWith('data:image/')) {
      return {
        isValid: false,
        error: 'Data URIs must be for images only (data:image/...).',
      };
    }
    return { isValid: true };
  }

  // For http/https URLs, validate they're proper URLs
  if (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')) {
    try {
      const urlObj = new URL(trimmedUrl);
      // Only allow http and https protocols
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return {
          isValid: false,
          error: 'Only HTTP and HTTPS URLs are allowed.',
        };
      }
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        error: 'Invalid URL format. Please enter a valid HTTP or HTTPS URL.',
      };
    }
  }

  // Reject any other protocols
  return {
    isValid: false,
    error: 'URL must start with http://, https://, or be a data URI for images.',
  };
}

