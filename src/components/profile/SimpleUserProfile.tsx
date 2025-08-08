import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Crown, 
  Shield, 
  MessageSquare, 
  Flag, 
  Calendar,
  UserPlus,
  UserMinus
} from 'lucide-react';

interface SimpleUserProfileProps {
  userId: string;
  trigger: React.ReactNode;
}

export const SimpleUserProfile = ({ userId, trigger }: SimpleUserProfileProps) => {
  const { user: currentUser, isAdmin } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock profile data since we're simplifying
    setProfile({
      username: 'Sample User',
      email: 'user@example.com',
      role: 'member',
      created_at: new Date().toISOString(),
      activity_score: 100,
      is_banned: false
    });
    setLoading(false);
  }, [userId]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'editor':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'author':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  if (loading) {
    return (
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                {profile?.username?.[0]?.toUpperCase() || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile?.username}</h2>
              <Badge variant="outline" className={getRoleColor(profile?.role)}>
                <Crown className="h-3 w-3 mr-1" />
                {profile?.role}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Joined {new Date(profile?.created_at).toLocaleDateString()}
            </div>

            {currentUser?.id !== userId && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Follow
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};