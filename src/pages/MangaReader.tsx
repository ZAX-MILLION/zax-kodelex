import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Home,
  List,
  BookOpen,
  Clock,
  Eye,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ReaderControls } from '@/components/reader/ReaderControls';
import { WebtoonReader } from '@/components/reader/WebtoonReader';
import { useChapterLayout } from '@/hooks/useChapterLayout';
import LazyImage from '@/components/LazyImage';
import { getOptimizedImageUrl } from '@/utils/imageOptimization';
import SEOHelmet from '@/components/SEOHelmet';

interface Chapter {
  id: string;
  series_id: string;
  chapter_number: number;
  title: string;
  pages: string[];
  page_count: number;
  release_date: string;
  view_count: number;
  is_locked: boolean;
  unlock_cost: number;
  content_type: 'image' | 'text';
  text_content?: string;
}

interface Series {
  id: string;
  title: string;
  cover_image_url: string;
  author: string;
}

const MangaReader = () => {
  const { seriesSlug, chapterSlug } = useParams<{ seriesSlug: string; chapterSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [series, setSeries] = useState<Series | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showReaderSettings, setShowReaderSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [readingStartTime] = useState(Date.now());
  
  const { 
    readingMode, 
    imageFit, 
    imageScale,
    loading: layoutLoading 
  } = useChapterLayout();

  // Load series and chapter data
  useEffect(() => {
    const loadData = async () => {
      if (!seriesSlug || !chapterSlug) return;

      try {
        setLoading(true);

        // Extract chapter number from slug (format: chapter-001)
        const chapterNumber = parseInt(chapterSlug.split('-')[1]);

        // Fetch series data
        const { data: seriesData, error: seriesError } = await supabase
          .from('manga_meta')
          .select('id, title, cover_image_url, author')
          .eq('id', seriesSlug)
          .single();

        if (seriesError) throw seriesError;
        setSeries(seriesData);

        // Fetch all chapters for navigation
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('series_id', seriesSlug)
          .order('chapter_number', { ascending: true });

        if (chaptersError) throw chaptersError;
        
        // Transform database data to match our interface
        const transformedChapters: Chapter[] = (chaptersData || []).map(ch => {
          // Handle pages field - it might be JSON string or array
          let pages: string[] = [];
          if (ch.pages) {
            if (typeof ch.pages === 'string') {
              try {
                const parsed = JSON.parse(ch.pages);
                pages = Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : [];
              } catch (e) {
                console.warn('Failed to parse pages JSON for chapter', ch.id, e);
                pages = [];
              }
            } else if (Array.isArray(ch.pages)) {
              pages = ch.pages.filter((p): p is string => typeof p === 'string');
            }
          }

          return {
            id: ch.id,
            series_id: ch.series_id,
            chapter_number: ch.chapter_number,
            title: ch.title,
            pages,
            page_count: pages.length || ch.page_count || 0,
            release_date: ch.release_date,
            view_count: ch.view_count,
            is_locked: ch.is_locked || false,
            unlock_cost: 0, // Default value
            content_type: (ch as any).content_type || 'image',
            text_content: (ch as any).text_content
          };
        });
        
        setChapters(transformedChapters);

        // Fetch current chapter
        const { data: chapterData, error: chapterError } = await supabase
          .from('chapters')
          .select('*')
          .eq('series_id', seriesSlug)
          .eq('chapter_number', chapterNumber)
          .single();

        if (chapterError) throw chapterError;
        
        // Transform database data to match our interface
        let pages: string[] = [];
        if (chapterData.pages) {
          if (typeof chapterData.pages === 'string') {
            try {
              const parsed = JSON.parse(chapterData.pages);
              pages = Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : [];
            } catch (e) {
              console.warn('Failed to parse pages JSON for chapter', chapterData.id, e);
              pages = [];
            }
          } else if (Array.isArray(chapterData.pages)) {
            pages = chapterData.pages.filter((p): p is string => typeof p === 'string');
          }
        }

        const transformedChapter: Chapter = {
          id: chapterData.id,
          series_id: chapterData.series_id,
          chapter_number: chapterData.chapter_number,
          title: chapterData.title,
          pages,
          page_count: pages.length || chapterData.page_count || 0,
          release_date: chapterData.release_date,
          view_count: chapterData.view_count,
          is_locked: chapterData.is_locked || false,
          unlock_cost: 0, // Default value
          content_type: (chapterData as any).content_type || 'image',
          text_content: (chapterData as any).text_content
        };

        console.log('Loaded chapter:', transformedChapter.title, 'with', transformedChapter.pages.length, 'pages');
        
        setChapter(transformedChapter);

        // Record chapter view using series_views table (since chapter_views doesn't exist)
        await supabase
          .from('series_views')
          .insert({
            series_id: seriesSlug,
            user_id: user?.id || null,
            ip_address: null,
            user_agent: navigator.userAgent,
            referrer: document.referrer || null
          });

        // Update chapter view count
        await supabase
          .from('chapters')
          .update({ view_count: (transformedChapter.view_count || 0) + 1 })
          .eq('id', transformedChapter.id);

      } catch (error) {
        console.error('Error loading reader data:', error);
        toast({
          title: "Error",
          description: "Failed to load chapter data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [seriesSlug, chapterSlug, user?.id, toast]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        goToPreviousPage();
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        goToNextPage();
      } else if (e.key === ' ') {
        e.preventDefault();
        setShowControls(!showControls);
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showControls]);

  // Auto-hide controls
  useEffect(() => {
    if (!showControls) return;
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [showControls]);

  const goToNextPage = useCallback(() => {
    if (!chapter) return;
    
    if (currentPageIndex < chapter.pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else {
      goToNextChapter();
    }
  }, [chapter, currentPageIndex]);

  const goToPreviousPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    } else {
      goToPreviousChapter();
    }
  }, [currentPageIndex]);

  const goToNextChapter = () => {
    if (!chapter || !chapters.length) return;
    
    const currentIndex = chapters.findIndex(c => c.id === chapter.id);
    if (currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];
      navigate(`/read/${seriesSlug}/chapter-${nextChapter.chapter_number.toString().padStart(3, '0')}`);
    }
  };

  const goToPreviousChapter = () => {
    if (!chapter || !chapters.length) return;
    
    const currentIndex = chapters.findIndex(c => c.id === chapter.id);
    if (currentIndex > 0) {
      const prevChapter = chapters[currentIndex - 1];
      navigate(`/read/${seriesSlug}/chapter-${prevChapter.chapter_number.toString().padStart(3, '0')}`);
      setCurrentPageIndex(0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const calculateReadTime = () => {
    if (!chapter) return '0 min';
    
    const wordsPerMinute = 200;
    const timePerPage = 30; // seconds
    
    if (chapter.content_type === 'text') {
      const wordCount = chapter.text_content?.split(' ').length || 0;
      const minutes = Math.ceil(wordCount / wordsPerMinute);
      return `${minutes} min`;
    } else {
      const minutes = Math.ceil((chapter.pages.length * timePerPage) / 60);
      return `${minutes} min`;
    }
  };

  const progressPercentage = chapter ? ((currentPageIndex + 1) / chapter.pages.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter || !series) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent>
            <h1 className="text-2xl font-bold mb-4">Chapter Not Found</h1>
            <p className="text-muted-foreground mb-6">The chapter you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/')} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentChapterIndex = chapters.findIndex(c => c.id === chapter.id);
  const hasNextChapter = currentChapterIndex < chapters.length - 1;
  const hasPrevChapter = currentChapterIndex > 0;

  // Use WebtoonReader as the default and only reading mode
  return (
    <div className="min-h-screen bg-background">
      <SEOHelmet 
        title={`${series.title} - Chapter ${chapter.chapter_number}: ${chapter.title}`}
        description={`Read ${series.title} Chapter ${chapter.chapter_number} online. ${chapter.title}`}
      />
      
      <WebtoonReader
        pages={chapter.pages}
        currentPage={currentPageIndex}
        onPageChange={setCurrentPageIndex}
        onNavigateHome={() => navigate('/')}
        onNavigateChapterList={() => navigate(`/series/${seriesSlug}`)}
        onPreviousChapter={goToPreviousChapter}
        onNextChapter={goToNextChapter}
        hasPreviousChapter={hasPrevChapter}
        hasNextChapter={hasNextChapter}
        chapterTitle={chapter.title}
        chapterNumber={chapter.chapter_number}
      />
    </div>
  );
};

export default MangaReader;