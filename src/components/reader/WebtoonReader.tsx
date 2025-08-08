import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Home, List, Settings } from 'lucide-react';
import { ChapterSettings } from './ChapterSettings';
import { useChapterLayout } from '@/hooks/useChapterLayout';

interface WebtoonReaderProps {
  pages: string[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onNavigateHome: () => void;
  onNavigateChapterList: () => void;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
  hasPreviousChapter: boolean;
  hasNextChapter: boolean;
  chapterTitle: string;
  chapterNumber: number;
}

export const WebtoonReader = ({
  pages,
  currentPage,
  onPageChange,
  onNavigateHome,
  onNavigateChapterList,
  onPreviousChapter,
  onNextChapter,
  hasPreviousChapter,
  hasNextChapter,
  chapterTitle,
  chapterNumber
}: WebtoonReaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [boxedWidth, setBoxedWidth] = useState(() => {
    const stored = localStorage.getItem('manga-boxed-width');
    // Default to true (boxed) unless explicitly set to 'false'
    return stored === null ? true : stored === 'true';
  });
  
  const { imageGap, imageFit, imageScale } = useChapterLayout();
  
  // Map ImageFit to valid CSS objectFit values
  const getObjectFit = (fit: string): 'contain' | 'cover' | 'fill' | 'scale-down' | 'none' => {
    switch (fit) {
      case 'contain': return 'contain';
      case 'width': return 'cover';
      case 'height': return 'cover';
      case 'auto': return 'none';
      default: return 'contain';
    }
  };

  // Update current page based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const containerTop = containerRef.current.scrollTop;
      const containerHeight = containerRef.current.clientHeight;
      const threshold = containerHeight * 0.5; // 50% of viewport

      for (let i = 0; i < pageRefs.current.length; i++) {
        const pageEl = pageRefs.current[i];
        if (!pageEl) continue;

        const pageTop = pageEl.offsetTop - containerTop;
        const pageBottom = pageTop + pageEl.offsetHeight;

        // Check if page is in the middle of viewport
        if (pageTop <= threshold && pageBottom >= threshold) {
          if (i !== currentPage) {
            onPageChange(i);
          }
          break;
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentPage, onPageChange]);

  // Auto-scroll to current page when it changes externally
  useEffect(() => {
    const pageEl = pageRefs.current[currentPage];
    if (pageEl && containerRef.current) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentPage]);

  // Listen for boxed width changes
  useEffect(() => {
    const handleBoxedWidthChange = (event: CustomEvent) => {
      setBoxedWidth(event.detail);
    };

    window.addEventListener('boxedWidthChange', handleBoxedWidthChange as EventListener);
    return () => {
      window.removeEventListener('boxedWidthChange', handleBoxedWidthChange as EventListener);
    };
  }, []);

  const progressPercentage = ((currentPage + 1) / pages.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <Card className="fixed top-0 left-0 right-0 z-50 rounded-none border-b bg-background/95 backdrop-blur-sm">
        <div className="w-full px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-4 min-w-0">
              <Button variant="ghost" size="sm" onClick={onNavigateHome} className="px-2 sm:px-3">
                <Home className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onNavigateChapterList} className="px-2 sm:px-3">
                <List className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Chapters</span>
              </Button>
            </div>
            
            <div className="text-center min-w-0 flex-1 mx-2">
              <h1 className="font-bold text-sm sm:text-lg truncate">Ch. {chapterNumber}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">{chapterTitle}</p>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {currentPage + 1}/{pages.length}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="px-2"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 sm:mt-3">
            <Progress value={progressPercentage} className="h-1" />
          </div>
        </div>
      </Card>

      {/* Webtoon Pages Container - Seamless vertical flow */}
      <div 
        ref={containerRef}
        className="pt-16 sm:pt-20 pb-16 sm:pb-20 overflow-y-auto overflow-x-hidden"
        style={{ height: '100vh' }}
      >
        <div className={boxedWidth ? "max-w-4xl mx-auto" : "w-full"}>
          {/* No gaps between images - seamless webtoon experience */}
          {pages.map((page, index) => (
            <div
              key={index}
              ref={(el) => (pageRefs.current[index] = el)}
              className="w-full block"
              style={{ marginBottom: `${imageGap}px` }}
            >
              <img
                src={typeof page === 'string' ? page : ''}
                alt={`Page ${index + 1}`}
                loading={index < 3 ? 'eager' : 'lazy'}
                className="block mx-auto"
                style={{ 
                  width: '100%',
                  height: 'auto',
                  maxWidth: boxedWidth ? '100%' : '100vw',
                  objectFit: getObjectFit(imageFit),
                  display: 'block',
                  transform: `scale(${imageScale / 100})`,
                  transformOrigin: 'top center'
                }}
                onLoad={() => {
                  // Ensure the page is visible once loaded
                  console.log(`Page ${index + 1} loaded successfully`);
                }}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  console.error(`Failed to load page ${index + 1}:`, page);
                  target.src = '/placeholder.svg';
                  target.style.opacity = '0.7';
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Footer */}
      <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-none border-t bg-background/95 backdrop-blur-sm">
        <div className="w-full px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousChapter}
              disabled={!hasPreviousChapter}
              className="px-2 sm:px-4"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            
            <div className="text-center min-w-0 flex-1">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {currentPage + 1}/{pages.length}
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                {Math.round(progressPercentage)}% Complete
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onNextChapter}
              disabled={!hasNextChapter}
              className="px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Chapter Settings Panel */}
      <ChapterSettings 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  );
};