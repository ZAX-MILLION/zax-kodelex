/**
 * Image validation and URL fixing utilities
 */

import { getFallbackCoverImage } from '@/utils/imageOptimization';

/**
 * Validates if an image URL is accessible
 */
export const validateImageUrl = async (url: string): Promise<boolean> => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch {
    return false;
  }
};

/**
 * Gets a working cover image URL with fallback
 */
export const getWorkingCoverImage = async (
  originalUrl?: string, 
  seriesId?: string
): Promise<string> => {
  if (!originalUrl) {
    return getFallbackCoverImage(seriesId);
  }

  // Fix common path issues
  let fixedUrl = originalUrl;
  
  // Convert /src/assets/ to public path
  if (fixedUrl.startsWith('/src/assets/')) {
    fixedUrl = fixedUrl.replace('/src/assets/', '/');
  }
  
  // Ensure leading slash for relative paths
  if (!fixedUrl.startsWith('/') && !fixedUrl.includes('://')) {
    fixedUrl = `/${fixedUrl}`;
  }

  // Test if the image loads
  const isValid = await validateImageUrl(fixedUrl);
  
  if (!isValid) {
    console.warn(`Invalid image URL: ${originalUrl} -> ${fixedUrl}, using fallback`);
    return getFallbackCoverImage(seriesId);
  }

  return fixedUrl;
};

/**
 * Real working cover images for seeding
 */
export const REAL_COVER_IMAGES = [
  // Unsplash images that work well as manga/novel covers
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&auto=format', // Books
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&auto=format', // Library
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format', // Open book
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop&auto=format', // Books stack
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop&auto=format', // Book on table
  'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=400&h=600&fit=crop&auto=format', // Fantasy book
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop&auto=format', // Japanese aesthetic
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=600&fit=crop&auto=format', // Vintage books
  'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400&h=600&fit=crop&auto=format', // Fantasy aesthetic
  'https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=400&h=600&fit=crop&auto=format', // Books and coffee
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop&auto=format', // Book pages
  'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&h=600&fit=crop&auto=format', // Mystical books
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&auto=format', // Classic library
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=600&fit=crop&auto=format', // Book spine
  'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=400&h=600&fit=crop&auto=format', // Reading corner
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&auto=format', // Bookshelf
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format', // Open pages
  'https://images.unsplash.com/photo-1533327325824-76bc4e62d79b?w=400&h=600&fit=crop&auto=format', // Book collection
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&auto=format', // Library scene
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop&auto=format', // Study books
  'https://images.unsplash.com/photo-1491841573337-6cab3e0b11b5?w=400&h=600&fit=crop&auto=format', // Manga style
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=600&fit=crop&auto=format', // Japanese culture
  'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=600&fit=crop&auto=format', // Cherry blossom
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=600&fit=crop&auto=format', // Asian aesthetic
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop&auto=format', // Zen garden
  'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=600&fit=crop&auto=format', // Traditional art
  'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400&h=600&fit=crop&auto=format', // Samurai aesthetic
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&auto=format', // Book cover design
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=600&fit=crop&auto=format', // Fantasy theme
  'https://images.unsplash.com/photo-1551029506-0807df4e2031?w=400&h=600&fit=crop&auto=format', // Sci-fi aesthetic
];

/**
 * Gets a random real cover image
 */
export const getRandomRealCoverImage = (): string => {
  const randomIndex = Math.floor(Math.random() * REAL_COVER_IMAGES.length);
  return REAL_COVER_IMAGES[randomIndex];
};

/**
 * Gets a deterministic real cover image based on series ID
 */
export const getDeterministicRealCoverImage = (seriesId: string): string => {
  const hash = seriesId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % REAL_COVER_IMAGES.length;
  return REAL_COVER_IMAGES[index];
};