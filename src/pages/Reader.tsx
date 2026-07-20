import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMangaData, useReadingProgress, useBookmarks } from '@/hooks/useMangaData';
import { useSeriesChapters } from '@/hooks/useSeriesChapters';
import { useChapterPages } from '@/hooks/useChapterPages';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import ChapterComments from '@/components/ChapterComments';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  SkipBack, 
  SkipForward,
  Home,
  List,
  BookOpen,
  Scroll,
  Bookmark,
  BookmarkCheck,
  Loader2,
  Columns3,
  Monitor,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { WebtoonReader } from '@/components/reader/WebtoonReader';
import { supabase } from '@/integrations/supabase/client';
import readerBackground from '@/assets/reader-bg.jpg';

const Reader = () => {
  const { chapterId, seriesId, chapterNumber } = useParams<{ chapterId?: string; seriesId?: string; chapterNumber?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [detectedSeriesId, setDetectedSeriesId] = useState<string | null>(seriesId || null);
  
  // First try to get chapters using the seriesId from URL params, or detect it from the chapterId
  const { chapters: seriesChapters, loading: seriesLoading } = useSeriesChapters(detectedSeriesId || undefined);
  const { chapters: allChapters, loading: allLoading } = useMangaData();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { updateProgress } = useReadingProgress(user?.id);
  const { bookmarks, toggleBookmark } = useBookmarks(user?.id);
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebtoonMode, setIsWebtoonMode] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isColumnMode, setIsColumnMode] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(25); // Percentage 10-100%
  
  // Auto-detect series ID from chapter if not provided in URL
  useEffect(() => {
    if (chapterId && !detectedSeriesId) {
      console.log('📍 Detecting series ID for chapter:', chapterId);
      const chapterFromAll = allChapters.find(c => c.id === chapterId);
      if (chapterFromAll) {
        console.log('📍 Found chapter in allChapters:', chapterFromAll);
        // Get the series_id from the chapter data by making a direct query
        const detectSeriesFromChapter = async () => {
          try {
            console.log('📍 Querying database for chapter series_id...');
            const { data, error } = await supabase
              .from('chapters')
              .select('series_id')
              .eq('id', chapterId)
              .single();
            
            if (data && !error) {
              console.log('📍 Detected series ID:', data.series_id);
              setDetectedSeriesId(data.series_id);
            } else {
              console.error('📍 Failed to detect series ID:', error);
            }
          } catch (err) {
            console.error('Error detecting series from chapter:', err);
          }
        };
        detectSeriesFromChapter();
      } else {
        console.log('📍 Chapter not found in allChapters, total chapters:', allChapters.length);
      }
    }
  }, [chapterId, detectedSeriesId, allChapters]);
  
  // Use the appropriate chapters and loading state
  const chapters = detectedSeriesId ? seriesChapters : allChapters;
  const loading = detectedSeriesId ? seriesLoading : allLoading;
  
  // Get chapter pages specifically for this chapter
  const { pages: chapterPages, loading: pagesLoading } = useChapterPages(chapterId);
  
  // Find chapter by ID or by series + chapter number
  const chapter = chapterId 
    ? chapters.find(c => c.id === chapterId)
    : chapters.find(c => c.chapter_number === parseInt(chapterNumber || '0'));

  // Debug logging
  useEffect(() => {
    console.log('📍 Reader Debug Info:');
    console.log('- chapterId:', chapterId);
    console.log('- detectedSeriesId:', detectedSeriesId);
    console.log('- chapters count:', chapters.length);
    console.log('- chapter found:', !!chapter);
    console.log('- chapterPages count:', chapterPages.length);
    console.log('- loading states:', { loading, pagesLoading });
    if (chapter) {
      console.log('- chapter details:', { id: chapter.id, title: chapter.title, chapter_number: chapter.chapter_number });
    }
  }, [chapterId, detectedSeriesId, chapters, chapter, chapterPages, loading, pagesLoading]);
  
  // Use chapter pages from the hook, fallback to chapter.pages if available
  const pages = chapterPages.length > 0 ? chapterPages : (chapter?.pages || []);
  
  const initialPage = parseInt(searchParams.get('page') || '0');

  // Check if chapter is early access or premium only
  const isEarlyAccess = chapter ? (() => {
    const releaseTime = new Date(chapter.release_date).getTime();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return releaseTime > sevenDaysAgo;
  })() : false;

  const isPremiumOnly = chapter ? chapter.chapter_number % 5 === 0 : false;

  // Check if user can access this chapter
  const canAccessChapter = () => {
    if (!chapter) return false;
    if (isPremiumOnly && !isPremium) return false;
    if (isEarlyAccess && !isPremium) return false;
    return true;
  };
  
  useEffect(() => {
    if (initialPage > 0 && pages.length > 0) {
      setCurrentPageIndex(Math.min(initialPage, pages.length - 1));
    }
  }, [initialPage, pages]);
  
  useEffect(() => {
    if (chapter && user && pages.length > 0) {
      updateProgress(chapter.id, currentPageIndex, pages.length);
    }
  }, [currentPageIndex, chapter, user, updateProgress, pages]);

  useEffect(() => {
    // Auto-hide controls after 3 seconds on desktop, 5 seconds on mobile
    const timer = setTimeout(() => {
      setShowControls(false);
    }, isMobile ? 5000 : 3000);
    
    return () => clearTimeout(timer);
  }, [showControls, isMobile]);

  // Swipe gesture handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobile) goToNextPage();
    },
    onSwipedRight: () => {
      if (isMobile) goToPreviousPage();
    },
    onTap: () => {
      if (isMobile) setShowControls(!showControls);
    },
    preventScrollOnSwipe: true,
    trackMouse: false
  });

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      goToPreviousPage();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      goToNextPage();
    } else if (e.key === ' ') {
      e.preventDefault();
      setShowControls(!showControls);
    }
  }, [showControls]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (loading || pagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-reader-bg">
        <Loader2 className="h-8 w-8 animate-spin text-manga-red" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-reader-bg">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Chapter Not Found</h1>
          <Button onClick={() => navigate('/')} variant="manga">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  // All chapters are now accessible through coin system

  if (pages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-reader-bg">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Demo preview</h1>
          <p className="text-muted-foreground mb-4">
            Chapter pages are not included in the demo. Browse series covers and the library UI instead.
          </p>
          <Button onClick={() => navigate('/')} variant="manga">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      setShowControls(true);
    } else {
      // Go to next chapter
      const currentChapterIndex = chapters.findIndex(c => c.id === chapterId);
      if (currentChapterIndex < chapters.length - 1) {
        const nextChapter = chapters[currentChapterIndex + 1];
        navigate(`/reader/${nextChapter.id}`);
      }
    }
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      setShowControls(true);
    } else {
      // Go to previous chapter
      const currentChapterIndex = chapters.findIndex(c => c.id === chapterId);
      if (currentChapterIndex > 0) {
        const prevChapter = chapters[currentChapterIndex - 1];
        navigate(`/reader/${prevChapter.id}?page=${prevChapter.page_count - 1}`);
      }
    }
  };

  const goToNextChapter = () => {
      const currentChapterIndex = chapters.findIndex(c => c.id === chapterId);
      if (currentChapterIndex < chapters.length - 1) {
        const nextChapter = chapters[currentChapterIndex + 1];
        navigate(`/reader/${nextChapter.id}`);
      }
  };

  const goToPreviousChapter = () => {
    const currentChapterIndex = chapters.findIndex(c => c.id === chapterId);
    if (currentChapterIndex > 0) {
      const prevChapter = chapters[currentChapterIndex - 1];
      navigate(`/reader/${prevChapter.id}`);
    }
  };

  const progressPercentage = ((currentPageIndex + 1) / pages.length) * 100;
  const currentChapterIndex = chapters.findIndex(c => c.id === chapterId);
  const hasNextChapter = currentChapterIndex < chapters.length - 1;
  const hasPrevChapter = currentChapterIndex > 0;

  // Use WebtoonReader as the default and only reading mode
  return (
    <WebtoonReader
      pages={pages}
      currentPage={currentPageIndex}
      onPageChange={setCurrentPageIndex}
      onNavigateHome={() => navigate('/')}
      onNavigateChapterList={() => navigate('/chapters')}
      onPreviousChapter={goToPreviousChapter}
      onNextChapter={goToNextChapter}
      hasPreviousChapter={hasPrevChapter}
      hasNextChapter={hasNextChapter}
      chapterTitle={chapter.title}
      chapterNumber={chapter.chapter_number}
    />
  );
};

export default Reader;