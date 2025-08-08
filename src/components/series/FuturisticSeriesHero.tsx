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
  Zap,
  Calendar,
  Clock
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

interface FuturisticSeriesHeroProps {
  series: MangaSeries;
  chaptersCount: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  user: any;
}

const FuturisticSeriesHero: React.FC<FuturisticSeriesHeroProps> = ({
  series,
  chaptersCount,
  isBookmarked,
  onToggleBookmark,
  user
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing': return 'from-green-400 to-emerald-600';
      case 'completed': return 'from-blue-400 to-cyan-600';
      case 'hiatus': return 'from-orange-400 to-amber-600';
      default: return 'from-red-400 to-rose-600';
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/5">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/series')}
          className="mb-8 gap-2 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Series
        </Button>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-12 items-start">
          {/* Enhanced Cover Section */}
          <div className="xl:col-span-2 space-y-6">
            <div className="relative group">
              {/* Neon Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <LazyImage
                  src={series.cover_image_url || '/placeholder.svg'}
                  alt={series.title}
                  className="w-full aspect-[3/4] object-cover rounded-xl shadow-2xl"
                />
                
                {/* Floating Status Indicator */}
                <div className="absolute -top-2 -right-2">
                  <div className={`relative w-6 h-6 rounded-full bg-gradient-to-r ${getStatusColor(series.status)} shadow-lg border-2 border-background`}>
                    <div className="absolute inset-1 rounded-full bg-white/20 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={onToggleBookmark}
                className={`w-full gap-3 h-14 text-lg font-semibold relative overflow-hidden group ${
                  isBookmarked 
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' 
                    : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
                } border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
                disabled={!user}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''} relative z-10`} />
                <span className="relative z-10">{isBookmarked ? 'In Library' : 'Add to Library'}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-3 h-12 bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                <Share2 className="h-4 w-4" />
                Share Series
              </Button>
            </div>
          </div>

          {/* Enhanced Info Section */}
          <div className="xl:col-span-3 space-y-8">
            {/* Title Section */}
            <div className="space-y-6">
              <div className="relative">
                <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent leading-tight">
                  {series.title}
                </h1>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge 
                    className={`px-4 py-2 text-sm font-semibold bg-gradient-to-r ${getStatusColor(series.status)} text-white border-0 shadow-lg`}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    {series.status}
                  </Badge>
                  <Badge className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold border-0">
                    {series.age_rating}
                  </Badge>
                  {series.genres?.slice(0, 4).map((genre, index) => (
                    <Badge key={index} className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Star className="h-8 w-8 fill-yellow-400 text-yellow-400 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-foreground">{series.rating_average?.toFixed(1) || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">({series.rating_count || 0} ratings)</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Eye className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-foreground">{series.view_count?.toLocaleString() || 0}</div>
                    <div className="text-sm text-muted-foreground">total views</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="h-8 w-8 text-secondary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-foreground">{chaptersCount}</div>
                    <div className="text-sm text-muted-foreground">chapters</div>
                  </CardContent>
                </Card>
              </div>

              {/* Creator Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl border border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <h3 className="font-bold text-primary">Author</h3>
                    </div>
                    <p className="text-foreground font-semibold text-lg">{series.author || 'Unknown'}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur-xl border border-secondary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      <h3 className="font-bold text-secondary">Artist</h3>
                    </div>
                    <p className="text-foreground font-semibold text-lg">{series.artist || 'Unknown'}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Description */}
              <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full" />
                    <h3 className="font-bold text-2xl text-foreground">Synopsis</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {series.description || 'No description available for this series yet.'}
                  </p>
                </CardContent>
              </Card>

              {/* Last Updated Info */}
              <Card className="bg-gradient-to-r from-card/60 to-card/30 backdrop-blur-xl border border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Last updated: {new Date(series.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturisticSeriesHero;