import React, { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOptimizedImageUrl, createImageSrcSet, getResponsiveSizes, isValidImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  errorFallback?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  retry?: boolean;
  maxRetries?: number;
  sizes?: string;
}
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  errorFallback,
  loading = 'lazy',
  threshold = 0.1,
  onLoad,
  onError,
  fill = false,
  width,
  height,
  priority = false,
  retry = true,
  maxRetries = 2,
  sizes
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(loading === 'eager' || priority);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(() => {
    if (!isValidImageUrl(src)) {
      return getFallbackCoverImage();
    }
    return getOptimizedImageUrl(src, width, height);
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (loading === 'eager') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, {
      threshold
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [threshold, loading]);
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0);
    onLoad?.();
  };
  const handleError = () => {
    if (retry && retryCount < maxRetries) {
      // Try fallback image on first error
      if (retryCount === 0 && currentSrc !== getFallbackCoverImage()) {
        setCurrentSrc(getFallbackCoverImage());
        setRetryCount(prev => prev + 1);
        return;
      }
      // Retry with delay
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setCurrentSrc(getOptimizedImageUrl(src, width, height));
      }, 1000 * retryCount);
    } else {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    }
  };
  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
    setCurrentSrc(getOptimizedImageUrl(src, width, height));
  };
  const defaultPlaceholder = <div className={`bg-muted animate-pulse ${fill ? 'absolute inset-0' : className}`}>
      <Skeleton className="w-full h-full" />
    </div>;
  const defaultErrorFallback = <div className={`bg-muted border border-border rounded flex items-center justify-center ${fill ? 'absolute inset-0' : className}`}>
      <div className="text-center p-4">
        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-2">Failed to load image</p>
        {retry && <Button variant="outline" size="sm" onClick={handleRetry} className="h-8 px-3">
            <RotateCcw className="h-3 w-3 mr-1" />
            Retry
          </Button>}
      </div>
    </div>;
  if (hasError) {
    return errorFallback || defaultErrorFallback;
  }
  if (fill) {
    return (
      <div ref={containerRef} className="absolute inset-0">
        {isLoading && (placeholder || defaultPlaceholder)}
        {isVisible && (
          <img 
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            className={`absolute inset-0 w-full h-full object-cover ${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : loading}
            srcSet={createImageSrcSet(currentSrc)}
            sizes={sizes || getResponsiveSizes('card')}
          />
        )}
      </div>
    );
  }
  return <div ref={containerRef} className="relative">
      {isLoading && (placeholder || defaultPlaceholder)}
      
      {isVisible && <img ref={imgRef} src={currentSrc} alt={alt} className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} onLoad={handleLoad} onError={handleError} loading={priority ? 'eager' : loading} width={width} height={height} srcSet={createImageSrcSet(currentSrc)} sizes={sizes || getResponsiveSizes('card')} />}
    </div>;
};
export default LazyImage;