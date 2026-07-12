import React from 'react';
import LazyImage from '@/components/LazyImage';
import { cn } from '@/lib/utils';

interface BadgeIconProps {
  badge: {
    name: string;
    description?: string;
    icon_url?: string;
    color: string;
    rarity: string;
    is_premium: boolean;
    is_animated: boolean;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6', 
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const rarityClasses = {
  common: 'ring-2 ring-zinc-400',
  rare: 'ring-2 ring-blue-400',
  epic: 'ring-2 ring-purple-400',
  legendary: 'ring-2 ring-yellow-400'
};

export const BadgeIcon: React.FC<BadgeIconProps> = ({
  badge,
  size = 'md',
  showTooltip = true,
  className
}) => {
  const isPremium = badge.is_premium;
  const isAnimated = badge.is_animated;

  const badgeElement = (
    <div 
      className={cn(
        'relative rounded-full flex items-center justify-center overflow-hidden',
        sizeClasses[size],
        rarityClasses[badge.rarity as keyof typeof rarityClasses],
        isPremium && 'ring-gradient-primary shadow-glow',
        isAnimated && 'animate-pulse',
        className
      )}
      style={{ backgroundColor: badge.color }}
    >
      {badge.icon_url ? (
        <LazyImage
          src={badge.icon_url}
          alt={badge.name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
          {badge.name.charAt(0)}
        </div>
      )}
      
      {isPremium && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border border-white flex items-center justify-center">
          <span className="text-white text-xs">★</span>
        </div>
      )}
    </div>
  );

  if (!showTooltip) return badgeElement;

  return (
    <div className="group relative">
      {badgeElement}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <div className="bg-background border border-border rounded-md shadow-lg px-3 py-2 text-sm min-w-max">
          <div className="font-semibold text-foreground">{badge.name}</div>
          {badge.description && (
            <div className="text-muted-foreground mt-1">{badge.description}</div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={cn(
              'inline-block px-2 py-1 rounded-full text-xs font-medium',
              badge.rarity === 'common' && 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
              badge.rarity === 'rare' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
              badge.rarity === 'epic' && 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
              badge.rarity === 'legendary' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            )}>
              {badge.rarity}
            </span>
            {isPremium && (
              <span className="inline-block px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium">
                Premium
              </span>
            )}
          </div>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border"></div>
      </div>
    </div>
  );
};