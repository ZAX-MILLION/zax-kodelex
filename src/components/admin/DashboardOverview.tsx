import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PayPalSecretsChecker from './PayPalSecretsChecker';
import PremiumFeaturesStatus from './PremiumFeaturesStatus';
import { 
  Users, 
  BookOpen, 
  Eye, 
  Bookmark, 
  Upload, 
  Settings, 
  TrendingUp, 
  Clock,
  MessageSquare,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalChapters: number;
  totalUsers: number;
  totalViews: number;
  totalBookmarks: number;
  totalComments: number;
}

interface RecentActivity {
  id: string;
  type: 'upload' | 'comment' | 'registration' | 'bookmark';
  description: string;
  timestamp: string;
  user?: string;
}

interface TopChapter {
  id: string;
  title: string;
  chapter_number: number;
  view_count: number;
  thumbnail_url?: string;
}

export const DashboardOverview = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalChapters: 0,
    totalUsers: 0,
    totalViews: 0,
    totalBookmarks: 0,
    totalComments: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topChapters, setTopChapters] = useState<TopChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load basic stats
      const [chaptersResult, usersResult, bookmarksResult, commentsResult] = await Promise.all([
        supabase.from('chapters').select('id, view_count'), // Show all chapters including locked
        supabase.from('profiles').select('id'),
        supabase.from('bookmarks').select('id'),
        supabase.from('comments').select('id'),
      ]);

      const totalViews = chaptersResult.data?.reduce((sum, chapter) => sum + (chapter.view_count || 0), 0) || 0;

      setStats({
        totalChapters: chaptersResult.data?.length || 0,
        totalUsers: usersResult.data?.length || 0,
        totalViews,
        totalBookmarks: bookmarksResult.data?.length || 0,
        totalComments: commentsResult.data?.length || 0,
      });

      // Load top chapters
      const topChaptersResult = await supabase
        .from('chapters')
        .select('id, title, chapter_number, view_count, thumbnail_url')
        .order('view_count', { ascending: false })
        .limit(5);

      if (topChaptersResult.data) {
        setTopChapters(topChaptersResult.data);
      }

      // Simulate recent activity (in a real app, this would come from activity logs)
      setRecentActivity([
        {
          id: '1',
          type: 'upload',
          description: 'Chapter 25 uploaded',
          timestamp: '2 hours ago',
          user: 'Admin'
        },
        {
          id: '2',
          type: 'comment',
          description: 'New comment on Chapter 24',
          timestamp: '3 hours ago',
          user: 'User123'
        },
        {
          id: '3',
          type: 'registration',
          description: 'New user registered',
          timestamp: '5 hours ago',
          user: 'NewReader'
        },
        {
          id: '4',
          type: 'bookmark',
          description: 'Chapter 23 bookmarked',
          timestamp: '6 hours ago',
          user: 'Reader456'
        },
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Upload className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'registration': return <Users className="h-4 w-4" />;
      case 'bookmark': return <Bookmark className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload': return 'bg-green-500/10 text-green-600';
      case 'comment': return 'bg-blue-500/10 text-blue-600';
      case 'registration': return 'bg-purple-500/10 text-purple-600';
      case 'bookmark': return 'bg-orange-500/10 text-orange-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PayPalSecretsChecker />
        <PremiumFeaturesStatus />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Chapters</p>
                <p className="text-2xl font-bold">{stats.totalChapters}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bookmarks</p>
                <p className="text-2xl font-bold">{stats.totalBookmarks}</p>
              </div>
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comments</p>
                <p className="text-2xl font-bold">{stats.totalComments}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload New Chapter
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Edit Series Info
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Site Settings
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Chapters */}
        <Card>
          <CardHeader>
            <CardTitle>Top Chapters</CardTitle>
            <CardDescription>Most viewed chapters this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topChapters.map((chapter, index) => (
                <div key={chapter.id} className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      Ch. {chapter.chapter_number}: {chapter.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {chapter.view_count?.toLocaleString() || 0} views
                    </p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};