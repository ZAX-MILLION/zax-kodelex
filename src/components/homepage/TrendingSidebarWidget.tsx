import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Eye, TrendingUp } from 'lucide-react';
import { SeriesCard } from '@/hooks/useHomepageData';
import { CompactMangaCard } from './CompactMangaCard';
import LazyImage from '@/components/LazyImage';
import { Link } from 'react-router-dom';

interface TrendingSidebarWidgetProps {
  todaySeries: SeriesCard[];
  weekSeries: SeriesCard[];
  allTimeSeries: SeriesCard[];
  className?: string;
}

const TrendingSidebarWidget = ({ 
  todaySeries, 
  weekSeries, 
  allTimeSeries, 
  className = '' 
}: TrendingSidebarWidgetProps) => {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'all'>('today');

  const getCurrentSeries = () => {
    switch (activeTab) {
      case 'today':
        return todaySeries.slice(0, 10);
      case 'week':
        return weekSeries.slice(0, 10);
      case 'all':
        return allTimeSeries.slice(0, 10);
      default:
        return todaySeries.slice(0, 10);
    }
  };

  const tabs = [
    { key: 'today' as const, label: 'Today' },
    { key: 'week' as const, label: 'This Week' },
    { key: 'all' as const, label: 'All Time' }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-2.5 w-2.5 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const currentSeries = getCurrentSeries();

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending
        </CardTitle>
        
        {/* Tab Navigation - Reset Scans style */}
        <div className="flex bg-muted/50 rounded-lg p-0.5 border border-border/50">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-xs h-8 transition-all rounded-md ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-1.5">
        {currentSeries.map((item, index) => {
          const rating = 4.0 + Math.random() * 1;
          const views = item.view_count || Math.floor(Math.random() * 50000);
          
          return (
            <Link
              key={item.id}
              to={`/series/${item.id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group relative"
            >
              {/* Rank number with better styling */}
              <div className={`flex-shrink-0 w-6 h-6 text-xs font-bold flex items-center justify-center rounded-full ${
                index < 3 
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900' 
                  : 'bg-primary/80 text-primary-foreground'
              }`}>
                {index + 1}
              </div>
              
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-12 h-16 rounded overflow-hidden border border-border/20">
                <LazyImage
                  src={item.cover_image_url || '/placeholder.svg'}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  sizes="48px"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                  {item.title}
                </h4>
                
                {/* Genre and Status only - no author names */}
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {item.genres?.[0] || 'Action'}
                  </span>
                  {item.status && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      item.status === 'ongoing' ? 'bg-emerald-800 text-white' :
                      item.status === 'completed' ? 'bg-sky-800 text-white' :
                      'bg-amber-800 text-white'
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>
                
                {/* Rating and Views */}
                <div className="flex items-center justify-between">
                  <div className="hidden md:flex items-center gap-1">
                    {renderStars(rating)}
                    <span className="text-xs text-muted-foreground ml-1">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                  
                  {/* Views/bookmarks */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>{views > 1000 ? `${(views/1000).toFixed(1)}k` : views}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        
        {/* View More Button */}
        <Button variant="outline" size="sm" className="w-full mt-4" asChild>
          <Link to="/browse?sort=trending">
            View All Trending
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrendingSidebarWidget;