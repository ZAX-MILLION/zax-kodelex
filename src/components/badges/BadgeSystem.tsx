import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  BookOpen, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Star, 
  Trophy, 
  Zap, 
  Shield, 
  Crown,
  Flame,
  Target,
  Users,
  Award,
  Gem,
  TrendingUp,
  Clock
} from 'lucide-react';

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  dateEarned?: string;
  progress?: number;
  maxProgress?: number;
  hidden?: boolean;
}

export const AVAILABLE_BADGES: UserBadge[] = [
  {
    id: 'first_chapter',
    name: 'First Steps',
    description: 'Read your first chapter',
    icon: <BookOpen className="h-4 w-4" />,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    rarity: 'common',
  },
  {
    id: 'daily_login_streak_7',
    name: 'Weekly Warrior',
    description: 'Log in for 7 consecutive days',
    icon: <Calendar className="h-4 w-4" />,
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    rarity: 'common',
  },
  {
    id: 'daily_login_streak_30',
    name: 'Monthly Master',
    description: 'Log in for 30 consecutive days',
    icon: <Flame className="h-4 w-4" />,
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    rarity: 'rare',
  },
  {
    id: 'year_member',
    name: 'Anniversary Veteran',
    description: 'Active member for 1 year',
    icon: <Crown className="h-4 w-4" />,
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    rarity: 'epic',
  },
  {
    id: 'site_contributor',
    name: 'Community Builder',
    description: 'Made significant contributions to the site',
    icon: <Users className="h-4 w-4" />,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    rarity: 'rare',
    hidden: true,
  },
  {
    id: 'bug_reporter',
    name: 'Quality Guardian',
    description: 'Reported bugs that helped improve the site',
    icon: <Shield className="h-4 w-4" />,
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    rarity: 'rare',
    hidden: true,
  },
  {
    id: 'chapters_100',
    name: 'Chapter Conqueror',
    description: 'Read 100 chapters',
    icon: <Target className="h-4 w-4" />,
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    rarity: 'rare',
  },
  {
    id: 'comments_master',
    name: 'Discussion Expert',
    description: 'Posted 50 meaningful comments',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    rarity: 'rare',
  },
  {
    id: 'premium_supporter',
    name: 'Premium Pioneer',
    description: 'Support the site with Premium subscription',
    icon: <Gem className="h-4 w-4" />,
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    rarity: 'epic',
  },
  {
    id: 'speed_reader',
    name: 'Lightning Reader',
    description: 'Read 10 chapters in a single day',
    icon: <Zap className="h-4 w-4" />,
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    rarity: 'rare',
  },
  {
    id: 'early_adopter',
    name: 'Pioneer',
    description: 'One of the first 1000 members',
    icon: <Star className="h-4 w-4" />,
    color: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
    rarity: 'legendary',
    hidden: true,
  },
  {
    id: 'series_completionist',
    name: 'Series Master',
    description: 'Completed reading 5 full manga series',
    icon: <Trophy className="h-4 w-4" />,
    color: 'bg-gold-500/20 text-gold-400 border-gold-500/30',
    rarity: 'epic',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Read chapters between 12 AM - 6 AM for 7 days',
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    rarity: 'rare',
  },
  {
    id: 'trending_finder',
    name: 'Trend Spotter',
    description: 'Discovered 10 trending series before they became popular',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rarity: 'epic',
    hidden: true,
  }
];

interface BadgeSystemProps {
  userBadges: UserBadge[];
  showAll?: boolean;
}

export const BadgeSystem: React.FC<BadgeSystemProps> = ({ userBadges, showAll = false }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-500/10 border-gray-500/20';
      case 'rare':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'epic':
        return 'bg-purple-500/10 border-purple-500/20';
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const earnedBadges = userBadges.filter(badge => badge.dateEarned);
  const unlockedBadges = showAll ? AVAILABLE_BADGES.filter(badge => !badge.hidden) : earnedBadges;

  return (
    <div className="space-y-6">
      {earnedBadges.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Earned Badges ({earnedBadges.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map((badge) => (
              <Card key={badge.id} className={`p-4 ${getRarityColor(badge.rarity)} hover:scale-105 transition-transform duration-200`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${badge.color.split(' ')[0]} flex-shrink-0`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-foreground text-sm truncate">{badge.name}</h5>
                      <Badge variant="outline" className={`text-xs ${badge.color} opacity-70`}>
                        {badge.rarity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{badge.description}</p>
                    {badge.dateEarned && (
                      <p className="text-xs text-muted-foreground/70">
                        Earned {new Date(badge.dateEarned).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showAll && (
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            Available Badges
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_BADGES.filter(badge => !badge.hidden && !earnedBadges.find(earned => earned.id === badge.id)).map((badge) => (
              <Card key={badge.id} className={`p-4 ${getRarityColor(badge.rarity)} opacity-60 hover:opacity-80 transition-opacity duration-200`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-muted/50 flex-shrink-0`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-muted-foreground text-sm truncate">{badge.name}</h5>
                      <Badge variant="outline" className="text-xs opacity-50">
                        {badge.rarity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground/70 line-clamp-2">???</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {earnedBadges.length === 0 && (
        <Card className="p-8 text-center">
          <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h4 className="text-lg font-semibold text-foreground mb-2">No Badges Yet</h4>
          <p className="text-muted-foreground text-sm">
            Start reading and participating to earn your first badge!
          </p>
        </Card>
      )}
    </div>
  );
};

// Utility function to check and award badges
export const checkAndAwardBadges = (userStats: any): UserBadge[] => {
  const awardedBadges: UserBadge[] = [];
  const now = new Date().toISOString();

  // Check each badge condition
  if (userStats.totalChaptersRead >= 1) {
    const badge = AVAILABLE_BADGES.find(b => b.id === 'first_chapter');
    if (badge) {
      awardedBadges.push({ ...badge, dateEarned: now });
    }
  }

  if (userStats.totalChaptersRead >= 100) {
    const badge = AVAILABLE_BADGES.find(b => b.id === 'chapters_100');
    if (badge) {
      awardedBadges.push({ ...badge, dateEarned: now });
    }
  }

  if (userStats.commentsCount >= 50) {
    const badge = AVAILABLE_BADGES.find(b => b.id === 'comments_master');
    if (badge) {
      awardedBadges.push({ ...badge, dateEarned: now });
    }
  }

  if (userStats.readingStreak >= 7) {
    const badge = AVAILABLE_BADGES.find(b => b.id === 'daily_login_streak_7');
    if (badge) {
      awardedBadges.push({ ...badge, dateEarned: now });
    }
  }

  if (userStats.readingStreak >= 30) {
    const badge = AVAILABLE_BADGES.find(b => b.id === 'daily_login_streak_30');
    if (badge) {
      awardedBadges.push({ ...badge, dateEarned: now });
    }
  }

  // Add more badge logic as needed
  return awardedBadges;
};