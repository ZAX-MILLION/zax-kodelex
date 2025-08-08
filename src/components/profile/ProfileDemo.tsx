import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatarTrigger } from './UserAvatarTrigger';
import { ProfileEditModal } from './ProfileEditModal';
import { UserProfileBadges } from '@/components/badges/UserProfileBadges';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Users, Award } from 'lucide-react';

export const ProfileDemo: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  if (!user || !userProfile) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profile System Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please sign in to test the profile system.</p>
        </CardContent>
      </Card>
    );
  }

  const mockUserProfile = {
    username: userProfile.username,
    display_name: null,
    profile_picture_url: null,
    email: user.email || 'user@example.com'
  };

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profile System Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Avatar Only (Click to view profile)</h3>
            <UserAvatarTrigger
              userId={user.id}
              userProfile={mockUserProfile}
              size="lg"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Avatar with Name (Click to view profile)</h3>
            <UserAvatarTrigger
              userId={user.id}
              userProfile={mockUserProfile}
              size="md"
              showName={true}
            />
          </div>

          <Button onClick={() => setShowEditModal(true)} className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Edit Your Profile
          </Button>

          <div className="text-xs text-muted-foreground">
            <p>✅ Phase 2 Features:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Full Discord-style badge system</li>
              <li>Admin-assigned & auto-earned badges</li>
              <li>Premium animated badges with effects</li>
              <li>User customization panel</li>
              <li>Badge visibility & ordering controls</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
      {user && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};