import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserProfileModal } from './UserProfileModal';
import { ProfileEditModal } from './ProfileEditModal';
import { useAuth } from '@/contexts/AuthContext';

interface UserAvatarTriggerProps {
  userId: string;
  userProfile?: {
    username?: string | null;
    display_name?: string | null;
    profile_picture_url?: string | null;
    email: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const UserAvatarTrigger: React.FC<UserAvatarTriggerProps> = ({
  userId,
  userProfile,
  size = 'md',
  showName = false,
  className = ''
}) => {
  const { user: currentUser } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const isOwnProfile = currentUser?.id === userId;

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const displayName = userProfile?.display_name || 
                     userProfile?.username || 
                     userProfile?.email?.split('@')[0] || 
                     'User';

  const avatarLetter = userProfile?.display_name?.[0]?.toUpperCase() || 
                      userProfile?.username?.[0]?.toUpperCase() || 
                      userProfile?.email?.[0]?.toUpperCase() || 
                      'U';

  const handleClick = () => {
    setShowProfileModal(true);
  };

  const handleEditProfile = () => {
    setShowProfileModal(false);
    setShowEditModal(true);
  };

  const handleProfileUpdated = () => {
    // Optionally refresh profile data here
    setShowEditModal(false);
  };

  if (showName) {
    return (
      <>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 p-2 h-auto ${className}`}
          onClick={handleClick}
        >
          <Avatar className={sizeClasses[size]}>
            <AvatarImage src={userProfile?.profile_picture_url || ''} />
            <AvatarFallback className={textSizeClasses[size]}>
              {avatarLetter}
            </AvatarFallback>
          </Avatar>
          <span className={`font-medium hover:underline ${textSizeClasses[size]}`}>
            {displayName}
          </span>
        </Button>

        <UserProfileModal
          userId={userId}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          isOwnProfile={isOwnProfile}
          onEditProfile={handleEditProfile}
        />

        {isOwnProfile && (
          <ProfileEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`rounded-full transition-opacity hover:opacity-80 ${className}`}
      >
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={userProfile?.profile_picture_url || ''} />
          <AvatarFallback className={textSizeClasses[size]}>
            {avatarLetter}
          </AvatarFallback>
        </Avatar>
      </button>

      <UserProfileModal
        userId={userId}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        isOwnProfile={isOwnProfile}
        onEditProfile={handleEditProfile}
      />

      {isOwnProfile && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </>
  );
};