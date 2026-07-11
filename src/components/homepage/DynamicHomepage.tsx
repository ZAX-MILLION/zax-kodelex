import React, { useState } from 'react';
import { useWidgetManager } from '@/hooks/useWidgetManager';
import { WidgetConfig } from '@/types/widgets';
import { HeroSlider } from './HeroSlider';
import { SeriesGrid } from './SeriesGrid';
import { WhatsHotSection } from './WhatsHotSection';
import TrendingSidebar from './TrendingSidebar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useHomepageSettings, useSeriesData, useTrendingSeries } from '@/hooks/useHomepageData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  BookOpen, 
  Star, 
  Eye, 
  Plus, 
  Clock, 
  Filter, 
  User, 
  Book, 
  MessageCircle, 
  Shuffle, 
  History, 
  Play, 
  Award, 
  Trophy 
} from 'lucide-react';
import { useEffect } from 'react';

const WidgetRenderer: React.FC<{ widget: WidgetConfig }> = ({ widget }) => {
  const { series: latestSeries, fetchSeries, totalCount } = useSeriesData();
  const { trendingSeries } = useTrendingSeries();
  const { settings } = useHomepageSettings();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (widget.type === 'latest-comics' || widget.type === 'recently-updated') {
      fetchSeries('latest', itemsPerPage, (currentPage - 1) * itemsPerPage);
    }
  }, [widget.settings.itemCount, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderWidget = () => {
    switch (widget.type) {
      case 'hero-slider':
        return (
          <HeroSlider
            slidesCount={widget.settings.itemCount}
            autoSlideInterval={widget.settings.slideInterval}
            showFilters={widget.settings.showFilters}
            sortBy={widget.settings.sortBy as 'trending' | 'new' | 'random'}
          />
        );

      case 'latest-comics':
      case 'recently-updated':
        return (
          <SeriesGrid
            series={latestSeries}
            title={widget.settings.showTitle ? widget.title : ''}
            description="Recently updated series and new releases"
            columns={widget.settings.columns as 3 | 4 | 5 | 6}
            showPagination={true}
            totalCount={totalCount}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        );

      case 'trending-carousel':
        return (
          <SeriesGrid
            series={trendingSeries.slice(0, widget.settings.itemCount || 12)}
            title={widget.settings.showTitle ? widget.title : ''}
            description="Trending series based on reader engagement"
            columns={widget.settings.columns as 3 | 4 | 5 | 6}
            showViewMore={true}
          />
        );

      case 'whats-hot':
        return widget.settings.showTitle ? (
          <WhatsHotSection />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* WhatsHotSection content without title */}
            </div>
          </div>
        );

      case 'top-rated':
        return (
          <SeriesGrid
            series={trendingSeries.slice(0, widget.settings.itemCount)}
            title={widget.settings.showTitle ? widget.title : ''}
            description="Highest rated series"
            columns={widget.settings.columns as 3 | 4 | 5 | 6}
            showViewMore={true}
          />
        );

      case 'most-viewed':
        return (
          <SeriesGrid
            series={latestSeries.slice(0, widget.settings.itemCount)}
            title={widget.settings.showTitle ? widget.title : ''}
            description="Most popular series"
            columns={widget.settings.columns as 3 | 4 | 5 | 6}
            showViewMore={true}
          />
        );

      case 'recently-added':
        return (
          <SeriesGrid
            series={latestSeries.slice(0, widget.settings.itemCount)}
            title={widget.settings.showTitle ? widget.title : ''}
            description="Newest series on the platform"
            columns={widget.settings.columns as 3 | 4 | 5 | 6}
            showViewMore={true}
          />
        );

      case 'genre-filter':
        return (
          <Card>
            {widget.settings.showTitle && (
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  {widget.title}
                </CardTitle>
              </CardHeader>
            )}
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Action', 'Romance', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi', 'Horror', 'Slice of Life'].map(genre => (
                  <Badge key={genre} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    {genre}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'random-pick': {
        const randomSeries = latestSeries[Math.floor(Math.random() * latestSeries.length)];
        return randomSeries ? (
          <Card>
            {widget.settings.showTitle && (
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shuffle className="h-5 w-5" />
                  {widget.title}
                </CardTitle>
              </CardHeader>
            )}
            <CardContent>
              <div className="flex gap-4">
                <img 
                  src={randomSeries.cover_image_url || '/placeholder.svg'} 
                  alt={randomSeries.title}
                  className="w-20 h-28 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{randomSeries.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{randomSeries.description}</p>
                  <Button size="sm" className="mt-2">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null;
      }

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-2">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">{widget.title}</h3>
                <p className="text-muted-foreground">Widget implementation coming soon...</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="widget-container">
      {renderWidget()}
    </div>
  );
};

export const DynamicHomepage: React.FC = () => {
  const { getEnabledWidgets, loading } = useWidgetManager();
  const { trendingSeries } = useTrendingSeries();
  const enabledWidgets = getEnabledWidgets();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse space-y-8 p-4">Loading homepage...</div>
      </div>
    );
  }

  // Separate widgets by layout type
  const heroWidgets = enabledWidgets.filter(widget => 
    widget.type === 'hero-slider'
  );
  
  const sidebarWidgets = enabledWidgets.filter(widget => 
    widget.type === 'latest-comics' || 
    widget.type === 'trending-carousel' ||
    widget.type === 'recently-updated' ||
    widget.type === 'top-rated' ||
    widget.type === 'most-viewed' ||
    widget.type === 'recently-added' ||
    widget.type === 'genre-filter' ||
    widget.type === 'random-pick'
  );

  const whatsHotWidgets = enabledWidgets.filter(widget => 
    widget.type === 'whats-hot'
  );

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <div className="space-y-8">
        
        {/* Hero Slider (Full Width) */}
        {heroWidgets.map((widget) => (
          <WidgetRenderer key={widget.id} widget={widget} />
        ))}
        
        {/* Sidebar Layout for Latest Comics and Trending */}
        {sidebarWidgets.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            {/* Main Content with Sidebar Widgets */}
            <div className="space-y-8">
              {sidebarWidgets.map((widget) => (
                <WidgetRenderer key={widget.id} widget={widget} />
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <TrendingSidebar series={trendingSeries} />
            </div>
          </div>
        )}

        {/* What's Hot Section (Full Width) */}
        {whatsHotWidgets.map((widget) => (
          <WidgetRenderer key={widget.id} widget={widget} />
        ))}
        
        {enabledWidgets.length === 0 && (
          <Card className="p-12 text-center">
            <div className="space-y-2">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">No widgets configured</h3>
              <p className="text-muted-foreground">Visit the admin dashboard to set up your homepage widgets.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};