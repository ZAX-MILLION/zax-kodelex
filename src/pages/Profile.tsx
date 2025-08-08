import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BadgeSystem, checkAndAwardBadges, type UserBadge } from '@/components/badges/BadgeSystem';
import ThemeSelector from '@/components/ThemeSelector';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ProfileCustomizationSimple } from '@/components/profile/ProfileCustomizationSimple';
import SEOHelmet from '@/components/SEOHelmet';
import { 
  User, 
  BookOpen, 
  Clock, 
  Activity, 
  Settings, 
  Shield,
  Calendar,
  TrendingUp,
  Bookmark,
  MessageSquare,
  Award,
  Edit3,
  Save,
  X,
  Palette,
  Globe,
  Bell,
  History,
  Star,
  Mail,
  Eye
} from 'lucide-react';

interface UserStats {
  totalChaptersRead: number;
  totalReadingTime: number;
  bookmarksCount: number;
  commentsCount: number;
  favoriteGenres: string[];
  readingStreak: number;
  completionRate: number;
  lastReadChapter?: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

const Profile = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState<UserStats>({
    totalChaptersRead: 0,
    totalReadingTime: 0,
    bookmarksCount: 0,
    commentsCount: 0,
    favoriteGenres: [],
    readingStreak: 0,
    completionRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    readingReminders: false,
    privateProfile: false,
  });

  useEffect(() => {
    if (user && userProfile) {
      setUsername(userProfile.username || '');
      fetchUserStats();
      fetchRecentActivity();
    }
  }, [user, userProfile]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Fetch reading progress stats
      const { data: progressData } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id);

      // Fetch bookmarks count
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id);

      // Fetch comments count  
      const { data: commentsData } = await supabase
        .from('comments')
        .select('id')
        .eq('user_id', user.id);

      // Calculate stats
      const completedChapters = progressData?.filter(p => p.completed) || [];
      const totalReadingTime = progressData?.reduce((acc, p) => acc + (p.current_page * 2), 0) || 0;

      const stats = {
        totalChaptersRead: completedChapters.length,
        totalReadingTime: Math.round(totalReadingTime / 60),
        bookmarksCount: bookmarksData?.length || 0,
        commentsCount: commentsData?.length || 0,
        favoriteGenres: ['Action', 'Adventure', 'Fantasy'],
        readingStreak: 7,
        completionRate: progressData?.length ? Math.round((completedChapters.length / progressData.length) * 100) : 0,
      };

      setUserStats(stats);

      // Check and award badges based on stats
      const badges = checkAndAwardBadges(stats);
      setUserBadges(badges);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    if (!user) return;

    // Mock recent activity for now
    const mockActivity: RecentActivity[] = [
      { id: '1', type: 'chapter_read', description: 'Read Chapter 15: The Final Battle', timestamp: new Date().toISOString() },
      { id: '2', type: 'comment_posted', description: 'Posted a comment on "Dragon Slayer Chronicles"', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', type: 'bookmark_added', description: 'Bookmarked "Mystic Academy"', timestamp: new Date(Date.now() - 172800000).toISOString() },
    ];
    setRecentActivity(mockActivity);
  };

  const handleUpdateProfile = async () => {
    if (!user || !userProfile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setEditMode(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from('user_privacy_preferences')
        .upsert({
          user_id: user?.id,
          notifications_enabled: settings.notifications,
          email_updates_enabled: settings.emailUpdates,
          reading_reminders_enabled: settings.readingReminders,
          private_profile: settings.privateProfile,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings saved successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'author': return <Edit3 className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'author': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHelmet title="Profile - Login Required" />
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="space-y-6">
            <User className="h-24 w-24 mx-auto text-muted-foreground/50" />
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Please Sign In</h1>
              <p className="text-muted-foreground">You need to be logged in to view your profile</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHelmet 
        title="Profile - Manga Reader"
        description="Manage your manga reading profile, view achievements, and customize your reading experience."
        keywords="manga profile, reading history, achievements, user settings"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={''} />
                <AvatarFallback className="text-2xl">
                  {userProfile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {editMode ? (
                    <div className="flex items-center gap-3">
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="text-lg font-bold"
                      />
                      <Button size="sm" onClick={handleUpdateProfile}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold">
                        {username || user.email?.split('@')[0] || 'Reader'}
                      </h1>
                      <Button size="sm" variant="ghost" onClick={() => setEditMode(true)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Badge variant="outline" className={getRoleBadgeColor(userProfile?.role || 'user')}>
                    {getRoleIcon(userProfile?.role || 'user')}
                    <span className="ml-2 capitalize">{userProfile?.role || 'User'}</span>
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {new Date(user.created_at || '').toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {userStats.totalChaptersRead} chapters read
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.totalChaptersRead}</div>
              <div className="text-sm text-muted-foreground">Chapters Read</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.totalReadingTime}h</div>
              <div className="text-sm text-muted-foreground">Reading Time</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Bookmark className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.bookmarksCount}</div>
              <div className="text-sm text-muted-foreground">Bookmarks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userStats.commentsCount}</div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </CardContent>
          </Card>
        </div>

        {/* Vertical Tabs Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'overview' 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'activity' 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Activity className="h-4 w-4" />
                    Activity
                  </button>
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'achievements' 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Award className="h-4 w-4" />
                    Achievements
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'settings' 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Reading Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span className="font-semibold text-green-500">{userStats.completionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Reading Streak</span>
                      <span className="font-semibold text-yellow-500">{userStats.readingStreak} days</span>
                    </div>
                    <Separator />
                    <div>
                      <span className="text-muted-foreground mb-3 block">Favorite Genres</span>
                      <div className="flex flex-wrap gap-2">
                        {userStats.favoriteGenres.map((genre) => (
                          <Badge key={genre} variant="secondary">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-4 p-3 border border-border/50 rounded-lg">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <BadgeSystem userBadges={userBadges} showAll />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Theme & Appearance
                    </CardTitle>
                    <CardDescription>
                      Customize your reading experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Theme Selection</Label>
                      <ThemeSelector />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Language</Label>
                      <LanguageSwitcher />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </CardTitle>
                    <CardDescription>
                      Manage your notification preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications for new chapters</p>
                      </div>
                      <Switch 
                        id="notifications"
                        checked={settings.notifications}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-updates">Email Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive weekly manga updates via email</p>
                      </div>
                      <Switch 
                        id="email-updates"
                        checked={settings.emailUpdates}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailUpdates: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="reading-reminders">Reading Reminders</Label>
                        <p className="text-sm text-muted-foreground">Get reminded to continue reading</p>
                      </div>
                      <Switch 
                        id="reading-reminders"
                        checked={settings.readingReminders}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, readingReminders: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Privacy & Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="private-profile">Private Profile</Label>
                        <p className="text-sm text-muted-foreground">Hide your profile from other users</p>
                      </div>
                      <Switch 
                        id="private-profile"
                        checked={settings.privateProfile}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, privateProfile: checked }))}
                      />
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Update Email Address
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSaveSettings} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save All Settings
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;