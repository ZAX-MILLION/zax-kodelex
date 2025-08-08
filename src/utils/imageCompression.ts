/**
 * Image compression and validation utilities
 */

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  compressedFile?: File;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  maxSizeKB: 2048, // 2MB
};

/**
 * Validates image file before upload
 */
export const validateImage = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.'
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Maximum 10MB allowed.'
    };
  }

  return { isValid: true };
};

/**
 * Compresses an image file using canvas
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<ImageValidationResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // First validate the file
  const validation = validateImage(file);
  if (!validation.isValid) {
    return validation;
  }

  try {
    // Create image element
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Load image
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });

    // Calculate new dimensions
    let { width, height } = img;
    
    if (width > opts.maxWidth || height > opts.maxHeight) {
      const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Draw and compress
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to blob
    const compressedBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, file.type, opts.quality);
    });

    if (!compressedBlob) {
      throw new Error('Failed to compress image');
    }

    // Check if compression was effective
    if (compressedBlob.size > opts.maxSizeKB * 1024) {
      // Try with lower quality
      const lowerQualityBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, file.type, 0.6);
      });

      if (lowerQualityBlob && lowerQualityBlob.size <= opts.maxSizeKB * 1024) {
        const compressedFile = new File([lowerQualityBlob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });

        return {
          isValid: true,
          compressedFile,
        };
      }
    }

    // Create compressed file
    const compressedFile = new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });

    // Clean up
    URL.revokeObjectURL(img.src);

    return {
      isValid: true,
      compressedFile,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Compression failed',
    };
  }
};

/**
 * Compresses multiple images in parallel
 */
export const compressImages = async (
  files: File[],
  options: CompressionOptions = {}
): Promise<ImageValidationResult[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};

/**
 * Creates a thumbnail from an image file
 */
export const createThumbnail = async (
  file: File,
  size: number = 300
): Promise<ImageValidationResult> => {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    maxSizeKB: 100,
  });
};