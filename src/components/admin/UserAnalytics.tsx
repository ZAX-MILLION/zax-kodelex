import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Download, TrendingUp, Users, BookOpen, MessageSquare, Bookmark } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { addDays, format, subDays } from "date-fns";

interface AnalyticsData {
  registrations: Array<{ date: string; count: number }>;
  activeUsers: Array<{ date: string; daily: number; weekly: number }>;
  chapterCompletions: Array<{ chapter: string; completion_rate: number }>;
  activityBreakdown: Array<{ name: string; value: number; color: string }>;
  userGrowth: {
    total: number;
    thisMonth: number;
    growth: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const UserAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [timeframe, setTimeframe] = useState("30d");
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch registration data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at');

      if (profilesError) throw profilesError;

      // Process registration data
      const registrationData = processRegistrationData(profiles);

      // Fetch activity logs
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activity_logs')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at');

      if (activitiesError) throw activitiesError;

      // Process active users data
      const activeUsersData = processActiveUsersData(activities);

      // Fetch reading progress for completion rates
      const { data: progress, error: progressError } = await supabase
        .from('reading_progress')
        .select('chapter_id, completed')
        .gte('last_read_at', dateRange.from.toISOString())
        .lte('last_read_at', dateRange.to.toISOString());

      if (progressError) throw progressError;

      // Process completion data
      const completionData = await processCompletionData(progress);

      // Calculate activity breakdown
      const activityBreakdown = [
        {
          name: 'Reading',
          value: activities.filter(a => a.activity_type === 'chapter_view').length,
          color: COLORS[0]
        },
        {
          name: 'Comments',
          value: activities.filter(a => a.activity_type === 'comment_post').length,
          color: COLORS[1]
        },
        {
          name: 'Bookmarks',
          value: activities.filter(a => a.activity_type === 'bookmark_add').length,
          color: COLORS[2]
        },
        {
          name: 'Logins',
          value: activities.filter(a => a.activity_type === 'login').length,
          color: COLORS[3]
        }
      ];

      // Calculate user growth
      const totalUsers = profiles.length;
      const thisMonthUsers = profiles.filter(p => 
        new Date(p.created_at) >= subDays(new Date(), 30)
      ).length;
      const lastMonthUsers = profiles.filter(p => {
        const date = new Date(p.created_at);
        return date >= subDays(new Date(), 60) && date < subDays(new Date(), 30);
      }).length;
      
      const growth = lastMonthUsers > 0 ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;

      setData({
        registrations: registrationData,
        activeUsers: activeUsersData,
        chapterCompletions: completionData,
        activityBreakdown,
        userGrowth: {
          total: totalUsers,
          thisMonth: thisMonthUsers,
          growth
        }
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processRegistrationData = (profiles: any[]) => {
    const dateMap = new Map();
    
    profiles.forEach(profile => {
      const date = format(new Date(profile.created_at), 'yyyy-MM-dd');
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    const result = [];
    for (let d = new Date(dateRange.from); d <= dateRange.to; d = addDays(d, 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      result.push({
        date: dateStr,
        count: dateMap.get(dateStr) || 0
      });
    }
    
    return result;
  };

  const processActiveUsersData = (activities: any[]) => {
    const dailyMap = new Map();
    const weeklyMap = new Map();
    
    activities.forEach(activity => {
      const date = format(new Date(activity.created_at), 'yyyy-MM-dd');
      const userSet = dailyMap.get(date) || new Set();
      userSet.add(activity.user_id);
      dailyMap.set(date, userSet);
    });

    const result = [];
    for (let d = new Date(dateRange.from); d <= dateRange.to; d = addDays(d, 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      const dailyUsers = dailyMap.get(dateStr)?.size || 0;
      
      // Calculate weekly active users (7-day rolling window)
      let weeklyUsers = new Set();
      for (let i = 0; i < 7; i++) {
        const checkDate = format(subDays(d, i), 'yyyy-MM-dd');
        const users = dailyMap.get(checkDate);
        if (users) {
          users.forEach(user => weeklyUsers.add(user));
        }
      }
      
      result.push({
        date: dateStr,
        daily: dailyUsers,
        weekly: weeklyUsers.size
      });
    }
    
    return result;
  };

  const processCompletionData = async (progress: any[]) => {
    // Get chapter information
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id, title, chapter_number')
      .order('chapter_number');

    if (!chapters) return [];

    const completionMap = new Map();
    const totalMap = new Map();

    progress.forEach(p => {
      const chapterId = p.chapter_id;
      if (!totalMap.has(chapterId)) {
        totalMap.set(chapterId, 0);
        completionMap.set(chapterId, 0);
      }
      totalMap.set(chapterId, totalMap.get(chapterId) + 1);
      if (p.completed) {
        completionMap.set(chapterId, completionMap.get(chapterId) + 1);
      }
    });

    return chapters.map(chapter => {
      const total = totalMap.get(chapter.id) || 0;
      const completed = completionMap.get(chapter.id) || 0;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      
      return {
        chapter: `Ch. ${chapter.chapter_number}`,
        completion_rate: Math.round(rate)
      };
    }).slice(0, 10); // Top 10 chapters
  };

  const exportData = (format: 'csv' | 'json') => {
    if (!data) return;

    const exportData = {
      registrations: data.registrations,
      activeUsers: data.activeUsers,
      chapterCompletions: data.chapterCompletions,
      activityBreakdown: data.activityBreakdown,
      userGrowth: data.userGrowth,
      dateRange: {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      },
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Convert to CSV
      const csvData = [
        ['Date', 'Registrations', 'Daily Active', 'Weekly Active'],
        ...data.registrations.map((item, index) => [
          item.date,
          item.count.toString(),
          data.activeUsers[index]?.daily?.toString() || '0',
          data.activeUsers[index]?.weekly?.toString() || '0'
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: "Success",
      description: `Analytics data exported as ${format.toUpperCase()}`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">User Analytics</h2>
          <p className="text-muted-foreground">Analyze user behavior and engagement patterns</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          {timeframe === 'custom' && (
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />
          )}
          
          <Button onClick={() => exportData('csv')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={() => exportData('json')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userGrowth.total}</div>
            <div className={`text-xs ${data.userGrowth.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.userGrowth.growth >= 0 ? '+' : ''}{data.userGrowth.growth.toFixed(1)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              New This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userGrowth.thisMonth}</div>
            <div className="text-xs text-muted-foreground">New registrations</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Avg Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.chapterCompletions.length > 0 
                ? Math.round(data.chapterCompletions.reduce((acc, c) => acc + c.completion_rate, 0) / data.chapterCompletions.length)
                : 0}%
            </div>
            <div className="text-xs text-muted-foreground">Chapter completion rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.activityBreakdown.reduce((acc, item) => acc + item.value, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total interactions</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Registrations</CardTitle>
            <CardDescription>Daily new user signups over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.registrations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Daily and weekly active user counts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.activeUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="daily" stroke="#82ca9d" strokeWidth={2} name="Daily" />
                <Line type="monotone" dataKey="weekly" stroke="#8884d8" strokeWidth={2} name="Weekly" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chapter Completion Rates</CardTitle>
            <CardDescription>Top chapters by completion percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.chapterCompletions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="chapter" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completion_rate" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Activity Breakdown</CardTitle>
            <CardDescription>Distribution of user interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.activityBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.activityBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};