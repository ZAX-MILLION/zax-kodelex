import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Lock, Eye, Clock, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LazyImage from '@/components/LazyImage';
import { getOptimizedImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';
import { formatTimeAgo } from '@/utils/dateFormatting';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import ChapterAccessHandler from '@/components/ChapterAccessHandler';
import { getDemoChaptersForSeries, isDemoSeriesId } from '@/utils/demoLibraryData';
interface ChapterInfo {
  id: string;
  chapter_number: number;
  title: string;
  created_at: string;
  is_locked: boolean;
}
interface SeriesData {
  id: string;
  title: string;
  author?: string;
  artist?: string;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  genres?: string[];
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
  rating_average?: number;
  rating_count?: number;
  content_type?: 'manga' | 'novel';
}
interface EnhancedMangaCardProps {
  series: SeriesData;
  showMetadata?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}
export const EnhancedMangaCard = ({
  series,
  showMetadata = true,
  size = 'medium',
  className = ''
}: EnhancedMangaCardProps) => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const isNew = new Date(series.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

  // Size configurations
  const sizeConfig = {
    small: {
      aspect: 'aspect-[2/3]',
      textSize: 'text-xs',
      titleSize: 'text-sm',
      padding: 'p-2',
      imageSize: {
        width: 200,
        height: 300
      }
    },
    medium: {
      aspect: 'aspect-[3/4]',
      textSize: 'text-sm',
      titleSize: 'text-base',
      padding: 'p-3',
      imageSize: {
        width: 300,
        height: 400
      }
    },
    large: {
      aspect: 'aspect-[3/4]',
      textSize: 'text-base',
      titleSize: 'text-lg',
      padding: 'p-4',
      imageSize: {
        width: 400,
        height: 533
      }
    }
  };
  const config = sizeConfig[size];
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        if (isDemoSeriesId(series.id)) {
          const demoChapters = getDemoChaptersForSeries(series.id)
            .slice()
            .sort((a, b) => b.chapter_number - a.chapter_number)
            .slice(0, 2)
            .map((chapter) => ({
              id: chapter.id,
              chapter_number: chapter.chapter_number,
              title: chapter.title,
              created_at: chapter.created_at,
              is_locked: chapter.is_locked,
            }));
          setChapters(demoChapters);
          return;
        }

        // Fetch latest 2 chapters for this series
        const {
          data,
          error
        } = await supabase.from('chapters').select('id, chapter_number, title, created_at, is_locked').eq('series_id', series.id).order('chapter_number', {
          ascending: false
        }).limit(2);
        if (error) {
          console.error('Error fetching chapters:', error);
          setChapters([]);
        } else {
          setChapters(data || []);
        }
      } catch (err) {
        console.error('Error fetching chapters:', err);
        setChapters([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChapters();
  }, [series.id]);
  const optimizedCoverUrl = getOptimizedImageUrl(series.cover_image_url || getFallbackCoverImage(series.id), config.imageSize.width, config.imageSize.height);
  return <Card className={`group overflow-hidden bg-card/95 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border/50 hover:border-primary/30 ${className}`}>
      <Link to={`/series/${series.id}`} className="block h-full">
        {/* Cover Image with consistent aspect ratio */}
        <div className={`relative ${config.aspect} overflow-hidden bg-muted`}>
          <LazyImage src={optimizedCoverUrl} alt={series.title} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" fill width={config.imageSize.width} height={config.imageSize.height} sizes={size === 'small' ? '(max-width: 640px) 50vw, 25vw' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'} />
          
          {/* NEW indicator */}
          {isNew && <div className="absolute top-2 left-2">
              
            </div>}
          
          {/* Content Type Badge */}
          <div className="absolute top-2 right-2 hidden md:block">
            <Badge className={`text-xs font-bold uppercase tracking-wider px-2 py-1 shadow-lg ${series.genres?.includes('Novel') ? 'bg-purple-500/90 text-white' : series.genres?.includes('Manhua') ? 'bg-red-500/90 text-white' : series.genres?.includes('Manhwa') ? 'bg-blue-500/90 text-white' : 'bg-orange-500/90 text-white'}`}>
              {series.genres?.includes('Novel') ? 'NOVEL' : series.genres?.includes('Manhua') ? 'MANHUA' : series.genres?.includes('Manhwa') ? 'MANHWA' : 'MANGA'}
            </Badge>
          </div>
          
          {/* Rating badge */}
          {series.rating_average && <div className="absolute top-2 left-2 hidden md:flex bg-black/80 text-white px-2 py-1 rounded text-xs items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{series.rating_average.toFixed(1)}</span>
            </div>}
          
          {/* Status indicator */}
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${series.status === 'ongoing' ? 'bg-green-500' : series.status === 'completed' ? 'bg-blue-500' : series.status === 'hiatus' ? 'bg-orange-500' : 'bg-red-500'}`} />
              <span className="hidden lg:inline text-xs font-medium text-white bg-black/60 px-1 py-0.5 rounded">
                {series.status === 'ongoing' ? 'Ongoing' : series.status === 'completed' ? 'Complete' : series.status === 'hiatus' ? 'Hiatus' : 'Dropped'}
              </span>
            </div>
          </div>
        </div>

        {/* Content below image */}
        <CardContent className={`p-2 md:p-3 space-y-1 md:space-y-2 min-h-[72px] md:min-h-[100px] flex flex-col`}>
          {/* Title */}
          <h3 className={`font-bold text-sm md:text-base line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors duration-300`}>
            {series.title}
          </h3>
          
          {showMetadata && <>
              {/* Latest chapters */}
              <div className="flex-1">
                {loading ? <div className="animate-pulse space-y-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-6 bg-muted rounded" />
                  </div> : <div className="space-y-1">
                     {(() => {
                const chaptersToShow = (chapters.length > 0 ? chapters : [{
                  id: `${series.id}-fake-3`,
                  chapter_number: 3,
                  is_locked: true,
                  created_at: new Date().toISOString()
                }, {
                  id: `${series.id}-fake-2`,
                  chapter_number: 2,
                  is_locked: true,
                  created_at: new Date().toISOString()
                }]).slice(0, 2);
                return chaptersToShow.map((chapter, index) => <ChapterAccessHandler key={chapter.id} chapterId={chapter.id} chapterTitle={`Chapter ${chapter.chapter_number}`} isLocked={chapter.is_locked} onAccess={() => {
                  navigate(`/reader/${series.id}/${chapter.chapter_number}`);
                }}>
                            <div className={`w-full px-2 py-1 md:py-1.5 rounded text-xs md:text-sm font-semibold transition-all hover:scale-105 cursor-pointer bg-gray-600/90 text-white hover:bg-gray-500/90 min-h-[44px] md:min-h-0 flex items-center ${index > 0 ? 'hidden md:flex' : ''}`}>
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-1">
                                  <span>CH. {chapter.chapter_number}</span>
                                </div>
                                <div className="hidden md:flex items-center gap-1 text-xs opacity-80">
                                  {chapter.is_locked && <Lock className="h-3 w-3 text-yellow-400" />}
                                  {(() => {
                          const daysDiff = Math.floor((Date.now() - new Date(chapter.created_at).getTime()) / (1000 * 60 * 60 * 24));
                          const isRecent = daysDiff < 3;
                          if (isRecent) {
                            return <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="flex items-center gap-1 text-green-400">
                                                <Sparkles className="h-3 w-3" />
                                                <span className="text-green-400 font-semibold">NEW</span>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{formatDistanceToNow(new Date(chapter.created_at), {
                                      addSuffix: true
                                    })}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>;
                          } else {
                            return <>
                                          <Clock className="h-3 w-3" />
                                          <span>{formatTimeAgo(chapter.created_at)}</span>
                                        </>;
                          }
                        })()}
                                </div>
                              </div>
                            </div>
                          </ChapterAccessHandler>);
              })()}
                  </div>}
              </div>
            </>}
        </CardContent>
      </Link>
    </Card>;
};