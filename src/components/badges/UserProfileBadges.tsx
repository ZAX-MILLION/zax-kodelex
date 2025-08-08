import React from 'react';
import { BadgeGrid } from './BadgeGrid';
import { BadgeCustomizationPanel } from './BadgeCustomizationPanel';
import { useBadges, UserBadge } from '@/hooks/useBadges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface UserProfileBadgesProps {
  userId?: string;
  isOwnProfile?: boolean;
  maxDisplay?: number;
}

export const UserProfileBadges: React.FC<UserProfileBadgesProps> = ({
  userId,
  isOwnProfile = false,
  maxDisplay = 8
}) => {
  const { userBadges, loading, refreshUserBadges } = useBadges();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-12 h-12 bg-muted rounded-full"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>Badges</span>
            <span className="text-sm font-normal text-muted-foreground">
              ({userBadges.filter(b => b.is_equipped && b.visibility === 'public').length})
            </span>
          </CardTitle>
          
          {isOwnProfile && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Customize Your Badges</DialogTitle>
                </DialogHeader>
                <BadgeCustomizationPanel
                  userBadges={userBadges}
                  onUpdate={refreshUserBadges}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <BadgeGrid
          badges={userBadges as any}
          isOwnProfile={isOwnProfile}
          maxDisplay={maxDisplay}
        />
      </CardContent>
    </Card>
  );
};