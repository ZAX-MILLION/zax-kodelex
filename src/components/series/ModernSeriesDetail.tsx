import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SeriesComments } from './SeriesComments';
import { SeriesDetailsBackground } from './SeriesDetailsBackground';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Eye, BookOpen, Heart, Play, Coins, Crown } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import ModernChapterGrid from './ModernChapterGrid';
import { getOptimizedImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';
import {
  activateDemoMode,
  getDemoChaptersForSeries,
  getDemoSeriesById,
  isDemoSeriesId,
  type DemoSeries,
} from '@/utils/demoLibraryData';
import type { DemoAccessType } from '@/features/demo/data/demoChapterCatalog';
interface MangaSeries {
  id: string;
  title: string;
  description: string;
  author: string;
  artist: string;
  cover_image_url: string;
  status: string;
  genres: string[];
  tags: string[];
  rating_average: number;
  rating_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  age_rating: string;
  publication_date: string;
  details_background_url?: string | null;
}
interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  page_count: number;
  release_date: string;
  view_count: number;
  is_locked: boolean;
  unlock_cost: number;
  thumbnail_url: string;
  access_type?: DemoAccessType;
}

function mapDemoSeriesToDetail(demoSeries: DemoSeries): MangaSeries {
  return {
    id: demoSeries.id,
    title: demoSeries.title,
    description: demoSeries.description,
    author: demoSeries.author,
    artist: demoSeries.artist || demoSeries.author,
    cover_image_url: demoSeries.cover_image_url,
    status: demoSeries.status,
    genres: demoSeries.genres,
    tags: demoSeries.tags,
    rating_average: demoSeries.rating_average,
    rating_count: demoSeries.rating_count,
    view_count: demoSeries.view_count,
    created_at: demoSeries.created_at,
    updated_at: demoSeries.updated_at,
    age_rating: demoSeries.age_rating,
    publication_date: demoSeries.publication_date,
    details_background_url: demoSeries.details_background_url ?? null,
  };
}

function mapDemoChapters(demoSeries: DemoSeries, seriesId: string): Chapter[] {
  return getDemoChaptersForSeries(seriesId).map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    chapter_number: chapter.chapter_number,
    page_count: chapter.page_count,
    release_date: chapter.release_date,
    view_count: chapter.view_count,
    is_locked: chapter.is_locked,
    unlock_cost: chapter.unlock_cost,
    thumbnail_url: demoSeries.cover_image_url,
    access_type: chapter.access_type,
  }));
}

function getStartChapterNumber(chapters: Chapter[], seriesId: string): number {
  try {
    const raw = sessionStorage.getItem(`zax-demo-continue:${seriesId}`);
    const n = raw ? parseInt(raw, 10) : NaN;
    if (Number.isFinite(n) && chapters.some((c) => c.chapter_number === n)) {
      return n;
    }
  } catch {
    /* ignore */
  }
  const chronological = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number);
  const free = chronological.find((c) => c.access_type === 'free' || !c.is_locked);
  return (free || chronological[0]).chapter_number;
}

const ModernSeriesDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [series, setSeries] = useState<MangaSeries | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  useEffect(() => {
    if (id) {
      fetchSeriesData();
    }
  }, [id]);
  const fetchSeriesData = async () => {
    if (!id) return;
    try {
      setLoading(true);

      if (isDemoSeriesId(id)) {
        const demoSeries = getDemoSeriesById(id);
        if (demoSeries) {
          activateDemoMode();
          setSeries(mapDemoSeriesToDetail(demoSeries));
          setChapters(mapDemoChapters(demoSeries, id));
          return;
        }
      }

      const {
        data: seriesData,
        error: seriesError
      } = await supabase.from('manga_meta').select('*').eq('id', id).single();
      if (seriesError) throw seriesError;

      if (seriesData) {
        await supabase.from('manga_meta').update({
          view_count: (seriesData.view_count || 0) + 1
        }).eq('id', id);
      }

      const { data: chaptersData, error: chaptersError } = await supabase
        .rpc('get_series_chapter_listings', { series_id_param: id });

      if (chaptersError) throw chaptersError;

      const chaptersWithCost = chaptersData || [];

      if (user) {
        const {
          data: bookmarkData
        } = await supabase.from('bookmarks').select('id').eq('user_id', user.id).limit(1).single();
        setIsBookmarked(!!bookmarkData);
      }
      setSeries(seriesData);
      setChapters(chaptersWithCost || []);
    } catch (error) {
      console.error('Error fetching series data:', error);
      const demoSeries = id ? getDemoSeriesById(id) : undefined;
      if (demoSeries) {
        activateDemoMode();
        setSeries(mapDemoSeriesToDetail(demoSeries));
        setChapters(mapDemoChapters(demoSeries, demoSeries.id));
        return;
      }
      toast({
        title: "Error",
        description: "Failed to load series data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const toggleBookmark = async () => {
    if (!user) return;
    try {
      if (isBookmarked) {
        const {
          error
        } = await supabase.from('bookmarks').delete().eq('user_id', user.id);
        if (error) throw error;
        setIsBookmarked(false);
        toast({
          title: "Success",
          description: "Removed from bookmarks"
        });
      } else {
        const {
          error
        } = await supabase.from('bookmarks').insert({
          user_id: user.id,
          chapter_id: chapters[0]?.id || '',
          page_number: 1,
          note: `Bookmarked ${series?.title}`
        });
        if (error) throw error;
        setIsBookmarked(true);
        toast({
          title: "Success",
          description: "Added to bookmarks"
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return (
      <SeriesDetailsBackground seriesId={id || '_loading_'}>
        <div className="container mx-auto px-4 py-8 sm:py-10">
          <div className="animate-pulse space-y-6">
            <div className="mx-auto h-72 max-w-[220px] rounded-2xl bg-muted/40 sm:mx-0 sm:max-w-none sm:h-96 sm:rounded-3xl" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="h-10 max-w-xl rounded-xl bg-muted/30" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-muted/30" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </SeriesDetailsBackground>
    );
  }
  if (!series) {
    return (
      <SeriesDetailsBackground seriesId={id || '_missing_'}>
        <div className="container mx-auto px-4 py-12">
          <div className="rounded-3xl border border-border/30 bg-card/70 p-10 text-center backdrop-blur-xl sm:p-16">
            <div className="mb-6 text-6xl sm:text-8xl">🔍</div>
            <h1 className="mb-4 text-2xl font-bold sm:text-4xl">Series not found</h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              The series you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          </div>
        </div>
      </SeriesDetailsBackground>
    );
  }

  const startChapter = chapters.length > 0 ? getStartChapterNumber(chapters, series.id) : 1;
  let continueLabel = 'Start Reading';
  try {
    const raw = sessionStorage.getItem(`zax-demo-continue:${series.id}`);
    continueLabel = raw ? 'Continue Reading' : 'Start Reading';
  } catch {
    /* ignore */
  }

  return (
    <SeriesDetailsBackground
      seriesId={series.id}
      seriesCustomUrl={series.details_background_url}
    >
      <section className="border-b border-border/20">
        <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
          <div className="grid grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="mx-auto w-full max-w-[240px] sm:max-w-[280px] lg:col-span-4 lg:mx-0 lg:max-w-none xl:col-span-3">
              <div className="group relative">
                <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-60 blur-xl transition-opacity group-hover:opacity-90" />
                <div className="relative overflow-hidden rounded-2xl border border-border/30 shadow-2xl">
                  <LazyImage
                    src={getOptimizedImageUrl(
                      series.cover_image_url || getFallbackCoverImage(series.id),
                      400,
                      600
                    )}
                    alt={series.title}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
                    <Badge
                      className={`border border-white/20 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg sm:px-3 sm:text-xs ${
                        series.status === 'ongoing'
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                          : series.status === 'completed'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                            : 'bg-gradient-to-r from-orange-500 to-amber-600'
                      }`}
                    >
                      {series.status.charAt(0).toUpperCase() + series.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
                    <Badge className="border-0 bg-black/75 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm sm:text-xs">
                      {series.age_rating}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3 sm:mt-6">
                {chapters.length > 0 && (
                  <Button asChild size="lg" className="min-h-11 w-full gap-2 rounded-xl text-sm sm:text-base">
                    <Link
                      to={`/reader/${series.id}/${startChapter}`}
                      onClick={() => {
                        try {
                          sessionStorage.setItem(
                            `zax-demo-continue:${series.id}`,
                            String(startChapter)
                          );
                        } catch {
                          /* ignore */
                        }
                      }}
                    >
                      <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                      {continueLabel}
                    </Link>
                  </Button>
                )}
                <Button
                  onClick={toggleBookmark}
                  size="lg"
                  disabled={!user}
                  className={`min-h-11 w-full gap-2 rounded-xl text-sm font-semibold shadow-md transition-all sm:text-base ${
                    isBookmarked
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700'
                      : 'border border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Remove from Library' : 'Add to Library'}
                </Button>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {chapters.some((c) => c.access_type === 'free' || !c.is_locked) && (
                    <Badge variant="secondary" className="text-[11px] sm:text-xs">
                      Free chapter
                    </Badge>
                  )}
                  {chapters.some(
                    (c) => c.access_type === 'coins' || (c.is_locked && c.unlock_cost > 0)
                  ) && (
                    <Badge variant="outline" className="gap-1 text-[11px] sm:text-xs">
                      <Coins className="h-3 w-3" />
                      Coin chapter
                    </Badge>
                  )}
                  {chapters.some((c) => c.access_type === 'premium') && (
                    <Badge variant="outline" className="gap-1 text-[11px] sm:text-xs">
                      <Crown className="h-3 w-3" />
                      Premium chapter
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-0 space-y-5 sm:space-y-6 lg:col-span-8 xl:col-span-9">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="break-words text-2xl font-black leading-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
                  {series.title}
                </h1>

                <div className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:text-base">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span className="text-muted-foreground">
                      By <span className="font-semibold text-foreground">{series.author}</span>
                    </span>
                  </div>
                  {series.artist && series.artist !== series.author && (
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" />
                      <span className="text-muted-foreground">
                        Art by{' '}
                        <span className="font-semibold text-foreground">{series.artist}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {series.genres?.slice(0, 6).map((genre, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary sm:px-3 sm:py-1.5 sm:text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
                {[
                  {
                    icon: Star,
                    iconClass: 'fill-yellow-500 text-yellow-500',
                    bgClass: 'bg-yellow-500/15',
                    value: series.rating_average?.toFixed(1) || 'N/A',
                    label: 'Rating',
                  },
                  {
                    icon: Eye,
                    iconClass: 'text-blue-500',
                    bgClass: 'bg-blue-500/15',
                    value: (series.view_count || 0).toLocaleString(),
                    label: 'Views',
                  },
                  {
                    icon: BookOpen,
                    iconClass: 'text-green-500',
                    bgClass: 'bg-green-500/15',
                    value: String(chapters.length),
                    label: 'Chapters',
                  },
                  {
                    icon: Heart,
                    iconClass: 'text-purple-500',
                    bgClass: 'bg-purple-500/15',
                    value: String(series.rating_count || 0),
                    label: 'Reviews',
                  },
                ].map(({ icon: Icon, iconClass, bgClass, value, label }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border/25 bg-card/70 p-3 backdrop-blur-sm sm:p-4"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`rounded-lg p-1.5 sm:p-2 ${bgClass}`}>
                        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconClass}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-bold sm:text-xl">{value}</div>
                        <div className="text-[10px] text-muted-foreground sm:text-xs">{label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {series.description && (
                <div className="rounded-xl border border-border/25 bg-card/70 p-4 backdrop-blur-sm sm:p-6">
                  <h3 className="mb-2 flex items-center gap-2 text-base font-semibold sm:mb-3 sm:text-lg">
                    <span className="h-5 w-1 rounded-full bg-gradient-to-b from-primary to-secondary" />
                    Synopsis
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {series.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-5 sm:py-6">
        <Tabs defaultValue="chapters" className="w-full">
          <TabsList className="mb-5 grid h-auto w-full max-w-md grid-cols-2 gap-1 p-1 sm:mb-6">
            <TabsTrigger value="chapters" className="min-h-10 text-xs sm:text-sm">
              Chapters ({chapters.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="min-h-10 text-xs sm:text-sm">
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chapters" className="mt-0">
            <ModernChapterGrid chapters={chapters} seriesId={series.id} />
          </TabsContent>

          <TabsContent value="comments" className="mt-0">
            <div className="rounded-lg border border-border/25 bg-card/70 p-4 backdrop-blur-sm sm:p-6">
              <SeriesComments seriesId={id!} seriesTitle={series.title} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SeriesDetailsBackground>
  );
};
export default ModernSeriesDetail;