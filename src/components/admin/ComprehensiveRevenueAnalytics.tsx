import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Crown, 
  Heart, 
  MapPin, 
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/utils/DatabaseCompatibility';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface RevenueMetrics {
  totalRevenue: number;
  coinRevenue: number;
  patreonRevenue: number;
  subscriptionRevenue: number;
  totalUsers: number;
  freeUsers: number;
  premiumUsers: number;
  patreonUsers: number;
  conversionRate: number;
  avgRevenuePerUser: number;
}

interface TopSpender {
  user_id: string;
  user_email?: string;
  total_spent: number;
  coin_purchases: number;
  subscription_months: number;
  last_purchase: string;
}

interface RevenueByRegion {
  region: string;
  revenue: number;
  users: number;
  conversion_rate: number;
}

interface DailyRevenue {
  date: string;
  coin_revenue: number;
  subscription_revenue: number;
  patreon_revenue: number;
  total: number;
}

interface ConversionFunnel {
  stage: string;
  users: number;
  conversion_rate: number;
}

export const ComprehensiveRevenueAnalytics = () => {
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    coinRevenue: 0,
    patreonRevenue: 0,
    subscriptionRevenue: 0,
    totalUsers: 0,
    freeUsers: 0,
    premiumUsers: 0,
    patreonUsers: 0,
    conversionRate: 0,
    avgRevenuePerUser: 0
  });
  
  const [topSpenders, setTopSpenders] = useState<TopSpender[]>([]);
  const [revenueByRegion, setRevenueByRegion] = useState<RevenueByRegion[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [regionFilter, setRegionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, regionFilter, roleFilter, sourceFilter]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      
      // Load basic metrics
      await loadMetrics(startDate, endDate);
      
      // Load top spenders
      await loadTopSpenders(startDate, endDate);
      
      // Load revenue by region
      await loadRevenueByRegion(startDate, endDate);
      
      // Load daily revenue trend
      await loadDailyRevenue(startDate, endDate);
      
      // Load conversion funnel
      await loadConversionFunnel(startDate, endDate);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load revenue analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async (startDate: Date, endDate: Date) => {
    try {
      // Simulate comprehensive metrics calculation
      const mockMetrics = {
        totalRevenue: 15750.50,
        coinRevenue: 8500.25,
        patreonRevenue: 4200.00,
        subscriptionRevenue: 3050.25,
        totalUsers: 1250,
        freeUsers: 950,
        premiumUsers: 220,
        patreonUsers: 80,
        conversionRate: 24.0,
        avgRevenuePerUser: 12.60
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadTopSpenders = async (startDate: Date, endDate: Date) => {
    try {
      // Simulate top spenders data
      const mockSpenders: TopSpender[] = [
        {
          user_id: 'user_001',
          user_email: 'premium.reader@example.com',
          total_spent: 245.50,
          coin_purchases: 8,
          subscription_months: 6,
          last_purchase: '2024-01-25'
        },
        {
          user_id: 'user_002',
          user_email: 'manga.fan@example.com',
          total_spent: 189.75,
          coin_purchases: 12,
          subscription_months: 3,
          last_purchase: '2024-01-23'
        },
        {
          user_id: 'user_003',
          user_email: 'collector@example.com',
          total_spent: 156.00,
          coin_purchases: 6,
          subscription_months: 12,
          last_purchase: '2024-01-20'
        }
      ];
      
      setTopSpenders(mockSpenders);
    } catch (error) {
      console.error('Error loading top spenders:', error);
    }
  };

  const loadRevenueByRegion = async (startDate: Date, endDate: Date) => {
    try {
      // Simulate regional revenue data
      const mockRegional: RevenueByRegion[] = [
        { region: 'North America', revenue: 6200.25, users: 420, conversion_rate: 28.5 },
        { region: 'Europe', revenue: 4100.50, users: 350, conversion_rate: 22.8 },
        { region: 'Asia Pacific', revenue: 3850.75, users: 280, conversion_rate: 31.2 },
        { region: 'Other', revenue: 1599.00, users: 200, conversion_rate: 18.5 }
      ];
      
      setRevenueByRegion(mockRegional);
    } catch (error) {
      console.error('Error loading regional data:', error);
    }
  };

  const loadDailyRevenue = async (startDate: Date, endDate: Date) => {
    try {
      // Generate mock daily revenue data
      const days = [];
      const current = new Date(startDate);
      
      while (current <= endDate) {
        const coinRev = Math.random() * 300 + 100;
        const subRev = Math.random() * 150 + 50;
        const patreonRev = Math.random() * 200 + 75;
        
        days.push({
          date: current.toISOString().split('T')[0],
          coin_revenue: Math.round(coinRev * 100) / 100,
          subscription_revenue: Math.round(subRev * 100) / 100,
          patreon_revenue: Math.round(patreonRev * 100) / 100,
          total: Math.round((coinRev + subRev + patreonRev) * 100) / 100
        });
        
        current.setDate(current.getDate() + 1);
      }
      
      setDailyRevenue(days);
    } catch (error) {
      console.error('Error loading daily revenue:', error);
    }
  };

  const loadConversionFunnel = async (startDate: Date, endDate: Date) => {
    try {
      // Simulate conversion funnel data
      const mockFunnel: ConversionFunnel[] = [
        { stage: 'Visitors', users: 5000, conversion_rate: 100 },
        { stage: 'Signups', users: 1500, conversion_rate: 30 },
        { stage: 'Active Users', users: 1250, conversion_rate: 83.3 },
        { stage: 'First Purchase', users: 400, conversion_rate: 32 },
        { stage: 'Premium Users', users: 300, conversion_rate: 75 },
        { stage: 'Recurring Users', users: 220, conversion_rate: 73.3 }
      ];
      
      setConversionFunnel(mockFunnel);
    } catch (error) {
      console.error('Error loading conversion funnel:', error);
    }
  };

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const data = {
        metrics,
        topSpenders,
        revenueByRegion,
        dailyRevenue,
        conversionFunnel,
        filters: { dateRange, regionFilter, roleFilter, sourceFilter },
        exportedAt: new Date().toISOString()
      };

      if (format === 'csv') {
        // Simple CSV export for metrics
        const csvContent = [
          'Metric,Value',
          `Total Revenue,$${metrics.totalRevenue}`,
          `Coin Revenue,$${metrics.coinRevenue}`,
          `Patreon Revenue,$${metrics.patreonRevenue}`,
          `Subscription Revenue,$${metrics.subscriptionRevenue}`,
          `Total Users,${metrics.totalUsers}`,
          `Conversion Rate,${metrics.conversionRate}%`
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      } else {
        // JSON export
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }

      toast({
        title: "Success",
        description: `Analytics data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export analytics data",
        variant: "destructive",
      });
    }
  };

  const pieChartColors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  if (isLoading) {
    return <div>Loading revenue analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revenue Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive revenue insights and user conversion metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportData('csv')} size="sm">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('json')} size="sm">
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="NA">North America</SelectItem>
                  <SelectItem value="EU">Europe</SelectItem>
                  <SelectItem value="APAC">Asia Pacific</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>User Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="free">Free Users</SelectItem>
                  <SelectItem value="premium">Premium Users</SelectItem>
                  <SelectItem value="patreon">Patreon Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Revenue Source</Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="coins">Coin Purchases</SelectItem>
                  <SelectItem value="subscriptions">Subscriptions</SelectItem>
                  <SelectItem value="patreon">Patreon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{metrics.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Revenue/User</p>
                <p className="text-2xl font-bold">${metrics.avgRevenuePerUser}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Source</CardTitle>
            <CardDescription>Breakdown of revenue streams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'Coins', value: metrics.coinRevenue, color: '#8b5cf6' },
                      { name: 'Patreon', value: metrics.patreonRevenue, color: '#06b6d4' },
                      { name: 'Subscriptions', value: metrics.subscriptionRevenue, color: '#10b981' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {[
                      { name: 'Coins', value: metrics.coinRevenue },
                      { name: 'Patreon', value: metrics.patreonRevenue },
                      { name: 'Subscriptions', value: metrics.subscriptionRevenue }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieChartColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users by subscription tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Free Users</span>
                </div>
                <Badge variant="outline">{metrics.freeUsers}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span>Premium Users</span>
                </div>
                <Badge variant="outline">{metrics.premiumUsers}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Patreon Users</span>
                </div>
                <Badge variant="outline">{metrics.patreonUsers}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Daily Revenue Trend
          </CardTitle>
          <CardDescription>Revenue over time by source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`$${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="coin_revenue" stroke="#8b5cf6" name="Coins" />
                <Line type="monotone" dataKey="subscription_revenue" stroke="#10b981" name="Subscriptions" />
                <Line type="monotone" dataKey="patreon_revenue" stroke="#06b6d4" name="Patreon" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Spenders & Regional Data */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Spenders This Month</CardTitle>
            <CardDescription>Highest value customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSpenders.map((spender, index) => (
                <div key={spender.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="font-medium">{spender.user_email}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {spender.coin_purchases} purchases • {spender.subscription_months}mo sub
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${spender.total_spent}</p>
                    <p className="text-xs text-muted-foreground">
                      Last: {new Date(spender.last_purchase).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Revenue by Region
            </CardTitle>
            <CardDescription>Geographic revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByRegion.map((region) => (
                <div key={region.region} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{region.region}</span>
                    <div className="text-right">
                      <p className="font-bold">${region.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{region.conversion_rate}% conv.</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(region.revenue / Math.max(...revenueByRegion.map(r => r.revenue))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey from visitor to paying customer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium">{stage.stage}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span>{stage.users.toLocaleString()} users</span>
                    <span className="text-sm text-muted-foreground">{stage.conversion_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full" 
                      style={{ width: `${stage.conversion_rate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};