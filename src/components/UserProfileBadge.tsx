import { Badge } from '@/components/ui/badge';
import { User, Crown, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
const UserProfileBadge = () => {
  const {
    user,
    userProfile,
    isAdmin
  } = useAuth();
  const {
    isPremium
  } = useSubscription();
  if (!user) return null;
  const displayName = userProfile?.username || user.email?.split('@')[0] || 'User';
  const roleIcon = isAdmin ? <Crown className="h-3 w-3" /> : isPremium ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />;
  const roleColor = isAdmin ? 'bg-manga-red/20 text-manga-red border-manga-red/30' : isPremium ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30' : 'bg-primary/20 text-primary border-primary/30';
  return <div className="flex items-center gap-2" data-testid="user-profile-badge" data-premium={isPremium}>
      
      <Badge variant="outline" className={`${roleColor} px-2 py-1 text-xs`}>
        {roleIcon}
        <span className="ml-1">{isAdmin ? 'Admin' : isPremium ? 'Premium' : 'Member'}</span>
      </Badge>
    </div>;
};
export default UserProfileBadge;