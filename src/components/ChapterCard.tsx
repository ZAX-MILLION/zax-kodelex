import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Heart, Bookmark, Crown, Lock, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import MouseFollower from './MouseFollower';

interface ChapterCardProps {
  chapterId: string;
  chapterNumber: number;
  title: string;
  releaseDate: string;
  readProgress: number; // 0-100
  isBookmarked: boolean;
  onBookmark: () => void;
  likeCount?: number;
  isLiked?: boolean;
  onLike?: () => void;
  isEarlyAccess?: boolean;
  isPremiumOnly?: boolean;
}

const ChapterCard = ({ 
  chapterId, 
  chapterNumber, 
  title, 
  releaseDate, 
  readProgress, 
  isBookmarked, 
  onBookmark,
  likeCount = 0,
  isLiked = false,
  onLike,
  isEarlyAccess = false,
  isPremiumOnly = false
}: ChapterCardProps) => {
  const isMobile = useIsMobile();
  const { isPremium } = useSubscription();
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  
  // Check if chapter is new (released within last 3 days)
  const isNewChapter = () => {
    const releaseTime = new Date(releaseDate).getTime();
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    return releaseTime > threeDaysAgo;
  };

  // Check if user can access this chapter
  const canAccessChapter = () => {
    if (isPremiumOnly && !isPremium) return false;
    if (isEarlyAccess && !isPremium) return false;
    return true;
  };

  // Get chapter access status
  const getAccessStatus = () => {
    if (isPremiumOnly && !isPremium) return 'premium-only';
    if (isEarlyAccess && !isPremium) return 'early-access';
    return 'accessible';
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIsLiked = !localIsLiked;
    setLocalIsLiked(newIsLiked);
    setLocalLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
    onLike?.();
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark();
  };

  const accessStatus = getAccessStatus();
  const isAccessible = canAccessChapter();

  // For locked chapters, show different UI
  if (!isAccessible) {
    return (
      <MouseFollower intensity={0.02}>
        <Card className={`p-3 sm:p-4 transition-all duration-300 border-l-4 relative opacity-75 ${
          accessStatus === 'premium-only' ? 'border-l-amber-500/50 bg-amber-500/5' : 'border-l-blue-500/50 bg-blue-500/5'
        }`}>
          {/* Premium/Early Access Badge */}
          <div className="absolute top-2 right-2">
            {accessStatus === 'premium-only' ? (
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            ) : (
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <Clock className="h-3 w-3 mr-1" />
                Early Access
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(releaseDate).toLocaleDateString()}</span>
                  {isNewChapter() && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 py-0">
                      NEW
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2">
                  Chapter {chapterNumber}: {title}
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-center p-4 bg-muted/30 rounded-lg">
              <div className="text-center space-y-2">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {accessStatus === 'premium-only' 
                    ? 'Premium subscribers only' 
                    : 'Available early for Premium subscribers'
                  }
                </p>
                <Button asChild size="sm" className="mt-2">
                  <Link to="/subscribe">
                    <Crown className="h-3 w-3 mr-1" />
                    Upgrade to Premium
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </MouseFollower>
    );
  }

  if (isMobile) {
    return (
      <MouseFollower intensity={0.015}>
        <Link to={`/reader/${chapterId}`} className="block">
          <Card className="relative p-3 interactive-card bg-gradient-card border-border/50 cursor-pointer group">
            {/* Premium Early Access Badge */}
            {(isEarlyAccess || isPremiumOnly) && isPremium && (
              <div className="absolute top-2 right-2">
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black">
                  <Crown className="h-3 w-3 mr-1" />
                  {isPremiumOnly ? 'Premium' : 'Early Access'}
                </Badge>
              </div>
            )}
            
            {isNewChapter() && !(isEarlyAccess || isPremiumOnly) && (
              <div className="absolute -top-2 -right-2 bg-manga-gold text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                NEW
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-base group-hover:text-manga-gold transition-colors">
                  Chapter {chapterNumber}
                </h3>
                {title && (
                  <p className="text-sm text-muted-foreground line-clamp-1 group-hover:text-foreground/80 transition-colors">
                    {title}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(releaseDate).toLocaleDateString()}
                  </div>
                  {readProgress > 0 && (
                    <span className="text-manga-gold font-medium">{Math.round(readProgress)}%</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`p-1 flex flex-col items-center hover-lift ${localIsLiked ? 'text-manga-red' : 'hover:text-manga-red/70'} transition-colors`}
                >
                  <Heart className={`h-4 w-4 ${localIsLiked ? 'fill-current' : ''}`} />
                  <span className="text-xs font-medium">{localLikeCount}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={`p-1 hover-lift ${isBookmarked ? 'text-manga-gold' : 'hover:text-manga-gold/70'} transition-colors`}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
            
            {readProgress > 0 && (
              <Progress value={readProgress} className="h-1.5 mt-2" />
            )}
          </Card>
        </Link>
      </MouseFollower>
    );
  }

  return (
    <MouseFollower intensity={0.025}>
      <Link to={`/reader/${chapterId}`} className="block">
        <Card className={`p-3 sm:p-4 transition-all duration-300 hover:shadow-md hover:shadow-primary/10 border-l-4 border-l-primary/20 hover:border-l-primary/60 group relative ${
          readProgress > 0 ? 'bg-muted/30' : ''
        }`}>
          {/* Premium Early Access Badge */}
          {(isEarlyAccess || isPremiumOnly) && isPremium && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black">
                <Crown className="h-3 w-3 mr-1" />
                {isPremiumOnly ? 'Premium' : 'Early Access'}
              </Badge>
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(releaseDate).toLocaleDateString()}</span>
                  {isNewChapter() && !(isEarlyAccess || isPremiumOnly) && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 py-0">
                      NEW
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors line-clamp-2">
                  Chapter {chapterNumber}: {title}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 ml-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex flex-col items-center p-2 hover-lift ${localIsLiked ? 'text-manga-red' : 'hover:text-manga-red/70'} transition-colors`}
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${localIsLiked ? 'fill-current' : ''}`} />
                  <span className="text-xs mt-1 font-medium">{localLikeCount}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={`p-2 hover-lift ${isBookmarked ? 'text-manga-gold' : 'hover:text-manga-gold/70'} transition-colors`}
                >
                  <Bookmark className={`h-4 w-4 sm:h-5 sm:w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
            
            {readProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(readProgress)}%</span>
                </div>
                <Progress value={readProgress} className="h-1.5" />
              </div>
            )}
          </div>
        </Card>
      </Link>
    </MouseFollower>
  );
};

export default ChapterCard;