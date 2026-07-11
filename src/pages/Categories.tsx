import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, List, BookOpen, TrendingUp, Star, Database } from 'lucide-react';
import LazyImage from '@/components/LazyImage';

// Mock data for demonstration - replace with real data after migration
const mockCategories = [
  {
    id: '1',
    name: 'Action',
    slug: 'action',
    description: 'Fast-paced stories with fighting and adventure',
    color: '#ef4444',
    series_count: 15,
    total_views: 125000,
    avg_rating: 4.7,
    featured_series: [
      { id: '1', title: 'Crimson Blade', cover_image_url: '/manga-covers/crimson-blade-cover.jpg', rating: 4.8 },
      { id: '2', title: 'Battle Arena', cover_image_url: '/placeholder.svg', rating: 4.6 },
      { id: '3', title: 'Warrior Path', cover_image_url: '/placeholder.svg', rating: 4.7 }
    ]
  },
  {
    id: '2',
    name: 'Romance',
    slug: 'romance',
    description: 'Stories focused on love and relationships',
    color: '#ec4899',
    series_count: 12,
    total_views: 98000,
    avg_rating: 4.5,
    featured_series: [
      { id: '4', title: 'Mystic Academy', cover_image_url: '/manga-covers/mystic-academy-cover.jpg', rating: 4.6 },
      { id: '5', title: 'Cherry Blossoms', cover_image_url: '/placeholder.svg', rating: 4.4 },
      { id: '6', title: 'Summer Hearts', cover_image_url: '/placeholder.svg', rating: 4.5 }
    ]
  },
  {
    id: '3',
    name: 'Fantasy',
    slug: 'fantasy',
    description: 'Magical and supernatural elements',
    color: '#06b6d4',
    series_count: 18,
    total_views: 156000,
    avg_rating: 4.8,
    featured_series: [
      { id: '7', title: 'Dragon\'s Legacy', cover_image_url: '/manga-covers/dragons-legacy-cover.jpg', rating: 4.9 },
      { id: '8', title: 'Magic Realm', cover_image_url: '/placeholder.svg', rating: 4.7 },
      { id: '9', title: 'Enchanted Quest', cover_image_url: '/placeholder.svg', rating: 4.8 }
    ]
  },
  {
    id: '4',
    name: 'Drama',
    slug: 'drama',
    description: 'Serious and emotional storylines',
    color: '#8b5cf6',
    series_count: 10,
    total_views: 78000,
    avg_rating: 4.6,
    featured_series: [
      { id: '10', title: 'Silent Tears', cover_image_url: '/placeholder.svg', rating: 4.8 },
      { id: '11', title: 'Life Stories', cover_image_url: '/placeholder.svg', rating: 4.4 },
      { id: '12', title: 'Deep Waters', cover_image_url: '/placeholder.svg', rating: 4.6 }
    ]
  }
];

const mockSeries = [
  {
    id: '1',
    title: 'Crimson Blade Chronicles',
    cover_image_url: '/manga-covers/crimson-blade-cover.jpg',
    author: 'Akira Yoshida',
    rating: 4.8,
    total_chapters: 45,
    view_count: 15420
  },
  {
    id: '2',
    title: 'Battle Arena Masters',
    cover_image_url: '/placeholder.svg',
    author: 'Kenji Tanaka',
    rating: 4.6,
    total_chapters: 32,
    view_count: 12890
  },
  {
    id: '3',
    title: 'Warrior\'s Path',
    cover_image_url: '/placeholder.svg',
    author: 'Yuki Sato',
    rating: 4.7,
    total_chapters: 28,
    view_count: 9560
  }
];

const Categories = () => {
  const [categories] = useState(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState(mockCategories[0]);
  const [categorySeries] = useState(mockSeries);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">
            Explore manga series organized by genres and themes
          </p>
        </div>

        {/* Database Setup Notice */}
        <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Database className="h-5 w-5" />
              Demo Mode - Database Setup Required
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              This page shows mock data. Run the multi-series migration to enable full functionality with real database content.
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Category Overview</TabsTrigger>
            <TabsTrigger value="browse">Browse by Category</TabsTrigger>
          </TabsList>

          {/* Category Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(category => (
                <CategoryCard 
                  key={category.id} 
                  category={category}
                  onSelect={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Browse by Category */}
          <TabsContent value="browse" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Category Sidebar */}
              <div className="w-full md:w-64 space-y-2">
                <h3 className="font-semibold mb-4">Select Category</h3>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory?.id === category.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="flex-1 text-left">{category.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {category.series_count}
                    </Badge>
                  </Button>
                ))}
              </div>

              {/* Series Content */}
              <div className="flex-1">
                {selectedCategory && (
                  <div>
                    {/* Category Header */}
                    <div className="mb-6 p-6 rounded-lg border bg-gradient-to-r from-primary/5 to-accent/5">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: selectedCategory.color }}
                        />
                        <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {selectedCategory.description}
                      </p>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {selectedCategory.series_count} series
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {selectedCategory.total_views.toLocaleString()} total views
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {selectedCategory.avg_rating.toFixed(1)} avg rating
                        </div>
                      </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                      <h3 className="font-semibold min-w-0 truncate">
                        All {selectedCategory.name} Series ({categorySeries.length})
                      </h3>
                      <div className="flex rounded-lg border self-start sm:self-auto shrink-0">
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

                    {/* Series List */}
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categorySeries.map(series => (
                          <SeriesCard key={series.id} series={series} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {categorySeries.map(series => (
                          <SeriesListItem key={series.id} series={series} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
};

const CategoryCard = ({ category, onSelect }: { 
  category: typeof mockCategories[0]; 
  onSelect: () => void 
}) => (
  <Card 
    className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
    onClick={onSelect}
  >
    <CardHeader>
      <div className="flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full" 
          style={{ backgroundColor: category.color }}
        />
        <CardTitle className="group-hover:text-primary transition-colors">
          {category.name}
        </CardTitle>
      </div>
      <CardDescription>{category.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Series</span>
          <span className="font-medium">{category.series_count}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Views</span>
          <span className="font-medium">{category.total_views.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Avg Rating</span>
          <span className="font-medium flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            {category.avg_rating.toFixed(1)}
          </span>
        </div>
        
        {/* Featured Series Previews */}
        {category.featured_series.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Featured Series</p>
            <div className="flex gap-2">
              {category.featured_series.slice(0, 3).map(series => (
                <div key={series.id} className="w-8 h-10 rounded overflow-hidden">
                  <LazyImage
                    src={series.cover_image_url || '/placeholder.svg'}
                    alt={series.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const SeriesCard = ({ series }: { series: typeof mockSeries[0] }) => (
  <Card className="group cursor-pointer hover:shadow-md transition-all duration-200">
    <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
      <LazyImage
        src={series.cover_image_url || '/placeholder.svg'}
        alt={series.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
      />
    </div>
    <CardContent className="p-3">
      <h4 className="font-medium line-clamp-1 text-sm">{series.title}</h4>
      <p className="text-xs text-muted-foreground">{series.author}</p>
      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          {series.rating?.toFixed(1) || 'N/A'}
        </div>
        <span className="text-muted-foreground">{series.total_chapters} ch</span>
      </div>
    </CardContent>
  </Card>
);

const SeriesListItem = ({ series }: { series: typeof mockSeries[0] }) => (
  <Card className="group cursor-pointer hover:shadow-sm transition-all duration-200">
    <CardContent className="p-3">
      <div className="flex gap-3">
        <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0">
          <LazyImage
            src={series.cover_image_url || '/placeholder.svg'}
            alt={series.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium line-clamp-1">{series.title}</h4>
          <p className="text-sm text-muted-foreground">{series.author}</p>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {series.rating?.toFixed(1) || 'N/A'}
            </div>
            <span>{series.total_chapters} chapters</span>
            <span>{series.view_count} views</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Categories;