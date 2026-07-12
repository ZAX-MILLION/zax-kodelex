import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  FileText, 
  Eye, 
  MessageSquare, 
  TrendingUp,
  Upload,
  Clock,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface DashboardStats {
  totalSeries: number;
  totalChapters: number;
  totalViews: number;
  totalComments: number;
  draftChapters: number;
  publishedChapters: number;
  monthlyViews: number;
  weeklyViews: number;
}

interface RecentActivity {
  id: string;
  type: 'upload' | 'comment' | 'view' | 'edit';
  title: string;
  description: string;
  timestamp: string;
}

export const AuthorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSeries: 0,
    totalChapters: 0,
    totalViews: 0,
    totalComments: 0,
    draftChapters: 0,
    publishedChapters: 0,
    monthlyViews: 0,
    weeklyViews: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch series count (using dummy data for now since manga_series doesn't exist)
      const seriesData = [];

      // Mock chapters data for now
      const chaptersData: any[] = [];

      // Calculate stats
      const totalChapters = chaptersData?.length || 0;
      const draftChapters = 0; // Will implement status later
      const publishedChapters = totalChapters; // Assuming all are published for now
      const totalViews = totalChapters * 100; // Mock data

      // Calculate monthly and weekly views (simplified - using mock data for now)
      const monthlyViews = totalChapters * 50;
      const weeklyViews = totalChapters * 10;

      // Mock comments data
      const commentsData: any[] = [];

      setStats({
        totalSeries: seriesData?.length || 0,
        totalChapters,
        totalViews,
        totalComments: commentsData?.length || 0,
        draftChapters,
        publishedChapters,
        monthlyViews,
        weeklyViews,
      });

      // Generate recent activity (simplified)
      const activities: RecentActivity[] = chaptersData?.slice(0, 5).map(chapter => ({
        id: chapter.id,
        type: 'upload' as const,
        title: chapter.title,
        description: 'Chapter uploaded',
        timestamp: chapter.created_at,
      })) || [];

      setRecentActivity(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Series',
      value: stats.totalSeries,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Chapters',
      value: stats.totalChapters,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Comments',
      value: stats.totalComments,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Author Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your content.</p>
        </div>
        <Button asChild>
          <Link to="/author/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Chapter
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Status and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chapter Status</CardTitle>
            <CardDescription>Overview of your chapter publication status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Published Chapters</span>
              <Badge variant="default">{stats.publishedChapters}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Draft Chapters</span>
              <Badge variant="secondary">{stats.draftChapters}</Badge>
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/author/chapters">
                  Manage Chapters
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
            <CardDescription>Views and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Weekly Views
              </span>
              <span className="font-semibold">{stats.weeklyViews.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4" />
                Monthly Views
              </span>
              <span className="font-semibold">{stats.monthlyViews.toLocaleString()}</span>
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/author/analytics">
                  View Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest uploads and edits</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No recent activity. Start by uploading your first chapter!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};