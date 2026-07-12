import { useSubscription } from '@/hooks/useSubscription';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdContainerProps {
  position: 'header' | 'sidebar' | 'footer' | 'between-pages';
  className?: string;
}

const AdContainer = ({ position, className = '' }: AdContainerProps) => {
  const { isPremium } = useSubscription();
  
  // Don't render ads for premium users
  if (isPremium) {
    return null;
  }

  const getAdContent = () => {
    switch (position) {
      case 'header':
        return {
          title: 'Support Our Manga Collection',
          description: 'Upgrade to Premium for an ad-free reading experience',
          size: 'h-20'
        };
      case 'sidebar':
        return {
          title: 'Go Premium',
          description: 'Remove all ads and unlock exclusive features',
          size: 'h-40'
        };
      case 'footer':
        return {
          title: 'Enjoying the manga?',
          description: 'Support us by upgrading to Premium',
          size: 'h-14'
        };
      case 'between-pages':
        return {
          title: 'Continue Reading Ad-Free',
          description: 'Join Premium for uninterrupted manga reading',
          size: 'h-32'
        };
      default:
        return {
          title: 'Advertisement',
          description: 'Support our platform',
          size: 'h-24'
        };
    }
  };

  const adContent = getAdContent();

  // Don't show ads for premium users
  if (isPremium) {
    return null;
  }


  return (
    <Card 
      className={`${adContent.size} ${className} relative flex items-center justify-between bg-muted/20 border border-muted-foreground/10 backdrop-blur-sm rounded-lg`}
      data-ad-container="true"
      data-testid="ad-container"
    >
      <div className="absolute top-1 right-1">
        <span className="text-xs text-muted-foreground bg-background px-1 rounded">AD</span>
      </div>
      
      {position === 'footer' ? (
        // Compact horizontal layout for footer
        <div className="flex items-center justify-between w-full px-4 py-2">
          <div className="flex items-center gap-3">
            <Crown className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="flex flex-col">
              <h4 className="font-medium text-sm leading-tight">{adContent.title}</h4>
              <p className="text-xs text-muted-foreground leading-tight">{adContent.description}</p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button asChild size="sm" className="h-8 px-3">
              <Link to="/subscribe">
                <Crown className="h-3 w-3 mr-1" />
                Go Premium
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        // Original layout for other positions
        <div className="text-center space-y-2 px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">{adContent.title}</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{adContent.description}</p>
          
          {position !== 'header' && (
            <div className="flex flex-col gap-2 mt-3">
              <Button asChild size="sm" className="w-full">
                <Link to="/subscribe">
                  <Crown className="h-3 w-3 mr-1" />
                  Go Premium
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="text-xs h-6">
                <Link to="/support">
                  Learn More
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default AdContainer;