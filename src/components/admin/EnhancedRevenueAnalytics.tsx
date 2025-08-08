import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  Coins, Crown, Download, Calendar, BarChart3,
  PieChart, LineChart, FileText, RefreshCw, Filter,
  Globe, CreditCard, Target, AlertTriangle, CheckCircle
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, Area, AreaChart,
  FunnelChart, Funnel, LabelList
} from 'recharts';
import { db } from '@/utils/DatabaseCompatibility';

interface EnhancedRevenueData {
  period: string;
  coins: number;
  premium: number;
  patreon: number;
  licenses: number;
  total: number;
  transactions: number;
  unique_users: number;
  conversion_rate: number;
}

interface UserSegment {
  segment: string;
  users: number;
  revenue: number;
  avg_revenue: number;
  growth_rate: number;
}

interface RegionalData {
  country: string;
  revenue: number;
  users: number;
  conversion_rate: number;
  top_payment_method: string;
}

interface ConversionFunnel {
  stage: string;
  users: number;
  conversion_rate: number;
}

interface RevenueGoals {
  monthly_target: number;
  yearly_target: number;
  current_progress: number;
  projected_completion: string;
}

const EnhancedRevenueAnalytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [revenueData, setRevenueData] = useState<EnhancedRevenueData[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([]);
  const [revenueGoals, setRevenueGoals] = useState<RevenueGoals>({
    monthly_target: 5000,
    yearly_target: 60000,
    current_progress: 3245,
    projected_completion: "2024-12-15"
  });

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '6m', label: 'Last 6 months' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const countries = [
    { value: 'all', label: 'All Countries' },
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'jp', label: 'Japan' }
  ];

  const revenueSources = [
    { value: 'all', label: 'All Sources' },
    { value: 'coins', label: 'Coin Sales' },
    { value: 'premium', label: 'Premium Subscriptions' },
    { value: 'patreon', label: 'Patreon' },
    { value: 'licenses', label: 'License Sales' }
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, filterCountry, filterSource]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Generate enhanced mock data
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
      const mockRevenueData: EnhancedRevenueData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const period = date.toISOString().split('T')[0];
        
        const baseMultiplier = 1 + (Math.sin(i / 7) * 0.3); // Weekly patterns
        const coins = Math.floor((Math.random() * 500 + 200) * baseMultiplier);
        const premium = Math.floor((Math.random() * 800 + 300) * baseMultiplier);
        const patreon = Math.floor((Math.random() * 300 + 100) * baseMultiplier);
        const licenses = Math.floor((Math.random() * 200 + 50) * baseMultiplier);
        const transactions = Math.floor((Math.random() * 50 + 20) * baseMultiplier);
        const unique_users = Math.floor((Math.random() * 30 + 15) * baseMultiplier);
        
        mockRevenueData.push({
          period,
          coins,
          premium,
          patreon,
          licenses,
          total: coins + premium + patreon + licenses,
          transactions,
          unique_users,
          conversion_rate: Math.random() * 10 + 5
        });
      }

      // Mock user segments
      const mockSegments: UserSegment[] = [
        {
          segment: 'New Users (0-30 days)',
          users: 245,
          revenue: 2450,
          avg_revenue: 10.00,
          growth_rate: 15.2
        },
        {
          segment: 'Regular Users (30-90 days)',
          users: 189,
          revenue: 4725,
          avg_revenue: 25.00,
          growth_rate: 8.7
        },
        {
          segment: 'Premium Users',
          users: 156,
          revenue: 9360,
          avg_revenue: 60.00,
          growth_rate: 12.3
        },
        {
          segment: 'Patreon Supporters',
          users: 78,
          revenue: 7020,
          avg_revenue: 90.00,
          growth_rate: 22.1
        },
        {
          segment: 'VIP Users',
          users: 34,
          revenue: 6800,
          avg_revenue: 200.00,
          growth_rate: 18.9
        }
      ];

      // Mock regional data
      const mockRegionalData: RegionalData[] = [
        {
          country: 'United States',
          revenue: 12500,
          users: 345,
          conversion_rate: 18.5,
          top_payment_method: 'PayPal'
        },
        {
          country: 'United Kingdom',
          revenue: 8900,
          users: 234,
          conversion_rate: 22.1,
          top_payment_method: 'Stripe'
        },
        {
          country: 'Canada',
          revenue: 5600,
          users: 167,
          conversion_rate: 19.8,
          top_payment_method: 'PayPal'
        },
        {
          country: 'Germany',
          revenue: 4300,
          users: 189,
          conversion_rate: 15.4,
          top_payment_method: 'SEPA'
        },
        {
          country: 'Australia',
          revenue: 3200,
          users: 98,
          conversion_rate: 21.3,
          top_payment_method: 'Stripe'
        }
      ];

      // Mock conversion funnel
      const mockFunnel: ConversionFunnel[] = [
        { stage: 'Visitors', users: 10000, conversion_rate: 100 },
        { stage: 'Signed Up', users: 2500, conversion_rate: 25 },
        { stage: 'First Read', users: 1875, conversion_rate: 75 },
        { stage: 'Engaged (5+ reads)', users: 750, conversion_rate: 40 },
        { stage: 'Made Purchase', users: 187, conversion_rate: 25 },
        { stage: 'Premium Subscriber', users: 93, conversion_rate: 50 }
      ];

      setRevenueData(mockRevenueData);
      setUserSegments(mockSegments);
      setRegionalData(mockRegionalData);
      setConversionFunnel(mockFunnel);

    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load revenue analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvData = [
      headers,
      ...data.map(row => headers.map(header => row[header]?.toString() || ''))
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${dateRange}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Data exported to CSV successfully",
    });
  };

  const getTotalRevenue = () => revenueData.reduce((sum, data) => sum + data.total, 0);
  const getRevenueGrowth = () => {
    if (revenueData.length < 14) return 0;
    const recent = revenueData.slice(-7).reduce((sum, data) => sum + data.total, 0);
    const previous = revenueData.slice(-14, -7).reduce((sum, data) => sum + data.total, 0);
    return previous > 0 ? ((recent - previous) / previous) * 100 : 0;
  };

  const pieData = [
    { name: 'Coins', value: revenueData.reduce((sum, data) => sum + data.coins, 0), color: '#fbbf24' },
    { name: 'Premium', value: revenueData.reduce((sum, data) => sum + data.premium, 0), color: '#a855f7' },
    { name: 'Patreon', value: revenueData.reduce((sum, data) => sum + data.patreon, 0), color: '#ef4444' },
    { name: 'Licenses', value: revenueData.reduce((sum, data) => sum + data.licenses, 0), color: '#22c55e' }
  ];

  const totalRevenue = getTotalRevenue();
  const revenueGrowth = getRevenueGrowth();
  const progressPercentage = (revenueGoals.current_progress / revenueGoals.monthly_target) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Revenue Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive revenue insights with advanced filtering and goal tracking
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportToCSV(revenueData, 'revenue-analytics')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {revenueSources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Goals Progress */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Monthly Revenue Goal</h3>
              <p className="text-sm text-muted-foreground">
                Target: ${revenueGoals.monthly_target.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                ${revenueGoals.current_progress.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {progressPercentage.toFixed(1)}% complete
              </div>
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-muted-foreground">
              ${(revenueGoals.monthly_target - revenueGoals.current_progress).toLocaleString()} remaining
            </span>
            <span className="text-muted-foreground">
              Projected completion: {revenueGoals.projected_completion}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {revenueGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">
                  {revenueData.reduce((sum, data) => sum + data.transactions, 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Avg: ${(totalRevenue / revenueData.reduce((sum, data) => sum + data.transactions, 0) || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Paying Users</p>
                <p className="text-2xl font-bold">
                  {revenueData.reduce((sum, data) => sum + data.unique_users, 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  ARPU: ${(totalRevenue / revenueData.reduce((sum, data) => sum + data.unique_users, 0) || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {(revenueData.reduce((sum, data) => sum + data.conversion_rate, 0) / revenueData.length || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="goals">Goals & Forecasts</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="mr-2 h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Daily revenue across all streams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="premium" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="coins" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Revenue Distribution
                </CardTitle>
                <CardDescription>Revenue breakdown by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Segment Performance</CardTitle>
              <CardDescription>Revenue analysis by user segments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>ARPU</TableHead>
                    <TableHead>Growth Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userSegments.map((segment, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{segment.segment}</TableCell>
                      <TableCell>{segment.users.toLocaleString()}</TableCell>
                      <TableCell>${segment.revenue.toLocaleString()}</TableCell>
                      <TableCell>${segment.avg_revenue.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {segment.growth_rate >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className={segment.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {Math.abs(segment.growth_rate).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Regional Performance
              </CardTitle>
              <CardDescription>Revenue breakdown by country</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Conversion Rate</TableHead>
                    <TableHead>Top Payment Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionalData.map((region, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{region.country}</TableCell>
                      <TableCell>${region.revenue.toLocaleString()}</TableCell>
                      <TableCell>{region.users.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={region.conversion_rate > 20 ? "default" : "secondary"}>
                          {region.conversion_rate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{region.top_payment_method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Analysis</CardTitle>
              <CardDescription>User journey from visitor to customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {index === 0 ? '👥' : index === 1 ? '✍️' : index === 2 ? '📖' : index === 3 ? '🎯' : index === 4 ? '💳' : '👑'}
                      </div>
                      <div>
                        <h3 className="font-semibold">{stage.stage}</h3>
                        <p className="text-sm text-muted-foreground">
                          {stage.users.toLocaleString()} users
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={stage.conversion_rate > 50 ? "default" : stage.conversion_rate > 25 ? "secondary" : "outline"}>
                        {stage.conversion_rate.toFixed(1)}%
                      </Badge>
                      {index > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Drop: {(100 - stage.conversion_rate).toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Goals</CardTitle>
                <CardDescription>Set and track revenue targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="monthly_target">Monthly Target ($)</Label>
                  <Input
                    id="monthly_target"
                    type="number"
                    value={revenueGoals.monthly_target}
                    onChange={(e) => setRevenueGoals(prev => ({ 
                      ...prev, 
                      monthly_target: parseInt(e.target.value) 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="yearly_target">Yearly Target ($)</Label>
                  <Input
                    id="yearly_target"
                    type="number"
                    value={revenueGoals.yearly_target}
                    onChange={(e) => setRevenueGoals(prev => ({ 
                      ...prev, 
                      yearly_target: parseInt(e.target.value) 
                    }))}
                  />
                </div>
                <Button className="w-full">Update Goals</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Indicators</CardTitle>
                <CardDescription>Key performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Monthly Progress</span>
                    <div className="flex items-center space-x-2">
                      {progressPercentage >= 100 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : progressPercentage >= 75 ? (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      )}
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Growth Rate</span>
                    <span className={`font-semibold ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Yearly Projection</span>
                    <span className="font-semibold">
                      ${((revenueGoals.current_progress * 12)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedRevenueAnalytics;