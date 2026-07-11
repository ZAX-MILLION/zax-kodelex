import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Grid, List, Star, Eye, BookOpen, Database, RefreshCw } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import { useMultiSeriesData } from '@/hooks/useMangaData';
import { useMultiSeriesMode } from '@/hooks/useMultiSeriesMode';
import { MultiSeriesControls } from '@/components/MultiSeriesControls';

// Mock data for demonstration - replace with real data after migration
const mockSeries = [
  {
    id: '1',
    title: 'Crimson Blade Chronicles',
    slug: 'crimson-blade',
    description: 'An epic tale of sword and sorcery in a mystical realm.',
    cover_image_url: '/manga-covers/crimson-blade-cover.jpg',
    author: 'Akira Yoshida',
    status: 'ongoing',
    genres: ['Action', 'Fantasy'],
    rating: 4.8,
    total_chapters: 45,
    view_count: 15420,
    categories: [
      { name: 'Action', color: '#ef4444' },
      { name: 'Fantasy', color: '#06b6d4' }
    ]
  },
  {
    id: '2',
    title: 'Mystic Academy',
    slug: 'mystic-academy',
    description: 'Students discover their magical abilities in this supernatural school.',
    cover_image_url: '/manga-covers/mystic-academy-cover.jpg',
    author: 'Yuki Tanaka',
    status: 'ongoing',
    genres: ['Romance', 'Supernatural'],
    rating: 4.6,
    total_chapters: 32,
    view_count: 12890,
    categories: [
      { name: 'Romance', color: '#ec4899' },
      { name: 'Supernatural', color: '#8b5cf6' }
    ]
  },
  {
    id: '3',
    title: 'Dragon\'s Legacy',
    slug: 'dragons-legacy',
    description: 'The last dragon rider seeks to restore balance to the world.',
    cover_image_url: '/manga-covers/dragons-legacy-cover.jpg',
    author: 'Hiroshi Sato',
    status: 'completed',
    genres: ['Adventure', 'Drama'],
    rating: 4.9,
    total_chapters: 78,
    view_count: 28350,
    categories: [
      { name: 'Adventure', color: '#f59e0b' },
      { name: 'Drama', color: '#8b5cf6' }
    ]
  }
];

const mockCategories = [
  { id: '1', name: 'Action', slug: 'action', color: '#ef4444' },
  { id: '2', name: 'Romance', slug: 'romance', color: '#ec4899' },
  { id: '3', name: 'Fantasy', slug: 'fantasy', color: '#06b6d4' },
  { id: '4', name: 'Drama', slug: 'drama', color: '#8b5cf6' },
  { id: '5', name: 'Adventure', slug: 'adventure', color: '#f59e0b' },
  { id: '6', name: 'Supernatural', slug: 'supernatural', color: '#8b5cf6' }
];

const Browse = () => {
  const [searchParams] = useSearchParams();
  const { allSeries, loading, error, refreshData } = useMultiSeriesData();
  const { config } = useMultiSeriesMode();
  const [categories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [contentType, setContentType] = useState<string>('all');
  const [sortBy, setSortBy] = useState('title');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showControls, setShowControls] = useState(false);

  // Update search term when URL params change
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  // Use real data if available, fallback to mock data
  const series = allSeries.length > 0 ? allSeries.map(s => ({
    id: s.id,
    title: s.title,
    slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: s.description || 'No description available',
    cover_image_url: s.cover_image_url || '/placeholder.svg',
    author: s.author || 'Unknown Author',
    status: s.status,
    genres: s.genres || [],
    rating: 4.5, // Default rating
    total_chapters: 25, // Default chapter count
    view_count: Math.floor(Math.random() * 100000),
    categories: (s.genres || []).map(genre => ({ 
      name: genre, 
      color: mockCategories.find(c => c.name === genre)?.color || '#6b7280' 
    }))
  })) : mockSeries;

  const filteredSeries = series.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
                           s.categories.some(cat => cat.name === selectedCategory);

    const matchesContentType = contentType === 'all' ||
                               (contentType === 'manga' && Math.random() > 0.5) ||
                               (contentType === 'novel' && Math.random() <= 0.5);
    
    return matchesSearch && matchesCategory && matchesContentType;
  });

  const sortedSeries = [...filteredSeries].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'view_count':
        return (b.view_count || 0) - (a.view_count || 0);
      case 'total_chapters':
        return (b.total_chapters || 0) - (a.total_chapters || 0);
      case 'created_at':
        return a.title.localeCompare(b.title); // Fallback to title sorting
      default:
        return a.title.localeCompare(b.title);
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Series</h1>
          <p className="text-muted-foreground">
            Discover manga series across different genres and categories
          </p>
        </div>

        {/* Multi-Series Status */}
        <Card className={`mb-6 ${allSeries.length > 0 ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-orange-200 bg-orange-50 dark:bg-orange-950/20'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center justify-between ${allSeries.length > 0 ? 'text-green-800 dark:text-green-200' : 'text-orange-800 dark:text-orange-200'}`}>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {allSeries.length > 0 ? 'Multi-Series Data Active' : 'Demo Mode - Sample Data'}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={loading}
                  className="gap-1"
                >
                  {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowControls(!showControls)}
                >
                  {showControls ? 'Hide' : 'Show'} Controls
                </Button>
              </div>
            </CardTitle>
            <CardDescription className={allSeries.length > 0 ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}>
              {allSeries.length > 0 
                ? `Showing ${allSeries.length} series from your database`
                : 'Using sample data for demonstration. Use controls below to seed real test data.'
              }
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Multi-Series Controls */}
        {showControls && (
          <div className="mb-6">
            <MultiSeriesControls />
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search series, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Content Type Filter */}
            {config.showContentTypeFilter && (
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="manga">Manga</SelectItem>
                  <SelectItem value="novel">Novels</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="created_at">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="view_count">Most Popular</SelectItem>
                <SelectItem value="total_chapters">Chapter Count</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {sortedSeries.length} series found
            {selectedCategory && ` in ${selectedCategory}`}
            {contentType !== 'all' && ` (${contentType})`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Series Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-t-lg"></div>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                  <div className="flex gap-1">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedSeries.map(series => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSeries.map(series => (
              <SeriesListItem key={series.id} series={series} />
            ))}
          </div>
        )}

        {!loading && sortedSeries.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <BookOpen className="h-12 w-12 mx-auto mb-2" />
              No series found
            </div>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
    </div>
  );
};

const SeriesCard = ({ series }: { series: typeof mockSeries[0] }) => (
  <Link to={`/series/${series.id || series.slug}`}>
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200">
      <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
        <LazyImage
          src={series.cover_image_url || '/placeholder.svg'}
          alt={series.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-1">{series.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{series.author}</p>
      
      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          {series.rating?.toFixed(1) || 'N/A'}
        </div>
        <div className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {series.total_chapters}
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {series.view_count}
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {series.categories.slice(0, 2).map((cat, i) => (
          <Badge 
            key={i} 
            variant="secondary" 
            className="text-xs"
            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
          >
            {cat.name}
          </Badge>
        ))}
        {series.categories.length > 2 && (
          <Badge variant="secondary" className="text-xs">
            +{series.categories.length - 2}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
  </Link>
);

const SeriesListItem = ({ series }: { series: typeof mockSeries[0] }) => (
  <Link to={`/series/${series.id || series.slug}`}>
    <Card className="group cursor-pointer hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-16 h-20 rounded overflow-hidden flex-shrink-0">
            <LazyImage
              src={series.cover_image_url || '/placeholder.svg'}
              alt={series.title}
              className="w-full h-full object-cover"
            />
          </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold line-clamp-1">{series.title}</h3>
              <p className="text-sm text-muted-foreground">{series.author}</p>
            </div>
            <Badge variant={series.status === 'completed' ? 'default' : 'secondary'}>
              {series.status}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {series.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {series.categories.slice(0, 3).map((cat, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: cat.color, color: cat.color }}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {series.rating?.toFixed(1) || 'N/A'}
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {series.total_chapters} chapters
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {series.view_count} views
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  </Link>
);

export default Browse;