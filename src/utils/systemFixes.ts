// System-wide fixes and utilities

export const fixImageUrls = (imageUrl?: string | null): string => {
  if (!imageUrl) return 'https://picsum.photos/400/600?random=1';
  
  // Fix common URL issues
  if (imageUrl.startsWith('//')) {
    return 'https:' + imageUrl;
  }
  
  if (!imageUrl.startsWith('http')) {
    return 'https://picsum.photos/400/600?random=' + Math.random();
  }
  
  return imageUrl;
};

export const formatStatus = (status: string): 'ongoing' | 'completed' | 'hiatus' | 'cancelled' => {
  const validStatuses = ['ongoing', 'completed', 'hiatus', 'cancelled'];
  return validStatuses.includes(status.toLowerCase()) 
    ? status.toLowerCase() as any 
    : 'ongoing';
};

export const formatContentType = (contentType: string): 'manga' | 'novel' => {
  return contentType === 'novel' ? 'novel' : 'manga';
};

export const ensureArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};