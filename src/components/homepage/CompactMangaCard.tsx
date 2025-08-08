import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Eye } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import { getOptimizedImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';
import { Link } from 'react-router-dom';

interface CompactSeriesData {
  id: string;
  title: string;
  author?: string;
  status: string;
  genres?: string[];
  cover_image_url?: string;
  view_count?: number;
  rating_average?: number;
}

interface CompactMangaCardProps {
  series: CompactSeriesData;
  index?: number;
  className?: string;
}

export const CompactMangaCard = ({ series, index, className = '' }: CompactMangaCardProps) => {
  const optimizedCoverUrl = getOptimizedImageUrl(
    series.cover_image_url || getFallbackCoverImage(series.id),
    150,
    200
  );

  return (
    <Card className={`group overflow-hidden bg-card/95 hover:bg-card transition-all duration-300 hover:shadow-md border border-border/50 hover:border-primary/30 ${className}`}>
      <Link to={`/series/${series.id}`} className="block">
        <div className="flex gap-3 p-3">
          {/* Rank number for trending */}
          {typeof index === 'number' && (
            <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary mt-1">
              {index + 1}
            </div>
          )}
          
          {/* Compact cover image */}
          <div className="flex-shrink-0 w-12 h-16 relative overflow-hidden rounded bg-muted">
            <LazyImage 
              src={optimizedCoverUrl}
              alt={series.title} 
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" 
              fill
              width={48}
              height={64}
              sizes="48px"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {series.title}
            </h3>
            
            
            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  series.status === 'ongoing' ? 'border-green-500/50 text-green-600' : 
                  series.status === 'completed' ? 'border-blue-500/50 text-blue-600' : 
                  'border-orange-500/50 text-orange-600'
                }`}
              >
                {series.status}
              </Badge>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {series.rating_average && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{series.rating_average.toFixed(1)}</span>
                  </div>
                )}
                {series.view_count && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{series.view_count > 1000 ? `${(series.view_count / 1000).toFixed(1)}k` : series.view_count}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};