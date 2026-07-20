import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SeriesComments } from './SeriesComments';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Eye, BookOpen, Heart, Share2, Play, Coins, Crown } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import ModernChapterGrid from './ModernChapterGrid';
import { getOptimizedImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';
import {
  activateDemoMode,
  getDemoChaptersForSeries,
  getDemoSeriesById,
  isDemoSeriesId,
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
          setSeries({
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
          });
          setChapters(
            getDemoChaptersForSeries(id).map((chapter) => ({
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
            }))
          );
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
        setSeries({
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
        });
        setChapters(
          getDemoChaptersForSeries(demoSeries.id).map((chapter) => ({
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
          }))
        );
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
    return <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            {/* Loading Hero */}
            <div className="h-96 bg-gradient-to-r from-muted/50 to-muted/20 rounded-3xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-gradient-to-br from-muted/40 to-muted/10 rounded-2xl"></div>)}
            </div>
          </div>
        </div>
      </div>;
  }
  if (!series) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl border border-border/20 rounded-3xl p-16">
            <div className="text-8xl mb-6">🔍</div>
            <h1 className="text-4xl font-bold mb-4">Series not found</h1>
            <p className="text-muted-foreground text-lg">The series you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Redesigned Attractive Hero */}
      <div className="relative bg-gradient-to-br from-primary/20 via-background to-secondary/20 border-b border-border/10">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(var(--secondary)) 0%, transparent 50%)`
        }} />
        </div>
        
        <div className="relative container mx-auto px-4 py-8 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Enhanced Cover Section */}
            <div className="lg:col-span-3">
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
                
                <div className="relative">
                  <LazyImage src={getOptimizedImageUrl(series.cover_image_url || getFallbackCoverImage(series.id), 400, 600)} alt={series.title} className="w-full aspect-[3/4] object-cover rounded-2xl shadow-2xl border border-border/20 transform group-hover:scale-105 transition-transform duration-300" />
                  
                  {/* Floating Status Badge */}
                  <div className="absolute -top-3 -right-3">
                    <div className={`px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm border border-white/20 text-white font-semibold text-sm ${series.status === 'ongoing' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : series.status === 'completed' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : 'bg-gradient-to-r from-orange-500 to-amber-600'}`}>
                      {series.status.charAt(0).toUpperCase() + series.status.slice(1)}
                    </div>
                  </div>
                  
                  {/* Age Rating Badge */}
                  <div className="absolute bottom-3 left-3">
                    <div className="px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
                      {series.age_rating}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons under cover */}
              <div className="mt-6 flex flex-col gap-3">
                {chapters.length > 0 && (
                  <Button asChild size="lg" className="w-full gap-3 h-12 text-base font-semibold rounded-xl min-h-11">
                    <Link
                      to={`/reader/${series.id}/${
                        (() => {
                          try {
                            const raw = sessionStorage.getItem(`zax-demo-continue:${series.id}`);
                            const n = raw ? parseInt(raw, 10) : NaN;
                            if (Number.isFinite(n) && chapters.some((c) => c.chapter_number === n)) {
                              return n;
                            }
                          } catch {
                            /* ignore */
                          }
                          // Prefer earliest free chapter (not newest, which may be locked)
                          const chronological = [...chapters].sort(
                            (a, b) => a.chapter_number - b.chapter_number
                          );
                          const free = chronological.find(
                            (c) => c.access_type === 'free' || !c.is_locked
                          );
                          return (free || chronological[0]).chapter_number;
                        })()
                      }`}
                      onClick={() => {
                        try {
                          const chronological = [...chapters].sort(
                            (a, b) => a.chapter_number - b.chapter_number
                          );
                          const free = chronological.find(
                            (c) => c.access_type === 'free' || !c.is_locked
                          );
                          sessionStorage.setItem(
                            `zax-demo-continue:${series.id}`,
                            String((free || chronological[0]).chapter_number)
                          );
                        } catch {
                          /* ignore */
                        }
                      }}
                    >
                      <Play className="h-5 w-5" />
                      {(() => {
                        try {
                          const raw = sessionStorage.getItem(`zax-demo-continue:${series.id}`);
                          return raw ? 'Continue Reading' : 'Start Reading';
                        } catch {
                          return 'Start Reading';
                        }
                      })()}
                    </Link>
                  </Button>
                )}
                <Button onClick={toggleBookmark} size="lg" disabled={!user} className={`w-full gap-3 h-12 text-base font-semibold rounded-xl shadow-lg transition-all duration-300 ${isBookmarked ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 hover:shadow-xl hover:shadow-red-500/25' : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 hover:shadow-xl hover:shadow-primary/25'}`}>
                  <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Remove from Library' : 'Add to Library'}
                </Button>
                <div className="flex flex-wrap gap-2">
                  {chapters.some((c) => c.access_type === 'free' || !c.is_locked) && (
                    <Badge variant="secondary">Free chapter</Badge>
                  )}
                  {chapters.some((c) => c.access_type === 'coins' || (c.is_locked && c.unlock_cost > 0)) && (
                    <Badge variant="outline" className="gap-1">
                      <Coins className="h-3 w-3" />
                      Coin chapter
                    </Badge>
                  )}
                  {chapters.some((c) => c.access_type === 'premium') && (
                    <Badge variant="outline" className="gap-1">
                      <Crown className="h-3 w-3" />
                      Premium chapter
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Info Section */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Title Section */}
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl lg:text-6xl font-black bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent leading-tight">
                  {series.title}
                </h1>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-lg font-semibold text-muted-foreground">
                      By <span className="text-foreground">{series.author}</span>
                    </span>
                  </div>
                  
                  {series.artist && series.artist !== series.author && <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      <span className="text-lg font-semibold text-muted-foreground">
                        Art by <span className="text-foreground">{series.artist}</span>
                      </span>
                    </div>}
                </div>
                
                {/* Genre Tags */}
                <div className="flex flex-wrap gap-3">
                  {series.genres?.slice(0, 4).map((genre, index) => <span key={index} className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary font-medium rounded-full hover:from-primary/20 hover:to-primary/10 transition-all duration-300 cursor-pointer">
                      {genre}
                    </span>)}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/20 rounded-xl p-4 hover:from-card/90 hover:to-card/50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">{series.rating_average?.toFixed(1) || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">Rating</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/20 rounded-xl p-4 hover:from-card/90 hover:to-card/50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Eye className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">{(series.view_count || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/20 rounded-xl p-4 hover:from-card/90 hover:to-card/50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <BookOpen className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">{chapters.length}</div>
                      <div className="text-xs text-muted-foreground">Chapters</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/20 rounded-xl p-4 hover:from-card/90 hover:to-card/50 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Heart className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-xl font-bold">{series.rating_count || 0}</div>
                      <div className="text-xs text-muted-foreground">Reviews</div>
                    </div>
                  </div>
                </div>
              </div>

              
              {/* Description */}
              {series.description && <div className="bg-gradient-to-r from-card/60 to-card/30 backdrop-blur-xl border border-border/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full" />
                    Synopsis
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {series.description}
                  </p>
                </div>}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="chapters" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
            <TabsTrigger value="chapters" className="text-sm">
              Chapters ({chapters.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-sm">
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chapters" className="mt-0">
            <ModernChapterGrid chapters={chapters} seriesId={series.id} />
          </TabsContent>

          <TabsContent value="comments" className="mt-0">
            <div className="bg-card/50 border border-border/20 rounded-lg p-6">
              <SeriesComments seriesId={id!} seriesTitle={series.title} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default ModernSeriesDetail;