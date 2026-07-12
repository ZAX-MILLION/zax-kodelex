import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChapterUnlockPopup from './ChapterUnlockPopup';
import AuthModal from './AuthModal';

interface ChapterAccessHandlerProps {
  chapterId: string;
  chapterTitle: string;
  isLocked: boolean;
  unlockCost?: number;
  onAccess?: () => void;
  children: React.ReactNode;
}

export const ChapterAccessHandler: React.FC<ChapterAccessHandlerProps> = ({
  chapterId,
  chapterTitle,
  isLocked,
  unlockCost = 10,
  onAccess,
  children
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showUnlockPopup, setShowUnlockPopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleChapterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLocked) {
      // Chapter is free, allow access
      onAccess?.();
      return;
    }

    // Chapter is locked
    if (!user) {
      // User not logged in, show auth modal
      setShowAuthModal(true);
      return;
    }

    // User is logged in, show unlock popup
    setShowUnlockPopup(true);
  };

  const handleUnlocked = () => {
    setShowUnlockPopup(false);
    onAccess?.();
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // After login, show unlock popup
    setShowUnlockPopup(true);
  };

  return (
    <>
      <div onClick={handleChapterClick} className="cursor-pointer">
        {children}
      </div>

      {/* Unlock popup for logged-in users */}
      <ChapterUnlockPopup
        isOpen={showUnlockPopup}
        onClose={() => setShowUnlockPopup(false)}
        chapterId={chapterId}
        chapterTitle={chapterTitle}
        unlockCost={unlockCost}
        onUnlocked={handleUnlocked}
      />

      {/* Auth modal for guests */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          // After successful auth, show unlock popup
          if (user) {
            setShowUnlockPopup(true);
          }
        }}
      />
    </>
  );
};

export default ChapterAccessHandler;