import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, Users, DollarSign, Eye, RefreshCw, AlertCircle, Download } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsErrorBoundary } from './AnalyticsErrorBoundary';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  monthlyRecurringRevenue: number;
  totalPageViews: number;
  averageSessionDuration: number;
  popularContent: Array<{
    content_id: string;
    content_type: string;
    view_count: number;
    unique_users: number;
  }>;
  userSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
  activityTrends: Array<{
    date: string;
    page_views: number;
    unique_users: number;
    chapter_reads: number;
  }>;
  revenueMetrics: Array<{
    month: string;
    revenue: number;
    subscriptions: number;
    churn_rate: number;
  }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [segment, setSegment] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get basic metrics
      const [dauResult, mauResult, mrrResult] = await Promise.all([
        supabase.rpc('get_daily_active_users'),
        supabase.rpc('get_monthly_active_users'),
        supabase.rpc('get_monthly_recurring_revenue')
      ]);

      if (dauResult.error) throw dauResult.error;
      if (mauResult.error) throw mauResult.error;
      if (mrrResult.error) throw mrrResult.error;

      // Get popular content
      const { data: popularContent, error: popularError } = await supabase.rpc('get_popular_content', {
        content_type_filter: null,
        limit_count: 10
      });

      if (popularError) throw popularError;

      // Get activity trends for the selected date range
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity_logs')
        .select('created_at, activity_type, user_id')
        .gte('created_at', dateRange?.from?.toISOString())
        .lte('created_at', dateRange?.to?.toISOString())
        .order('created_at', { ascending: true });

      if (activityError) throw activityError;

      // Process activity trends
      const activityTrends = processActivityTrends(activityData || []);

      // Get user segments
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('plan, status');

      if (subscriptionError) throw subscriptionError;

      const userSegments = processUserSegments(subscriptionData || []);

      // Calculate additional metrics
      const totalPageViews = activityData?.filter(a => a.activity_type === 'page_view').length || 0;
      
      // Mock revenue metrics for demonstration
      const revenueMetrics = generateMockRevenueMetrics();

      setData({
        dailyActiveUsers: dauResult.data || 0,
        monthlyActiveUsers: mauResult.data || 0,
        monthlyRecurringRevenue: Number(mrrResult.data) || 0,
        totalPageViews,
        averageSessionDuration: 245, // Mock data
        popularContent: popularContent || [],
        userSegments,
        activityTrends,
        revenueMetrics
      });

    } catch (err) {
      console.error('Analytics loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      
      toast({
        title: "Analytics Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processActivityTrends = (activityData: any[]) => {
    const trends: Record<string, { page_views: number; unique_users: Set<string>; chapter_reads: number }> = {};

    activityData.forEach(activity => {
      const date = format(new Date(activity.created_at), 'yyyy-MM-dd');
      
      if (!trends[date]) {
        trends[date] = { page_views: 0, unique_users: new Set(), chapter_reads: 0 };
      }

      if (activity.activity_type === 'page_view') {
        trends[date].page_views++;
      } else if (activity.activity_type === 'chapter_read') {
        trends[date].chapter_reads++;
      }

      if (activity.user_id) {
        trends[date].unique_users.add(activity.user_id);
      }
    });

    return Object.entries(trends).map(([date, data]) => ({
      date,
      page_views: data.page_views,
      unique_users: data.unique_users.size,
      chapter_reads: data.chapter_reads
    }));
  };

  const processUserSegments = (subscriptionData: any[]) => {
    const segments = subscriptionData.reduce((acc, sub) => {
      const key = sub.plan === 'premium' && sub.status === 'active' ? 'Premium' : 'Free';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const values = Object.values(segments) as number[];
    const total = values.reduce((sum, count) => sum + count, 0);

    return Object.entries(segments).map(([segment, count]) => ({
      segment,
      count: count as number,
      percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0
    }));
  };

  const generateMockRevenueMetrics = () => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = subDays(new Date(), i * 30);
      months.push({
        month: format(date, 'MMM yyyy'),
        revenue: Math.floor(Math.random() * 5000) + 1000,
        subscriptions: Math.floor(Math.random() * 50) + 10,
        churn_rate: Math.floor(Math.random() * 10) + 2
      });
    }
    return months;
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadAnalyticsData();
  };

  const exportData = () => {
    if (!data) return;

    const exportData = {
      exportDate: new Date().toISOString(),
      dateRange,
      segment,
      metrics: data
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Analytics data has been exported successfully.",
    });
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, segment]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card className="p-6 text-center space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Failed to Load Analytics</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button onClick={handleRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry (Attempt {retryCount + 1})
        </Button>
      </Card>
    );
  }

  return (
    <AnalyticsErrorBoundary onRetry={handleRetry}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track user engagement and business metrics</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={loadAnalyticsData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Date Range:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    'Pick a date'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Segment:</label>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Updating...
            </Badge>
          )}
        </div>

        {/* Key Metrics */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Active Users</p>
                  <p className="text-2xl font-bold">{data.dailyActiveUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Active Users</p>
                  <p className="text-2xl font-bold">{data.monthlyActiveUsers.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">${data.monthlyRecurringRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Page Views</p>
                  <p className="text-2xl font-bold">{data.totalPageViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-primary" />
              </div>
            </Card>
          </div>
        )}

        {/* Charts and Tables */}
        {data && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Activity Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.activityTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="page_views" stroke="hsl(var(--primary))" />
                      <Line type="monotone" dataKey="unique_users" stroke="hsl(var(--secondary))" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">User Segments</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.userSegments}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ segment, percentage }) => `${segment} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.userSegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">User Activity</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.activityTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="unique_users" fill="hsl(var(--primary))" name="Unique Users" />
                    <Bar dataKey="chapter_reads" fill="hsl(var(--secondary))" name="Chapter Reads" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Popular Content</h3>
                <div className="space-y-4">
                  {data.popularContent.length > 0 ? (
                    data.popularContent.map((content, index) => (
                      <div key={content.content_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <div>
                            <p className="font-medium">{content.content_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {content.view_count} views • {content.unique_users} unique users
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No content data available</p>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.revenueMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" name="Revenue ($)" />
                    <Line type="monotone" dataKey="subscriptions" stroke="hsl(var(--secondary))" name="Subscriptions" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AnalyticsErrorBoundary>
  );
};