import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, List, Star, BookOpen, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { EnhancedMangaCard } from '@/components/manga/EnhancedMangaCard';
import { usePaginatedSeries, SeriesFilters } from '@/hooks/usePaginatedSeries';

const genres = ['All', 'Action', 'Adventure', 'Fantasy', 'Drama', 'School', 'Mystery', 'Romance', 'Comedy', 'Thriller'];
const statuses = ['All', 'ongoing', 'completed', 'hiatus'];
const sortOptions = [
  { value: 'latest', label: 'Latest Updated' },
  { value: 'trending', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'chapters', label: 'Most Chapters' },
  { value: 'title', label: 'Title A-Z' }
];

export default function SeriesDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { 
    series, 
    pagination, 
    loading, 
    error, 
    fetchSeries, 
    goToPage 
  } = usePaginatedSeries(12);

  const handleSearch = () => {
    const filters: SeriesFilters = {
      hasChapters: true, // Only show series with chapters
      sortBy: sortBy as any
    };

    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }

    if (selectedGenre !== 'All') {
      filters.genre = selectedGenre;
    }

    if (selectedStatus !== 'All') {
      filters.status = selectedStatus;
    }

    fetchSeries(1, filters);
  };

  const handleFilterChange = () => {
    handleSearch();
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {startPage > 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => goToPage(1)}>
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pageNumbers.map(page => (
          <Button
            key={page}
            variant={pagination.currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => goToPage(page)}
          >
            {page}
          </Button>
        ))}
        
        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && <span className="px-2">...</span>}
            <Button variant="outline" size="sm" onClick={() => goToPage(pagination.totalPages)}>
              {pagination.totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Series Directory</h1>
          <p className="text-muted-foreground">
            Discover and explore all manga series in our collection
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search series, authors, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <div className="flex border rounded-lg">
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

          {/* Filters */}
          {showFilters && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Genre</label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => {
                        setSelectedGenre(e.target.value);
                        handleFilterChange();
                      }}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        handleFilterChange();
                      }}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status === 'All' ? status : status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        handleFilterChange();
                      }}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {loading ? (
            "Loading series..."
          ) : (
            `Showing ${((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-${Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalCount)} of ${pagination.totalCount} series`
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <CardContent className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="space-y-1">
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-6 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={() => fetchSeries(1)}>
              Try Again
            </Button>
          </div>
        )}

        {/* Series Grid/List */}
        {!loading && !error && (
          <>
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {series.map(s => (
                viewMode === 'grid' ? (
                  <EnhancedMangaCard 
                    key={s.id} 
                    series={{...s, status: s.status as 'ongoing' | 'completed' | 'hiatus' | 'cancelled'}} 
                    showMetadata={true} 
                    size="medium"
                  />
                ) : (
                  <Card key={s.id} className="flex group hover:shadow-lg transition-all duration-300">
                    <div className="w-32 flex-shrink-0 aspect-[3/4] overflow-hidden">
                      <img
                        src={s.cover_image_url}
                        alt={s.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-l-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <CardContent className="p-4 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                            <Link to={`/series/${s.id}`}>
                              {s.title}
                            </Link>
                          </h3>
                          <Badge variant={s.status === 'completed' ? 'default' : 'secondary'}>
                            {s.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {s.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                          <span>by {s.author}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{s.rating_average?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm mt-auto">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>{s.chapter_count} chapters</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{s.view_count?.toLocaleString() || 0} views</span>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                )
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}

            {/* Empty State */}
            {series.length === 0 && !loading && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No series found</h3>
                <p className="text-muted-foreground mb-4">No series found matching your criteria</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGenre('All');
                    setSelectedStatus('All');
                    fetchSeries(1, { hasChapters: true });
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
    </div>
  );
}