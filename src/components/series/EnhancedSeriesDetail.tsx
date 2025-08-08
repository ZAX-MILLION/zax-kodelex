import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeriesComments } from './SeriesComments';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import FuturisticSeriesHero from './FuturisticSeriesHero';
import FuturisticChapterList from './FuturisticChapterList';

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
  thumbnail_url: string;
}

interface Rating {
  id: string;
  rating: number;
  review: string;
  user_id: string;
  created_at: string;
  profiles: {
    username: string;
  } | null;
}

const EnhancedSeriesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [series, setSeries] = useState<MangaSeries | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number>(0);
  const [userReview, setUserReview] = useState<string>('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reverseOrder, setReverseOrder] = useState(true); // Default to largest numbers first (15, 14, 13...)

  useEffect(() => {
    if (id) {
      fetchSeriesData();
    }
  }, [id]);

  const fetchSeriesData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Fetch series data
      const { data: seriesData, error: seriesError } = await supabase
        .from('manga_meta')
        .select('*')
        .eq('id', id)
        .single();

      if (seriesError) throw seriesError;

      // Increment view count
      if (seriesData) {
        await supabase
          .from('manga_meta')
          .update({ view_count: (seriesData.view_count || 0) + 1 })
          .eq('id', id);
      }

      // Fetch chapters (no default ordering, will be handled in component)
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('series_id', id);

      if (chaptersError) throw chaptersError;

      // Fetch ratings without join to avoid relation errors
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('manga_ratings')
        .select('*')
        .eq('manga_id', id)
        .order('created_at', { ascending: false });

      if (ratingsError) throw ratingsError;

      // Transform ratings data to include mock usernames
      const transformedRatings = (ratingsData || []).map(rating => ({
        ...rating,
        profiles: {
          username: `User${rating.user_id.slice(-4)}`
        }
      }));

      // Check if user has bookmarked this series
      if (user) {
        const { data: bookmarkData } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        setIsBookmarked(!!bookmarkData);
      }

      setSeries(seriesData);
      setChapters(chaptersData || []);
      setRatings(transformedRatings);

      // Set user's existing rating if any
      if (user && transformedRatings) {
        const existingRating = transformedRatings.find(r => r.user_id === user.id);
        if (existingRating) {
          setUserRating(existingRating.rating);
          setUserReview(existingRating.review || '');
        }
      }

    } catch (error) {
      console.error('Error fetching series data:', error);
      toast({
        title: "Error",
        description: "Failed to load series data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!user || !userRating) return;

    try {
      const { error } = await supabase
        .from('manga_ratings')
        .upsert({
          manga_id: id!,
          user_id: user.id,
          rating: userRating,
          review: userReview
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rating submitted successfully",
      });

      fetchSeriesData(); // Refresh data
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive"
      });
    }
  };

  const toggleBookmark = async () => {
    if (!user) return;

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
        setIsBookmarked(false);
        toast({
          title: "Success",
          description: "Removed from bookmarks",
        });
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            chapter_id: chapters[0]?.id || '', // Use first chapter for bookmark
            page_number: 1,
            note: `Bookmarked ${series?.title}`
          });

        if (error) throw error;
        setIsBookmarked(true);
        toast({
          title: "Success",
          description: "Added to bookmarks",
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            {/* Loading Hero */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
              <div className="xl:col-span-2">
                <div className="bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="aspect-[3/4] bg-muted/50 rounded-xl"></div>
                </div>
              </div>
              <div className="xl:col-span-3 space-y-6">
                <div className="h-16 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl"></div>
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gradient-to-br from-card/60 to-card/20 rounded-xl"></div>
                  ))}
                </div>
                <div className="h-32 bg-gradient-to-br from-card/60 to-card/20 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-12">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-3xl font-bold mb-2">Series not found</h1>
            <p className="text-muted-foreground">The series you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5">
      <FuturisticSeriesHero 
        series={series}
        chaptersCount={chapters.length}
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
        user={user}
      />

      {/* Enhanced Tabs Section */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="chapters" className="w-full">
          <div className="relative mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-xl border border-white/10 rounded-xl p-2">
              <TabsTrigger 
                value="chapters" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white font-semibold rounded-lg transition-all duration-300"
              >
                Chapters ({chapters.length})
              </TabsTrigger>
              <TabsTrigger 
                value="comments"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white font-semibold rounded-lg transition-all duration-300"
              >
                Comments
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chapters" className="space-y-6">
            <FuturisticChapterList 
              chapters={chapters}
              reverseOrder={reverseOrder}
              onToggleOrder={() => setReverseOrder(!reverseOrder)}
            />
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <SeriesComments seriesId={id!} seriesTitle={series.title} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedSeriesDetail;
