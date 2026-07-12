import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, BookOpen } from 'lucide-react';
import { SeriesCard } from '@/hooks/useHomepageData';
import LazyImage from '@/components/LazyImage';
import { Link } from 'react-router-dom';

interface TrendingSidebarProps {
  series: SeriesCard[];
  className?: string;
}

const TrendingSidebar = ({ series, className = '' }: TrendingSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'all'>('today');

  // Prepare series data based on active tab
  const getSeriesForTab = () => {
    switch (activeTab) {
      case 'today':
        return series.slice(0, 6).map((item, index) => ({ ...item, rank: index + 1 }));
      case 'week': 
        return series.slice(0, 6).map((item, index) => ({ ...item, rank: index + 1 }));
      case 'all':
        return series.slice(0, 6).map((item, index) => ({ ...item, rank: index + 1 }));
      default:
        return series.slice(0, 6).map((item, index) => ({ ...item, rank: index + 1 }));
    }
  };

  const displaySeries = getSeriesForTab();

  const tabs = [
    { key: 'today' as const, label: 'Today' },
    { key: 'week' as const, label: 'This Week' },
    { key: 'all' as const, label: 'All Time' }
  ];


  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground">Trending</CardTitle>
        
        {/* Tab Navigation */}
        <div className="flex bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-xs transition-all ${
                activeTab === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displaySeries.map((item) => (
          <Link
            key={item.id}
            to={`/series/${item.id}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded text-xs font-bold flex items-center justify-center">
              {item.rank}
            </div>
            
            {/* Cover Image */}
            <div className="flex-shrink-0 w-12 h-16 rounded overflow-hidden">
              <LazyImage
                src={item.cover_image_url || '/placeholder.svg'}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              
              {/* Views count */}
              <div className="flex items-center gap-1 mt-1">
                <Eye className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                  {(item.view_count || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
        
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

export default TrendingSidebar;