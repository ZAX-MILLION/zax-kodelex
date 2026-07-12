import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Monitor } from 'lucide-react';

interface LinkedSeries {
  id: string;
  title: string;
  content_type: string;
  cover_image_url: string;
}

interface LinkedSeriesCardProps {
  linkedSeries: LinkedSeries;
  currentContentType: string;
}

export const LinkedSeriesCard: React.FC<LinkedSeriesCardProps> = ({
  linkedSeries,
  currentContentType
}) => {
  const navigate = useNavigate();

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'manga':
      case 'webtoon':
        return <BookOpen className="h-4 w-4" />;
      case 'novel':
      case 'light_novel':
        return <FileText className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'manga': return 'Manga';
      case 'novel': return 'Novel';
      case 'light_novel': return 'Light Novel';
      case 'webtoon': return 'Webtoon';
      default: return 'Series';
    }
  };

  const getAlternativeLabel = () => {
    if (currentContentType === 'manga' || currentContentType === 'webtoon') {
      return linkedSeries.content_type === 'novel' || linkedSeries.content_type === 'light_novel'
        ? 'Also available as a novel'
        : 'Also available in another format';
    } else {
      return 'Also available as manga';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 hover:border-primary/40 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Cover Image */}
          <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img
              src={linkedSeries.cover_image_url}
              alt={linkedSeries.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
              <Badge variant="outline" className="text-xs text-white border-white/30">
                {getContentTypeIcon(linkedSeries.content_type)}
                <span className="ml-1">{getContentTypeLabel(linkedSeries.content_type)}</span>
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1">
              {getAlternativeLabel()}
            </p>
            <h3 className="font-semibold text-base line-clamp-1 mb-2">
              {linkedSeries.title}
            </h3>
            <Button
              size="sm"
              onClick={() => navigate(`/series/${linkedSeries.id}`)}
              className="gap-2"
            >
              {getContentTypeIcon(linkedSeries.content_type)}
              Read {getContentTypeLabel(linkedSeries.content_type)}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};