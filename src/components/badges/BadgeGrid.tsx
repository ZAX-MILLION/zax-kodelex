import React from 'react';
import { BadgeIcon } from './BadgeIcon';
import { cn } from '@/lib/utils';

interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  color: string;
  rarity: string;
  is_premium: boolean;
  is_animated: boolean;
  is_hidden: boolean;
  category: string;
}

interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  granted_by?: string;
  granted_at: string;
  visibility: string;
  is_equipped: boolean;
  display_order: number;
  notes?: string;
  badge: Badge;
}

interface BadgeGridProps {
  badges: UserBadge[];
  isOwnProfile?: boolean;
  onReorder?: (badges: UserBadge[]) => void;
  maxDisplay?: number;
  className?: string;
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({
  badges,
  isOwnProfile = false,
  onReorder,
  maxDisplay,
  className
}) => {
  // Filter and sort badges
  const displayBadges = React.useMemo(() => {
    let filteredBadges = badges.filter(userBadge => {
      // Show all badges to owner, only public visible badges to others
      if (isOwnProfile) return true;
      return userBadge.visibility === 'public' && userBadge.is_equipped && !userBadge.badge.is_hidden;
    });

    // Sort by display order, then by granted date
    filteredBadges.sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return new Date(b.granted_at).getTime() - new Date(a.granted_at).getTime();
    });

    // Limit display if specified
    if (maxDisplay && filteredBadges.length > maxDisplay) {
      filteredBadges = filteredBadges.slice(0, maxDisplay);
    }

    return filteredBadges;
  }, [badges, isOwnProfile, maxDisplay]);

  if (displayBadges.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-muted-foreground">
          {isOwnProfile ? 'No badges earned yet' : 'No badges to display'}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Badge Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {displayBadges.map((userBadge) => (
          <div key={userBadge.id} className="flex flex-col items-center space-y-1">
            <BadgeIcon
              badge={userBadge.badge}
              size="lg"
              showTooltip={true}
              className={cn(
                'transition-all duration-200',
                !userBadge.is_equipped && isOwnProfile && 'opacity-50 grayscale',
                userBadge.badge.is_premium && 'shadow-lg'
              )}
            />
            {isOwnProfile && (
              <div className="text-xs text-muted-foreground text-center">
                {userBadge.visibility === 'private' && '🔒'}
                {!userBadge.is_equipped && '👁️‍🗨️'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show more indicator */}
      {maxDisplay && badges.length > maxDisplay && (
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            +{badges.length - maxDisplay} more badges
          </span>
        </div>
      )}
    </div>
  );
};