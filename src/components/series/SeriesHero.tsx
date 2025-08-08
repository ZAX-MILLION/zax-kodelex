import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Star, 
  Eye, 
  Heart, 
  Share2, 
  ArrowLeft 
} from 'lucide-react';
import LazyImage from '@/components/LazyImage';

interface MangaSeries {
  id: string;
  title: string;
  description: string;
  author: string;
  artist: string;
  cover_image_url: string;
  status: string;
  genres: string[];
  age_rating: string;
  rating_average: number;
  rating_count: number;
  view_count: number;
}

interface SeriesHeroProps {
  series: MangaSeries;
  chaptersCount: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  user: any;
}

const SeriesHero: React.FC<SeriesHeroProps> = ({
  series,
  chaptersCount,
  isBookmarked,
  onToggleBookmark,
  user
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-background border-b border-border/20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/series')}
          className="mb-6 gap-2 hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Series
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Series Cover */}
          <div className="lg:col-span-1">
            <div className="relative group">
              <LazyImage
                src={series.cover_image_url || '/placeholder.svg'}
                alt={series.title}
                className="w-full aspect-[3/4] object-cover rounded-xl shadow-2xl border border-border/20"
              />
              
              {/* Status dot indicator */}
              <div className="absolute top-4 right-4">
                <div 
                  className={`w-4 h-4 rounded-full shadow-lg border-2 border-background ${
                    series.status.toLowerCase() === 'ongoing' ? 'bg-green-500' :
                    series.status.toLowerCase() === 'completed' ? 'bg-blue-500' :
                    'bg-red-500'
                  }`}
                  title={series.status}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                onClick={onToggleBookmark}
                variant={isBookmarked ? "default" : "outline"}
                className="w-full gap-2 bg-manga-red hover:bg-manga-red/90"
                disabled={!user}
              >
                <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Add to Library'}
              </Button>
              
              <Button variant="outline" className="w-full gap-2">
                <Share2 className="h-4 w-4" />
                Share Series
              </Button>
            </div>
          </div>

          {/* Series Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title and Basic Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {series.title}
                </h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge 
                    variant="secondary" 
                    className={`${
                      series.status.toLowerCase() === 'ongoing' ? 'bg-green-500/20 text-green-300 border-green-500/40' :
                      series.status.toLowerCase() === 'completed' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                      'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}
                  >
                    {series.status}
                  </Badge>
                  <Badge variant="outline" className="border-manga-gold/40 text-manga-gold">
                    {series.age_rating}
                  </Badge>
                  {series.genres?.slice(0, 4).map((genre, index) => (
                    <Badge key={index} variant="outline" className="border-border/40 hover:border-primary/40 transition-colors">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-foreground">{series.rating_average?.toFixed(1) || 'N/A'}</span>
                  <span className="text-sm">({series.rating_count || 0})</span>
                </div>
                <div className="flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2">
                  <Eye className="h-5 w-5" />
                  <span className="font-semibold text-foreground">{series.view_count?.toLocaleString() || 0}</span>
                  <span className="text-sm">views</span>
                </div>
                <div className="flex items-center gap-2 bg-card/50 rounded-lg px-3 py-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-semibold text-foreground">{chaptersCount}</span>
                  <span className="text-sm">chapters</span>
                </div>
              </div>


              {/* Description */}
              <Card className="bg-card/50 border-border/40">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-3 text-foreground">Synopsis</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {series.description || 'No description available for this series yet.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesHero;