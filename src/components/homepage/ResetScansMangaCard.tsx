import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Lock, Eye } from 'lucide-react';
import { SeriesCard } from '@/hooks/useHomepageData';
import LazyImage from '@/components/LazyImage';
import { getOptimizedImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ChapterAccessHandler from '@/components/ChapterAccessHandler';

interface ResetScansMangaCardProps {
  series: SeriesCard;
  showMetadata?: boolean;
}

interface ChapterInfo {
  number: number;
  is_locked: boolean;
  created_at: string;
}

export const ResetScansMangaCard = ({ series, showMetadata = true }: ResetScansMangaCardProps) => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isNew = new Date(series.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000;

  // Always render - even if no chapters exist, show locked ones to entice users

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        // Fetch latest 2 chapters for this series
        const { data, error } = await supabase
          .from('chapters')
          .select('chapter_number, is_locked, created_at')
          .eq('series_id', series.id)
          .order('chapter_number', { ascending: false })
          .limit(2);

        if (error || !data || data.length === 0) {
          // No chapters found - show empty state
          setChapters([]);
        } else {
          const formattedChapters: ChapterInfo[] = data.map(ch => ({
            number: ch.chapter_number,
            is_locked: ch.is_locked || false,
            created_at: ch.created_at
          }));
          
          setChapters(formattedChapters);
        }
      } catch (err) {
        console.error('Error fetching chapters:', err);
        // No fallback - if error, show no chapters
        setChapters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [series.id, series.latest_chapter]);


  return (
    <Card className="group overflow-hidden bg-card/95 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border/50 hover:border-primary/30">
      <Link to={`/series/${series.id}`} className="block">
        {/* Cover Image - Square-ish with rounded corners */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-muted">
          <LazyImage 
            src={getOptimizedImageUrl(series.cover_image_url || getFallbackCoverImage(series.id), 300, 450)}
            alt={series.title} 
            className="transition-all duration-500 group-hover:scale-105" 
            fill
            width={300}
            height={450}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* NEW indicator */}
          {isNew && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-red-500/90 text-white text-xs font-bold px-2 py-1">
                NEW
              </Badge>
            </div>
          )}
          
          {/* Content Type Badge in corner (only show if exists) */}
          {(series as any).content_type && (
            <div className="absolute top-2 right-2">
              <Badge className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-primary/90 text-primary-foreground shadow-lg">
                {(series as any).content_type}
              </Badge>
            </div>
          )}
          
          {/* Status dot at bottom left */}
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                series.status === 'ongoing' 
                  ? 'bg-green-500' 
                  : series.status === 'completed'
                  ? 'bg-blue-500'
                  : series.status === 'hiatus'
                  ? 'bg-orange-500'
                  : 'bg-red-500'
              }`} />
              <span className="text-xs font-medium text-white bg-black/60 px-1 py-0.5 rounded">
                {series.status === 'ongoing' ? 'Ongoing' : 
                 series.status === 'completed' ? 'Complete' : 
                 series.status === 'hiatus' ? 'Hiatus' : 'Dropped'}
              </span>
            </div>
          </div>
        </div>

        {/* Content below image */}
        <div className="p-3 space-y-3">
          {/* Title */}
          <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {series.title}
          </h3>
          
          {showMetadata && (
            <>
              {/* Only show rating and views if series has chapters */}
              {chapters.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {(series.view_count || 0).toLocaleString()} views
                  </div>
                </div>
              )}

              {/* Chapter badges */}
              <div className="flex gap-1">
                {(() => {
                  console.log(`ResetScansMangaCard - Series ${series.id} (${series.title}): chapters found=${chapters.length}`);
                  // If we have real chapters, show them, otherwise show fake locked ones to entice users
                  const chaptersToShow = chapters.length > 0 ? chapters : [
                    { number: 3, is_locked: true, created_at: new Date().toISOString() },
                    { number: 2, is_locked: true, created_at: new Date().toISOString() }
                  ];
                  
                  return chaptersToShow.map((chapter, index) => (
                    <ChapterAccessHandler
                      key={index}
                      chapterId={`${series.id}-${chapter.number}`}
                      chapterTitle={`Chapter ${chapter.number}`}
                      isLocked={chapter.is_locked}
                      onAccess={() => {
                        const chapterSlug = `chapter-${chapter.number.toString().padStart(3, '0')}`;
                        navigate(`/read/${series.id}/${chapterSlug}`);
                      }}
                    >
                      <div className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-all hover:scale-105 cursor-pointer bg-gray-600/90 text-white hover:bg-gray-500/90`}>
                        <div className="flex items-center justify-between">
                          <span>CH. {chapter.number}</span>
                          {chapter.is_locked && <Lock className="h-3 w-3 text-yellow-400" />}
                        </div>
                      </div>
                    </ChapterAccessHandler>
                  ));
                })()}
              </div>
            </>
          )}
        </div>
      </Link>
    </Card>
  );
};