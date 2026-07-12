import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, BookOpen, Eye, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, LineChart as ReChartsLineChart, Line, BarChart as ReChartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface SeriesStats {
  id: string;
  title: string;
  total_chapters: number;
  total_views: number;
  avg_rating: number;
  subscribers: number;
  last_updated: string;
  status: string;
}

export const SeriesAnalytics = () => {
  const [seriesStats, setSeriesStats] = useState<SeriesStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'yesterday' | 'this_week' | 'last_month' | 'last_3_months' | 'custom' | 'all'>('this_week');
  const { toast } = useToast();

  useEffect(() => {
    fetchSeriesAnalytics();
  }, [timeRange]);

  const fetchSeriesAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - replace with actual Supabase queries
      const mockStats: SeriesStats[] = [
        {
          id: '1',
          title: 'Crimson Blade Chronicles',
          total_chapters: 45,
          total_views: 156789,
          avg_rating: 4.8,
          subscribers: 2341,
          last_updated: '2024-01-15',
          status: 'ongoing'
        },
        {
          id: '2',
          title: 'Dragon\'s Legacy',
          total_chapters: 32,
          total_views: 98456,
          avg_rating: 4.6,
          subscribers: 1876,
          last_updated: '2024-01-12',
          status: 'ongoing'
        },
        {
          id: '3',
          title: 'Mystic Academy',
          total_chapters: 28,
          total_views: 76543,
          avg_rating: 4.4,
          subscribers: 1432,
          last_updated: '2024-01-10',
          status: 'completed'
        }
      ];

      setSeriesStats(mockStats);
    } catch (error) {
      console.error('Error fetching series analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load series analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'hiatus': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const totalViews = seriesStats.reduce((sum, series) => sum + series.total_views, 0);
  const totalChapters = seriesStats.reduce((sum, series) => sum + series.total_chapters, 0);
  const totalSubscribers = seriesStats.reduce((sum, series) => sum + series.subscribers, 0);
  const avgRating = seriesStats.length > 0 
    ? (seriesStats.reduce((sum, series) => sum + series.avg_rating, 0) / seriesStats.length).toFixed(1)
    : '0';

  const buildSeriesData = () => {
    const rangeToDays = (r: string) => {
      switch (r) {
        case 'today': return 1;
        case 'yesterday': return 1;
        case 'this_week': return 7;
        case 'last_month': return 30;
        case 'last_3_months': return 90;
        default: return 30;
      }
    };
    const days = rangeToDays(timeRange as string);
    const data: { day: string; views: number; chapters: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        day: d.toISOString().slice(0, 10),
        views: Math.floor(Math.random() * 5000) + 500,
        chapters: Math.floor(Math.random() * 20) + 1,
      });
    }
    return data;
  };
  const timeSeries = buildSeriesData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Series & Chapter Analytics</h1>
          <p className="text-muted-foreground">Track performance metrics for your manga series</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchSeriesAnalytics} disabled={loading}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all series</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChapters}</div>
            <p className="text-xs text-muted-foreground">Published content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Following series</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating}</div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>
      </div>

      {/* Series Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Series Performance</CardTitle>
          <CardDescription>Detailed analytics for each manga series</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium">Series</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Chapters</th>
                    <th className="text-right p-4 font-medium">Views</th>
                    <th className="text-right p-4 font-medium">Rating</th>
                    <th className="text-right p-4 font-medium">Subscribers</th>
                    <th className="text-right p-4 font-medium">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {seriesStats.map((series) => (
                    <tr key={series.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium text-foreground">{series.title}</div>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(series.status)} text-white`}>
                          {series.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-foreground">{series.total_chapters}</td>
                      <td className="p-4 text-right text-foreground">{series.total_views.toLocaleString()}</td>
                      <td className="p-4 text-right text-foreground">{series.avg_rating}/5</td>
                      <td className="p-4 text-right text-foreground">{series.subscribers.toLocaleString()}</td>
                      <td className="p-4 text-right text-muted-foreground">{series.last_updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};