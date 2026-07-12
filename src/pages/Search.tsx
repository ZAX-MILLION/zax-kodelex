import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Eye, Clock } from 'lucide-react';
import { useSeriesData } from '@/hooks/useHomepageData';
import LazyImage from '@/components/LazyImage';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const { series, fetchSeries, loading } = useSeriesData();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    fetchSeries('latest', 100); // Fetch more series for search
  }, []);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    
    if (query && series.length > 0) {
      const filtered = series.filter(s => 
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        (s.author && s.author.toLowerCase().includes(query.toLowerCase())) ||
        (s.description && s.description.toLowerCase().includes(query.toLowerCase())) ||
        (s.genres && s.genres.some(g => g.toLowerCase().includes(query.toLowerCase())))
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [searchParams, series]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search manga, authors, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 h-12 bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl"
            />
            <Button type="submit" className="absolute right-2 top-2 h-8 px-4" size="sm">
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-muted rounded-t-lg"></div>
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {searchQuery ? (
                results.length > 0 ? (
                  `Found ${results.length} result${results.length === 1 ? '' : 's'} for "${searchQuery}"`
                ) : (
                  `No results found for "${searchQuery}"`
                )
              ) : (
                'Enter a search term to find manga series'
              )}
            </p>
          </div>

          {/* Results Grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map(series => (
                <SearchResultCard key={series.id} series={series} searchQuery={searchQuery} />
              ))}
            </div>
          ) : searchQuery && !loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <BookOpen className="h-12 w-12 mx-auto mb-2" />
                No manga found
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Try searching with different keywords or check the spelling
              </p>
              <Button variant="outline" asChild>
                <Link to="/browse">Browse All Series</Link>
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

const SearchResultCard = ({ series, searchQuery }: { series: any, searchQuery: string }) => {
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  };

  return (
    <Card className="group overflow-hidden bg-card/95 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border/50 hover:border-primary/30">
      <Link to={`/series/${series.id}`} className="block">
        {/* Cover Image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
          <LazyImage 
            src={series.cover_image_url || '/placeholder.svg'} 
            alt={series.title} 
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" 
          />
          
          {/* Status badge */}
          <div className="absolute bottom-2 left-2">
            <Badge className={`text-xs font-semibold px-2 py-1 ${
              series.status === 'ongoing' 
                ? 'bg-green-500/90 text-white' 
                : series.status === 'completed'
                ? 'bg-blue-500/90 text-white'
                : 'bg-orange-500/90 text-white'
            }`}>
              {series.status === 'ongoing' ? 'Ongoing' : 
               series.status === 'completed' ? 'Completed' : 'Mass Released'}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Title with highlighting */}
          <h3 
            className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors duration-300"
            dangerouslySetInnerHTML={{ __html: highlightMatch(series.title, searchQuery) }}
          />
          
          {/* Author with highlighting */}
          {series.author && (
            <p 
              className="text-xs text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: `by ${highlightMatch(series.author, searchQuery)}` }}
            />
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {(series.view_count || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {series.latest_chapter || 0} ch
            </div>
          </div>

          {/* Genres */}
          {series.genres && series.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {series.genres.slice(0, 2).map((genre: string, index: number) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs"
                  dangerouslySetInnerHTML={{ __html: highlightMatch(genre, searchQuery) }}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
};

export default SearchResults;