/**
 * Image optimization and performance utilities
 */

// Fallback cover images from placeholder collection
const FALLBACK_IMAGES = [
  'photo-1649972904349-6e44c42644a7', // woman with laptop
  'photo-1488590528505-98d2b5aba04b', // gray laptop
  'photo-1518770660439-4636190af475', // circuit board
  'photo-1461749280684-dccba630e2f6', // Java programming
  'photo-1485827404703-89b55fcc595e', // robot
  'photo-1526374965328-7f61d4dc18c5', // Matrix
  'photo-1470813740244-df37b8c1edcb', // starry night
  'photo-1500375592092-40eb2168fd21', // ocean wave
  'photo-1482881497185-d4a9ddbe4151', // desert sand
  'photo-1523712999610-f77fbcfc3843'  // forest
];

/**
 * Gets a fallback cover image for manga series
 */
export const getFallbackCoverImage = (seriesId?: string): string => {
  if (!seriesId) {
    return `https://images.unsplash.com/${FALLBACK_IMAGES[0]}?w=400&h=600&fit=crop&auto=format`;
  }
  
  // Use series ID to consistently assign the same fallback image
  const hash = seriesId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % FALLBACK_IMAGES.length;
  return `https://images.unsplash.com/${FALLBACK_IMAGES[index]}?w=400&h=600&fit=crop&auto=format`;
};

/**
 * Creates an optimized image URL with size parameters
 */
export const getOptimizedImageUrl = (
  url: string | null | undefined, 
  width?: number, 
  height?: number,
  quality = 80
): string => {
  // Handle null, undefined, or non-string values
  if (!url || typeof url !== 'string' || url.includes('/placeholder.svg')) {
    return getFallbackCoverImage();
  }

  // Local demo covers / packaged assets: keep as-is
  if (url.startsWith('/') || url.startsWith('./') || url.includes('/demo-covers/')) {
    return url;
  }

  // Handle picsum.photos URLs (our main image source)
  if (url.includes('picsum.photos')) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      // Handle seeded URLs like: https://picsum.photos/seed/manga-1/400/600
      if (pathParts.includes('seed')) {
        const seedIndex = pathParts.indexOf('seed');
        const seed = pathParts[seedIndex + 1];
        return `https://picsum.photos/seed/${seed}/${width || 400}/${height || 600}`;
      } 
      // Handle regular numbered URLs like: https://picsum.photos/400/600
      else if (pathParts.length >= 2 && /^\d+$/.test(pathParts[pathParts.length - 2])) {
        return `https://picsum.photos/${width || 400}/${height || 600}`;
      }
      // Fallback: return the URL as-is if it looks valid
      else {
        return url;
      }
    } catch (error) {
      console.warn('Error parsing picsum URL:', url, error);
      return getFallbackCoverImage();
    }
  }

  // Convert /src/assets paths to proper public paths
  if (url.startsWith('/src/assets/')) {
    const publicPath = url.replace('/src/assets/', '/');
    return publicPath;
  }

  // Handle relative paths that should be public
  if (url.startsWith('/manga-covers/') || url.startsWith('manga-covers/')) {
    return url.startsWith('/') ? url : `/${url}`;
  }

  // If it's already an unsplash URL, add optimization parameters
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('fit', 'crop');
    params.set('auto', 'format');
    params.set('q', quality.toString());
    
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?${params.toString()}`;
  }

  // For other URLs, return as-is or fallback if invalid
  try {
    const testUrl = new URL(url, window.location.origin);
    return testUrl.href;
  } catch {
    return getFallbackCoverImage();
  }
};

/**
 * Creates a srcset for responsive images
 */
export const createImageSrcSet = (url: string, maxWidth = 800): string => {
  // Local demo covers: single URL only (no picsum/unsplash srcset fan-out)
  if (url?.startsWith('/demo-covers/') || url?.startsWith('/zax-million-favicon')) {
    return `${url} ${Math.min(400, maxWidth)}w`;
  }

  if (!url || url.includes('/placeholder.svg')) {
    const fallback = getFallbackCoverImage();
    return [
      `${getOptimizedImageUrl(fallback, 200)} 200w`,
      `${getOptimizedImageUrl(fallback, 400)} 400w`,
      `${getOptimizedImageUrl(fallback, 600)} 600w`,
      `${getOptimizedImageUrl(fallback, 800)} 800w`
    ].join(', ');
  }

  const widths = [200, 400, 600, 800].filter(w => w <= maxWidth);
  return widths.map(w => `${getOptimizedImageUrl(url, w)} ${w}w`).join(', ');
};

/**
 * Gets responsive sizes attribute
 */
export const getResponsiveSizes = (type: 'hero' | 'card' | 'thumbnail' = 'card'): string => {
  switch (type) {
    case 'hero':
      return '(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
    case 'card':
      return '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';
    case 'thumbnail':
      return '(max-width: 640px) 100px, 150px';
    default:
      return '(max-width: 640px) 50vw, 25vw';
  }
};

/**
 * Determines if an image should be loaded with priority
 */
export const isCriticalImage = (index: number, type: 'hero' | 'card' = 'card'): boolean => {
  if (type === 'hero') {
    return index < 4; // First slide images
  }
  return index < 6; // First 6 cards
};

/**
 * Validates if a URL is a valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string' || url.includes('/placeholder.svg')) return false;
  
  // Allow relative paths that we can resolve
  if (url.startsWith('/src/assets/') || url.startsWith('/manga-covers/') || url.startsWith('manga-covers/')) {
    return true;
  }
  
  try {
    const testUrl = new URL(url, window.location.origin);
    return testUrl.protocol === 'http:' || testUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Gets the appropriate image dimensions for different contexts
 */
export const getImageDimensions = (type: 'hero' | 'card' | 'thumbnail') => {
  switch (type) {
    case 'hero':
      return { width: 400, height: 600 };
    case 'card':
      return { width: 300, height: 450 };
    case 'thumbnail':
      return { width: 150, height: 225 };
    default:
      return { width: 300, height: 450 };
  }
};