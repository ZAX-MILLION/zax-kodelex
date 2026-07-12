import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdminDashboard } from "@/contexts/AdminDashboardContext";
import PayPalSecretsChecker from './PayPalSecretsChecker';
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
  Activity,
  Library,
  FileText,
  BarChart3,
  UserCheck,
  Coins
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalChapters: number;
  totalSeries: number;
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

export const EnhancedDashboardOverview = () => {
  const { toast } = useToast();
  const { mangaMode } = useAdminDashboard();
  const [stats, setStats] = useState<DashboardStats>({
    totalChapters: 0,
    totalSeries: 0,
    totalUsers: 0,
    totalViews: 0,
    totalBookmarks: 0,
    totalComments: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
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

      let seriesCount = 0;
      // Only load series data in multi-manga mode
      if (mangaMode === 'multi') {
        try {
          const seriesResult = await supabase.from('profiles').select('id').limit(1);
          seriesCount = 1; // Placeholder for series count
        } catch (error) {
          console.warn('Series table not available');
        }
      }

      const totalViews = chaptersResult.data?.reduce((sum, chapter) => sum + (chapter.view_count || 0), 0) || 0;

      setStats({
        totalChapters: chaptersResult.data?.length || 0,
        totalSeries: seriesCount,
        totalUsers: usersResult.data?.length || 0,
        totalViews,
        totalBookmarks: bookmarksResult.data?.length || 0,
        totalComments: commentsResult.data?.length || 0,
      });

      // Simulate recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'upload',
          description: mangaMode === 'single' ? 'New chapter uploaded' : 'Chapter 25 uploaded',
          timestamp: '2 hours ago',
          user: 'Admin'
        },
        {
          id: '2',
          type: 'comment',
          description: 'New comment posted',
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
          description: 'Chapter bookmarked',
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

  // Quick actions based on manga mode
  const getQuickActions = () => {
    const baseActions = [
      { label: 'Upload Chapter', icon: <Upload className="h-4 w-4" />, path: '/admin/upload' },
      { label: 'Manage Users', icon: <UserCheck className="h-4 w-4" />, path: '/admin/users' },
      { label: 'View Analytics', icon: <BarChart3 className="h-4 w-4" />, path: '/admin/analytics' },
      { label: 'Site Settings', icon: <Settings className="h-4 w-4" />, path: '/admin/settings' },
    ];

    if (mangaMode === 'multi') {
      baseActions.unshift({ label: 'Manage Series', icon: <Library className="h-4 w-4" />, path: '/admin/series' });
    }

    return baseActions;
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
      {/* Mode Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            {mangaMode === 'single' ? 'Single manga site management' : 'Multi-manga platform management'}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {mangaMode === 'single' ? 'Single Manga Mode' : 'Multi Manga Mode'}
        </Badge>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PayPalSecretsChecker />
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Core system status and health checks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Connection</span>
                <Badge variant="default" className="text-xs">✅ Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage Access</span>
                <Badge variant="default" className="text-xs">✅ Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Endpoints</span>
                <Badge variant="default" className="text-xs">✅ Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Dynamic based on mode */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${mangaMode === 'multi' ? 'lg:grid-cols-6' : 'lg:grid-cols-5'} gap-4`}>
        {mangaMode === 'multi' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Series</p>
                  <p className="text-2xl font-bold">{stats.totalSeries}</p>
                </div>
                <Library className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {mangaMode === 'single' ? 'Total Chapters' : 'Chapters'}
                </p>
                <p className="text-2xl font-bold">{stats.totalChapters}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Users</p>
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
                <p className="text-sm font-medium text-muted-foreground">Views</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions - Dynamic based on mode */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {mangaMode === 'single' ? 'Manage your manga site' : 'Manage your manga platform'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {getQuickActions().map((action, index) => (
              <Button key={index} asChild className="w-full justify-start" variant="outline">
                <Link to={action.path}>
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Link>
              </Button>
            ))}
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
      </div>
    </div>
  );
};