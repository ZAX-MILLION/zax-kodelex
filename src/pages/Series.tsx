import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Star, Clock, BookOpen, Eye, X, Plus, Minus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LazyImage from '@/components/LazyImage';
import { formatDistanceToNow } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Chapter {
  id: string;
  chapter_number: number;
  title?: string;
  release_date: string;
  is_locked: boolean;
}

interface SeriesData {
  id: string;
  title: string;
  author?: string;
  status: string;
  genres?: string[];
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
  rating_average?: number;
  rating_count?: number;
  latest_chapters: Chapter[];
  total_chapters: number;
}

type GenreState = 'normal' | 'include' | 'exclude';

const SeriesPage = () => {
  const [series, setSeries] = useState<SeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreStates, setGenreStates] = useState<Record<string, GenreState>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(24);
  const [allSeriesData, setAllSeriesData] = useState<SeriesData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // All available genres for filtering
  const allGenres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 
    'Supernatural', 'Thriller', 'Manga', 'Manhwa', 'Manhua', 'Novel'
  ];

  const fetchSeries = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('manga_meta')
        .select('*')
        .order('updated_at', { ascending: false });

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,alt_names.cs.{${searchTerm}}`
        );
      }

      const { data: seriesData, error } = await query;

      if (error) throw error;

      if (!seriesData || seriesData.length === 0) {
        setSeries([]);
        setAllSeriesData([]);
        setTotalCount(0);
        return;
      }

      const seriesWithChapters = await Promise.all(
        seriesData.map(async (seriesItem) => {
          const { data: chaptersData } = await supabase
            .from('chapters')
            .select('id, chapter_number, title, release_date, is_locked')
            .eq('series_id', seriesItem.id)
            .order('chapter_number', { ascending: false })
            .limit(2);

          const { count: totalChapters } = await supabase
            .from('chapters')
            .select('*', { count: 'exact', head: true })
            .eq('series_id', seriesItem.id);

          return {
            ...seriesItem,
            latest_chapters: chaptersData || [],
            total_chapters: totalChapters || 0,
          };
        })
      );

      const seriesWithChaptersFiltered = seriesWithChapters.filter(s => s.total_chapters > 0);
      
      setAllSeriesData(seriesWithChaptersFiltered);
      setSeries(seriesWithChaptersFiltered);
      setTotalCount(seriesWithChaptersFiltered.length);
    } catch (error) {
      console.error('Error fetching series:', error);
      toast({
        title: "Error",
        description: "Failed to load series data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, [searchTerm]);

  const handleGenreClick = (genre: string) => {
    const currentState = genreStates[genre] || 'normal';
    const nextState: GenreState = currentState === 'normal' ? 'include' : 
                                 currentState === 'include' ? 'exclude' : 'normal';
    
    setGenreStates(prev => ({
      ...prev,
      [genre]: nextState === 'normal' ? undefined : nextState
    }));
  };

  const getGenreIcon = (state: GenreState) => {
    switch (state) {
      case 'include': return <Plus className="h-3 w-3" />;
      case 'exclude': return <Minus className="h-3 w-3" />;
      default: return null;
    }
  };

  const getGenreColor = (state: GenreState) => {
    switch (state) {
      case 'include': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'exclude': return 'bg-red-500 hover:bg-red-600 text-white';
      default: return 'bg-muted hover:bg-muted/80';
    }
  };

  // Filter series based on genre states
  const filteredSeries = useMemo(() => {
    const includedGenres = Object.entries(genreStates)
      .filter(([_, state]) => state === 'include')
      .map(([genre]) => genre);
    
    const excludedGenres = Object.entries(genreStates)
      .filter(([_, state]) => state === 'exclude')
      .map(([genre]) => genre);

    return allSeriesData.filter(item => {
      const itemGenres = item.genres || [];
      
      if (excludedGenres.length > 0) {
        const hasExcludedGenre = excludedGenres.some(genre => itemGenres.includes(genre));
        if (hasExcludedGenre) return false;
      }
      
      if (includedGenres.length > 0) {
        const hasIncludedGenre = includedGenres.some(genre => itemGenres.includes(genre));
        if (!hasIncludedGenre) return false;
      }
      
      return true;
    });
  }, [allSeriesData, genreStates]);

  const displayedSeries = filteredSeries.slice(0, displayLimit);
  const hasMoreToShow = displayLimit < filteredSeries.length;

  const clearAllFilters = () => {
    setGenreStates({});
    setSearchTerm('');
  };

  const loadMoreSeries = () => {
    setDisplayLimit(prev => prev + 24);
  };

  const activeFilterCount = Object.values(genreStates).filter(state => state !== undefined).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">All Manga Series</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover and explore our complete collection of manga series. From action-packed adventures to heartwarming romances.
            </p>
            <div className="text-sm text-muted-foreground">
              Showing {displayedSeries.length} of {filteredSeries.length} series ({totalCount} total with chapters)
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search series by title, author, or description..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Genre Filtering</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearAllFilters}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Click once to <span className="text-green-600 font-medium">include</span></p>
                      <p>• Click twice to <span className="text-red-600 font-medium">exclude</span></p>
                      <p>• Click third time to remove filter</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {allGenres.map(genre => {
                        const state = genreStates[genre] || 'normal';
                        return (
                          <Button
                            key={genre}
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenreClick(genre)}
                            className={`text-xs justify-start ${getGenreColor(state)}`}
                          >
                            {getGenreIcon(state)}
                            <span className="ml-1">{genre}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(genreStates).map(([genre, state]) => {
                  if (!state || state === 'normal') return null;
                  return (
                    <Badge 
                      key={genre}
                      className={state === 'include' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
                    >
                      {getGenreIcon(state)}
                      <span className="ml-1">{genre}</span>
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => handleGenreClick(genre)}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-[3/4] bg-muted animate-pulse" />
                  <CardHeader>
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSeries.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-2">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">No series found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || activeFilterCount > 0
                    ? "Try adjusting your search or filters"
                    : "Check back later for new content!"
                  }
                </p>
              </div>
            </Card>
          ) : (
            /* Series Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedSeries.map((item) => (
                <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <Link to={`/series/${item.id}`} className="block">
                    {/* Cover Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <LazyImage 
                        src={item.cover_image_url || '/placeholder.svg'} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className={`text-xs ${
                          item.status === 'ongoing' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {item.status === 'ongoing' ? 'ONGOING' : 'COMPLETED'}
                        </Badge>
                      </div>
                      
                      {/* Rating */}
                      <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating_average?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>
                    
                    <CardHeader className="space-y-2">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </CardTitle>
                      
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {item.total_chapters} ch
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.view_count || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      
                      {/* Description */}
                      <CardDescription className="line-clamp-2 text-xs">
                        {item.description || 'No description available.'}
                      </CardDescription>
                      
                      {/* Genres */}
                      {item.genres && item.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.genres.slice(0, 3).map((genre) => (
                            <Badge key={genre} variant="outline" className="text-xs">
                              {genre}
                            </Badge>
                          ))}
                          {item.genres.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.genres.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Latest Chapters with Status Badges */}
                      {item.latest_chapters.length > 0 && (
                        <div className="space-y-1">
                          <h4 className="text-xs font-semibold text-muted-foreground">Latest Chapters</h4>
                          {item.latest_chapters.map((chapter) => (
                            <div 
                              key={chapter.id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!chapter.is_locked) {
                                  navigate(`/series/${item.id}/chapter/${chapter.chapter_number}`);
                                }
                              }}
                              className="flex items-center justify-between px-2 py-1 bg-muted rounded text-xs cursor-pointer hover:bg-muted/80 transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <span>Ch.{chapter.chapter_number}</span>
                                {chapter.title && <span>: {chapter.title}</span>}
                                {/* Status Badge */}
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] px-1 py-0 ${
                                    chapter.is_locked 
                                      ? 'bg-red-100 text-red-700 border-red-200' 
                                      : 'bg-green-100 text-green-700 border-green-200'
                                  }`}
                                >
                                  {chapter.is_locked ? 'Locked' : 'Free'}
                                </Badge>
                              </span>
                              <span className="text-muted-foreground">
                                {formatDistanceToNow(new Date(chapter.release_date), { addSuffix: true })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMoreToShow && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={loadMoreSeries} 
                size="lg" 
                className="px-8"
                variant="outline"
              >
                Load More ({filteredSeries.length - displayLimit} remaining)
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeriesPage;
