import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useProfile } from '@/hooks/useProfile';
import { useBadges } from '@/hooks/useBadges';
import { format } from 'date-fns';
import { 
  MessageSquare, 
  Calendar, 
  User, 
  Shield, 
  Edit3,
  Crown,
  Star,
  X
} from 'lucide-react';

interface QuickProfileCardProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  onSendMessage?: (userId: string) => void;
  isOwnProfile?: boolean;
}

export const QuickProfileCard: React.FC<QuickProfileCardProps> = ({
  userId,
  isOpen,
  onClose,
  position = { x: 0, y: 0 },
  onSendMessage,
  isOwnProfile = false
}) => {
  const { getProfile, loading } = useProfile();
  const { userBadges, loading: badgesLoading } = useBadges();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadProfile();
    }
  }, [isOpen, userId]);

  const loadProfile = async () => {
    const profileData = await getProfile(userId);
    setProfile(profileData);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-3 w-3" />;
      case 'author': return <Edit3 className="h-3 w-3" />;
      case 'premium': return <Crown className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-manga-red/20 text-manga-red border-manga-red/30';
      case 'author': return 'bg-primary/20 text-primary border-primary/30';
      case 'premium': return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-secondary/20 text-secondary-foreground border-secondary/30';
    }
  };

  const equippedBadges = userBadges.filter(badge => 
    badge.is_equipped && badge.visibility === 'public'
  ).slice(0, 3);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.min(position.y, window.innerHeight - 400)
      }}
    >
      <Card className="w-80 shadow-xl border-2 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : profile ? (
            <div className="space-y-4">
              {/* Header with close button */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.profile_picture_url || ''} />
                    <AvatarFallback>
                      {profile.display_name?.[0]?.toUpperCase() || 
                       profile.username?.[0]?.toUpperCase() || 
                       profile.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {profile.display_name || profile.username || profile.email.split('@')[0]}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className={`${getRoleBadgeColor(profile.role)} text-xs px-1.5 py-0.5`}>
                        {getRoleIcon(profile.role)}
                        <span className="ml-1 capitalize">{profile.role}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Badges */}
              {equippedBadges.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Badges</h4>
                  <div className="flex gap-1">
                    {equippedBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="relative group"
                        title={badge.badge?.name || 'Badge'}
                      >
                        {badge.badge?.icon_url ? (
                          <img 
                            src={badge.badge.icon_url} 
                            alt={badge.badge.name}
                            className="w-6 h-6 rounded"
                          />
                        ) : (
                          <div 
                            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                            style={{ 
                              backgroundColor: badge.badge?.color || '#6366f1',
                              color: 'white'
                            }}
                          >
                            <Star className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Join Date */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Joined {format(new Date(profile.join_date || profile.created_at), 'MMMM yyyy')}
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 h-8 text-xs"
                    onClick={() => onSendMessage?.(userId)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Profile not found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};