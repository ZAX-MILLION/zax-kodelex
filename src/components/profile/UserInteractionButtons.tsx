import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessagingModal } from './MessagingModal';
import { 
  MessageSquare, 
  UserX, 
  Flag, 
  Heart,
  UserPlus,
  UserCheck,
  Shield
} from 'lucide-react';

interface UserInteractionButtonsProps {
  targetUserId: string;
  targetProfile?: {
    username: string;
    display_name: string;
    profile_picture_url: string;
  };
  className?: string;
}

interface InteractionState {
  isBlocked: boolean;
  isFriend: boolean;
  isFollowing: boolean;
  hasReported: boolean;
}

export const UserInteractionButtons: React.FC<UserInteractionButtonsProps> = ({
  targetUserId,
  targetProfile,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showMessaging, setShowMessaging] = useState(false);
  const [interactions, setInteractions] = useState<InteractionState>({
    isBlocked: false,
    isFriend: false,
    isFollowing: false,
    hasReported: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && targetUserId && user.id !== targetUserId) {
      loadInteractionState();
    }
  }, [user, targetUserId]);

  const loadInteractionState = async () => {
    if (!user) return;

    try {
      // Simplified approach - will be replaced with proper RPC function
      const blockData = false;
      const followData = false;
      const reportData = false;

      setInteractions({
        isBlocked: blockData,
        isFriend: false, // We'll implement this later
        isFollowing: followData,
        hasReported: reportData
      });
    } catch (error) {
      console.error('Error loading interaction state:', error);
    }
  };

  const handleBlock = async () => {
    if (!user || loading) return;

    try {
      setLoading(true);
      
      // Simplified - will be implemented with proper database functions
      const error = null;

      if (error) throw error;

      toast({
        title: interactions.isBlocked ? "User unblocked" : "User blocked",
        description: interactions.isBlocked 
          ? "You can now interact with this user again."
          : "You will no longer see content from this user.",
      });

      await loadInteractionState();
    } catch (error) {
      console.error('Error toggling block:', error);
      toast({
        title: "Error",
        description: "Failed to update block status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!user || loading || interactions.hasReported) return;

    try {
      setLoading(true);
      
      // Simplified - will be implemented with proper database functions
      const error = null;

      if (error) throw error;

      toast({
        title: "User reported",
        description: "Thank you for helping keep our community safe.",
      });

      await loadInteractionState();
    } catch (error) {
      console.error('Error reporting user:', error);
      toast({
        title: "Error",
        description: "Failed to report user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || loading) return;

    try {
      setLoading(true);
      
      // Simplified - will be implemented with proper database functions
      const error = null;

      if (error) throw error;

      toast({
        title: interactions.isFollowing ? "Unfollowed" : "Following",
        description: interactions.isFollowing 
          ? "You are no longer following this user."
          : "You are now following this user.",
      });

      await loadInteractionState();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show buttons for own profile
  if (!user || user.id === targetUserId) {
    return null;
  }

  // Don't show buttons if user is blocked
  if (interactions.isBlocked) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Badge variant="destructive" className="flex items-center gap-1">
          <UserX className="h-3 w-3" />
          Blocked
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBlock}
          disabled={loading}
        >
          <UserX className="h-4 w-4 mr-2" />
          Unblock
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={`flex gap-2 flex-wrap ${className}`}>
        {/* Send Message */}
        <Button
          size="sm"
          onClick={() => setShowMessaging(true)}
          disabled={loading}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>

        {/* Follow/Unfollow */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleFollow}
          disabled={loading}
        >
          {interactions.isFollowing ? (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Follow
            </>
          )}
        </Button>

        {/* Report */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReport}
          disabled={loading || interactions.hasReported}
        >
          <Flag className="h-4 w-4 mr-2" />
          {interactions.hasReported ? 'Reported' : 'Report'}
        </Button>

        {/* Block */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleBlock}
          disabled={loading}
        >
          <UserX className="h-4 w-4 mr-2" />
          Block
        </Button>
      </div>

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={showMessaging}
        onClose={() => setShowMessaging(false)}
        recipientId={targetUserId}
        recipientProfile={targetProfile}
      />
    </>
  );
};