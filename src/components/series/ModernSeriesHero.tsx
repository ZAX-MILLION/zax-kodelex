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
  ArrowLeft,
  Users,
  TrendingUp,
  Calendar,
  Sparkles,
  Award
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
  updated_at: string;
}

interface ModernSeriesHeroProps {
  series: MangaSeries;
  chaptersCount: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  user: any;
}

const ModernSeriesHero: React.FC<ModernSeriesHeroProps> = ({
  series,
  chaptersCount,
  isBookmarked,
  onToggleBookmark,
  user
}) => {
  const navigate = useNavigate();

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing': 
        return { 
          color: 'from-emerald-400 to-green-500', 
          icon: TrendingUp,
          text: 'Ongoing'
        };
      case 'completed': 
        return { 
          color: 'from-blue-400 to-cyan-500', 
          icon: Award,
          text: 'Completed'
        };
      case 'hiatus': 
        return { 
          color: 'from-orange-400 to-amber-500', 
          icon: Calendar,
          text: 'On Hiatus'
        };
      default: 
        return { 
          color: 'from-red-400 to-rose-500', 
          icon: Calendar,
          text: 'Cancelled'
        };
    }
  };

  const statusConfig = getStatusConfig(series.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/5" />
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${series.cover_image_url})`,
            filter: 'blur(20px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60" />
      </div>

      <div className="relative container mx-auto px-4 py-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/series')}
          className="mb-4 gap-2 bg-background/60 backdrop-blur-xl border border-border/40 hover:bg-background/80 transition-all duration-300 rounded-2xl px-4 py-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>

        {/* Compact Hero Layout */}
        <div className="bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-xl border border-border/20 rounded-3xl p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            
            {/* Cover Image - Compact */}
            <div className="lg:col-span-1">
              <div className="relative group mx-auto max-w-xs">
                {/* Glow Effect */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  <LazyImage
                    src={series.cover_image_url || '/placeholder.svg'}
                    alt={series.title}
                    className="w-full aspect-[3/4] object-cover rounded-2xl shadow-2xl border border-border/20"
                  />
                  
                  {/* Status Overlay */}
                  <div className="absolute top-3 right-3">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r ${statusConfig.color} text-white shadow-lg`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">{statusConfig.text}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Series Info - Expanded */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* Title and Genres */}
              <div className="space-y-3">
                <h1 className="text-3xl lg:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent leading-tight">
                  {series.title}
                </h1>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className={`px-3 py-1.5 text-xs font-semibold bg-gradient-to-r ${statusConfig.color} text-white border-0 shadow-lg`}>
                    {series.age_rating}
                  </Badge>
                  {series.genres?.slice(0, 5).map((genre, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="px-2.5 py-1.5 text-xs bg-background/40 backdrop-blur-sm border border-border/40 hover:bg-background/60 transition-all duration-300"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats Grid - Compact */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-background/60 to-background/30 backdrop-blur-sm rounded-xl p-3 text-center border border-border/20">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mx-auto mb-1.5" />
                  <div className="text-base font-bold">{series.rating_average?.toFixed(1) || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
                
                <div className="bg-gradient-to-br from-background/60 to-background/30 backdrop-blur-sm rounded-xl p-3 text-center border border-border/20">
                  <Eye className="h-5 w-5 text-primary mx-auto mb-1.5" />
                  <div className="text-base font-bold">{(series.view_count || 0).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
                
                <div className="bg-gradient-to-br from-background/60 to-background/30 backdrop-blur-sm rounded-xl p-3 text-center border border-border/20">
                  <BookOpen className="h-5 w-5 text-secondary mx-auto mb-1.5" />
                  <div className="text-base font-bold">{chaptersCount}</div>
                  <div className="text-xs text-muted-foreground">Chapters</div>
                </div>
                
                <div className="bg-gradient-to-br from-background/60 to-background/30 backdrop-blur-sm rounded-xl p-3 text-center border border-border/20">
                  <Users className="h-5 w-5 text-accent mx-auto mb-1.5" />
                  <div className="text-base font-bold">{series.rating_count || 0}</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onToggleBookmark}
                  className={`flex-1 gap-2.5 h-12 text-base font-semibold relative overflow-hidden group ${
                    isBookmarked 
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' 
                      : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
                  } border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl`}
                  disabled={!user}
                >
                  <Heart className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>{isBookmarked ? 'In Library' : 'Add to Library'}</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2.5 h-12 bg-background/40 backdrop-blur-sm border-border/40 hover:bg-background/60 transition-all duration-300 rounded-2xl"
                >
                  <Share2 className="h-4 w-4" />
                  Share Series
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Synopsis */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-xl border border-border/20 h-full">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h3 className="font-bold text-2xl">Synopsis</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {series.description || 'No description available for this series yet.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Creator Info */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl border border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <h3 className="font-bold text-lg text-primary">Author</h3>
                </div>
                <p className="text-foreground font-semibold text-xl">{series.author || 'Unknown'}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur-xl border border-secondary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
                  <h3 className="font-bold text-lg text-secondary">Artist</h3>
                </div>
                <p className="text-foreground font-semibold text-xl">{series.artist || 'Unknown'}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-xl border border-border/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-bold text-lg">Last Updated</h3>
                </div>
                <p className="text-muted-foreground">
                  {new Date(series.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSeriesHero;