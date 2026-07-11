import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Zap, DollarSign, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SocialPlatform {
  id: string;
  platform_name: string;
  platform_url: string;
  icon_type: string;
  platform_color?: string;
  display_order: number;
}

interface SupportWidgetProps {
  className?: string;
}

const getIconForPlatform = (platformName: string) => {
  switch (platformName.toLowerCase()) {
    case 'patreon':
      return Heart;
    case 'discord':
      return Users;
    case 'paypal':
      return DollarSign;
    case 'ko-fi':
      return Zap;
    default:
      return Heart;
  }
};

const SupportWidget = ({ className = '' }: SupportWidgetProps) => {
  const [socialPlatforms, setSocialPlatforms] = useState<SocialPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchSocialPlatforms();
  }, []);

  const fetchSocialPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_settings')
        .select('*')
        .eq('is_enabled', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSocialPlatforms(data || []);
    } catch (error) {
      console.error('Error fetching social platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={`bg-gradient-to-r from-primary/10 to-destructive/10 border border-primary/20 ${className}`}>
        <CardContent className="p-4 text-center">
          <div className="animate-pulse flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-muted rounded-full" />
            <div className="h-4 bg-muted rounded w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-r from-primary/10 to-destructive/10 border border-primary/20 hover:border-primary/40 transition-all duration-300 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Main Support Button */}
          <Button
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 text-primary hover:text-destructive font-semibold group"
          >
            <Heart className="h-5 w-5 fill-current group-hover:scale-110 transition-transform" />
            <span>Support Zax Million</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Button>

          {/* Social Platform Buttons */}
          {socialPlatforms.length > 0 && (
            <div className={`transition-all duration-300 ease-in-out ${
              isOpen 
                ? 'opacity-100 translate-x-0 max-w-xs' 
                : 'opacity-0 translate-x-4 max-w-0 pointer-events-none overflow-hidden'
            }`}>
              <div className="flex items-center gap-2 whitespace-nowrap">
                {socialPlatforms.slice(0, 3).map((platform) => {
                  const IconComponent = getIconForPlatform(platform.platform_name);
                  return (
                    <Button
                      key={platform.id}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 hover:scale-110 transition-all duration-200 bg-background/50 hover:bg-background border-primary/20 hover:border-primary/40"
                      asChild
                    >
                      <a 
                        href={platform.platform_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title={`Support us on ${platform.platform_name}`}
                      >
                        <IconComponent 
                          className="h-4 w-4" 
                          style={{ color: platform.platform_color || 'currentColor' }} 
                        />
                      </a>
                    </Button>
                  );
                })}
                
                {socialPlatforms.length > 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs hover:scale-105 transition-all duration-200 bg-background/50 hover:bg-background border-primary/20 hover:border-primary/40"
                    onClick={() => {
                      // Open all platforms in new tabs
                      socialPlatforms.slice(3).forEach(platform => {
                        window.open(platform.platform_url, '_blank', 'noopener,noreferrer');
                      });
                    }}
                  >
                    +{socialPlatforms.length - 3}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportWidget;