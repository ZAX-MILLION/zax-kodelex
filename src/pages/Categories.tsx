import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, List, BookOpen, TrendingUp, Star } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import { useMultiSeriesData } from '@/hooks/useMangaData';

const genreColors: Record<string, string> = {
  Action: '#ef4444',
  Romance: '#ec4899',
  Fantasy: '#06b6d4',
  Drama: '#8b5cf6',
  Adventure: '#f59e0b',
  Supernatural: '#8b5cf6',
};

const Categories = () => {
  const { allSeries, loading } = useMultiSeriesData();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = useMemo(() => {
    const map = new Map<string, typeof allSeries>();
    allSeries.forEach((series) => {
      (series.genres || ['General']).forEach((genre) => {
        const list = map.get(genre) || [];
        list.push(series);
        map.set(genre, list);
      });
    });

    return Array.from(map.entries()).map(([name, seriesList], index) => ({
      id: String(index + 1),
      name,
      slug: name.toLowerCase(),
      description: `Explore ${name.toLowerCase()} series on Zax Million`,
      color: genreColors[name] || '#6b7280',
      series_count: seriesList.length,
      total_views: seriesList.reduce((sum, s) => sum + (s.view_count || 0), 0),
      avg_rating:
        seriesList.reduce((sum, s) => sum + (s.rating_average || 4.5), 0) / seriesList.length,
      featured_series: seriesList.slice(0, 3).map((s) => ({
        id: s.id,
        title: s.title,
        cover_image_url: s.cover_image_url || '/placeholder.svg',
        rating: s.rating_average || 4.5,
      })),
      all_series: seriesList,
    }));
  }, [allSeries]);

  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number] | null>(null);

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const categorySeries = selectedCategory?.all_series || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground">
          Explore manga series organized by genres and themes
        </p>
      </div>

      {loading && (
        <div className="text-center py-12 text-muted-foreground">Loading categories...</div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No categories yet. Add series from the admin panel.</p>
        </div>
      )}

      {!loading && categories.length > 0 && selectedCategory && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {categories.map((category) => (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all ${
                  selectedCategory.id === category.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge style={{ backgroundColor: category.color }} className="text-white">
                      {category.series_count}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {category.total_views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {category.avg_rating.toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{selectedCategory.name} Series</h2>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categorySeries.map((series) => (
                <Link key={series.id} to={`/series/${series.id}`}>
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
                      <LazyImage
                        src={series.cover_image_url || '/placeholder.svg'}
                        alt={series.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold line-clamp-2 text-sm">{series.title}</h3>
                      <p className="text-xs text-muted-foreground">{series.author}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {categorySeries.map((series) => (
                <Link key={series.id} to={`/series/${series.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      <LazyImage
                        src={series.cover_image_url || '/placeholder.svg'}
                        alt={series.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{series.title}</h3>
                        <p className="text-sm text-muted-foreground">{series.author}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Categories;
