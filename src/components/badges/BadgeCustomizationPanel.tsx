import React, { useState } from 'react';
import { BadgeIcon } from './BadgeIcon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Lock, Unlock, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  badge_id?: string;
  new_badge_id?: string;
  granted_by?: string;
  granted_at: string;
  visibility: string;
  is_equipped: boolean;
  display_order: number;
  notes?: string;
  badge?: Badge;
}

interface BadgeCustomizationPanelProps {
  userBadges: UserBadge[];
  onUpdate: () => void;
}

export const BadgeCustomizationPanel: React.FC<BadgeCustomizationPanelProps> = ({
  userBadges,
  onUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateBadgeSettings = async (
    badgeId: string,
    updates: Partial<Pick<UserBadge, 'is_equipped' | 'visibility' | 'display_order'>>
  ) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_badge_assignments')
        .update(updates)
        .eq('id', badgeId);

      if (error) throw error;

      toast({
        title: 'Badge updated',
        description: 'Your badge settings have been saved.',
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating badge:', error);
      toast({
        title: 'Error',
        description: 'Failed to update badge settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBadgeVisibility = (userBadge: UserBadge) => {
    const newVisibility = userBadge.visibility === 'public' ? 'private' : 'public';
    updateBadgeSettings(userBadge.id, { visibility: newVisibility });
  };

  const toggleBadgeEquipped = (userBadge: UserBadge) => {
    updateBadgeSettings(userBadge.id, { is_equipped: !userBadge.is_equipped });
  };

  // Group badges by category
  const badgesByCategory = React.useMemo(() => {
    const categories: Record<string, UserBadge[]> = {};
    
    userBadges.forEach(userBadge => {
      if (!userBadge.badge) return;
      
      const category = userBadge.badge.category || 'general';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(userBadge);
    });

    // Sort badges within each category by display order
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => a.display_order - b.display_order);
    });

    return categories;
  }, [userBadges]);

  const visibleBadgesCount = userBadges.filter(ub => ub.is_equipped && ub.visibility === 'public').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Badge Customization</span>
          <div className="text-sm text-muted-foreground">
            {visibleBadgesCount} visible badges
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{userBadges.length}</div>
              <div className="text-xs text-muted-foreground">Total Badges</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">{visibleBadgesCount}</div>
              <div className="text-xs text-muted-foreground">Visible</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">
                {userBadges.filter(ub => ub.badge?.is_premium).length}
              </div>
              <div className="text-xs text-muted-foreground">Premium</div>
            </div>
          </div>

          {/* Badge Categories */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="achievement">Achievements</TabsTrigger>
              <TabsTrigger value="milestone">Milestones</TabsTrigger>
              <TabsTrigger value="special">Special</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {Object.entries(badgesByCategory).map(([category, badges]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {badges.map((userBadge) => (
                      <BadgeCustomizationItem
                        key={userBadge.id}
                        userBadge={userBadge}
                        onToggleVisibility={() => toggleBadgeVisibility(userBadge)}
                        onToggleEquipped={() => toggleBadgeEquipped(userBadge)}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Category-specific tabs */}
            {Object.entries(badgesByCategory).map(([category, badges]) => (
              <TabsContent key={category} value={category} className="space-y-2 mt-4">
                {badges.map((userBadge) => (
                  <BadgeCustomizationItem
                    key={userBadge.id}
                    userBadge={userBadge}
                    onToggleVisibility={() => toggleBadgeVisibility(userBadge)}
                    onToggleEquipped={() => toggleBadgeEquipped(userBadge)}
                    isLoading={isLoading}
                  />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

interface BadgeCustomizationItemProps {
  userBadge: UserBadge;
  onToggleVisibility: () => void;
  onToggleEquipped: () => void;
  isLoading: boolean;
}

const BadgeCustomizationItem: React.FC<BadgeCustomizationItemProps> = ({
  userBadge,
  onToggleVisibility,
  onToggleEquipped,
  isLoading
}) => {
  if (!userBadge.badge) return null;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center space-x-3">
        <BadgeIcon
          badge={userBadge.badge}
          size="md"
          showTooltip={false}
          className={cn(!userBadge.is_equipped && 'opacity-50 grayscale')}
        />
        <div className="flex-1">
          <div className="font-medium text-sm">{userBadge.badge.name}</div>
          <div className="text-xs text-muted-foreground">
            {userBadge.badge.description}
          </div>
          {userBadge.granted_by && (
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Manually granted
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Visibility Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          {userBadge.visibility === 'public' ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>

        {/* Equipped Toggle */}
        <Switch
          checked={userBadge.is_equipped}
          onCheckedChange={onToggleEquipped}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};