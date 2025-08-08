import React, { useState } from 'react';
import { UserProfileModal } from './UserProfileModal';
import { ProfileTabs } from './ProfileTabs';
import { UserInteractionButtons } from './UserInteractionButtons';
import { UserModerationPanel } from './UserModerationPanel';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedUserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export const EnhancedUserProfileModal: React.FC<EnhancedUserProfileModalProps> = ({
  userId,
  isOpen,
  onClose,
  isOwnProfile = false,
  onEditProfile
}) => {
  const { user, isAdmin } = useAuth();
  const [activeView, setActiveView] = useState<'profile' | 'moderation'>('profile');

  if (!isOpen || !userId) return null;

  return (
    <UserProfileModal
      userId={userId}
      isOpen={isOpen}
      onClose={onClose}
      isOwnProfile={isOwnProfile}
      onEditProfile={onEditProfile}
    />
  );
};