import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  Coins, Crown, Download, Calendar, BarChart3,
  PieChart, LineChart, FileText, RefreshCw
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { db } from '@/utils/DatabaseCompatibility';

interface RevenueData {
  period: string;
  coins: number;
  premium: number;
  patreon: number;
  licenses: number;
  total: number;
}

interface TopPurchaser {
  id: string;
  email: string;
  name: string;
  total_spent: number;
  purchase_count: number;
  last_purchase: string;
  user_type: 'premium' | 'patreon' | 'regular';
}

interface ConversionMetrics {
  total_users: number;
  premium_users: number;
  conversion_rate: number;
  churn_rate: number;
  avg_revenue_per_user: number;
}

interface LicenseSale {
  id: string;
  license_type: string;
  price: number;
  region: string;
  sold_at: string;
}

const RevenueAnalytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topPurchasers, setTopPurchasers] = useState<TopPurchaser[]>([]);
  const [conversionMetrics, setConversionMetrics] = useState<ConversionMetrics>({
    total_users: 0,
    premium_users: 0,
    conversion_rate: 0,
    churn_rate: 0,
    avg_revenue_per_user: 0
  });
  const [licenseSales, setLicenseSales] = useState<LicenseSale[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Generate mock data based on date range
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
      const mockRevenueData: RevenueData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const period = date.toISOString().split('T')[0];
        
        const coins = Math.floor(Math.random() * 500) + 100;
        const premium = Math.floor(Math.random() * 800) + 200;
        const patreon = Math.floor(Math.random() * 300) + 50;
        const licenses = Math.floor(Math.random() * 200) + 25;
        
        mockRevenueData.push({
          period,
          coins,
          premium,
          patreon,
          licenses,
          total: coins + premium + patreon + licenses
        });
      }

      // Mock top purchasers
      const mockPurchasers: TopPurchaser[] = [
        {
          id: '1',
          email: 'whale@example.com',
          name: 'Big Spender',
          total_spent: 2450,
          purchase_count: 24,
          last_purchase: new Date().toISOString(),
          user_type: 'premium'
        },
        {
          id: '2',
          email: 'supporter@example.com',
          name: 'Loyal Fan',
          total_spent: 1200,
          purchase_count: 12,
          last_purchase: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          user_type: 'patreon'
        },
        {
          id: '3',
          email: 'reader@example.com',
          name: 'Regular Reader',
          total_spent: 680,
          purchase_count: 8,
          last_purchase: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          user_type: 'regular'
        }
      ];

      // Mock license sales
      const mockLicenseSales: LicenseSale[] = [
        {
          id: '1',
          license_type: 'Standard',
          price: 299,
          region: 'US',
          sold_at: new Date().toISOString()
        },
        {
          id: '2',
          license_type: 'Premium',
          price: 599,
          region: 'EU',
          sold_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          license_type: 'Enterprise',
          price: 1299,
          region: 'ASIA',
          sold_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Mock conversion metrics
      const mockConversionMetrics: ConversionMetrics = {
        total_users: 1250,
        premium_users: 187,
        conversion_rate: 14.96,
        churn_rate: 3.2,
        avg_revenue_per_user: 23.45
      };

      if (db.isSupabase()) {
        setRevenueData(mockRevenueData);
        setTopPurchasers(mockPurchasers);
        setLicenseSales(mockLicenseSales);
        setConversionMetrics(mockConversionMetrics);
      } else {
        // MySQL implementation would query actual data
        setRevenueData(mockRevenueData);
        setTopPurchasers(mockPurchasers);
        setLicenseSales(mockLicenseSales);
        setConversionMetrics(mockConversionMetrics);
      }

      // Calculate total revenue
      const total = mockRevenueData.reduce((sum, data) => sum + data.total, 0);
      setTotalRevenue(total);

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

  const exportToCSV = () => {
    const csvData = [
      ['Period', 'Coins', 'Premium', 'Patreon', 'Licenses', 'Total'],
      ...revenueData.map(data => [
        data.period,
        data.coins.toString(),
        data.premium.toString(),
        data.patreon.toString(),
        data.licenses.toString(),
        data.total.toString()
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-analytics-${dateRange}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Analytics data exported to CSV",
    });
  };

  const getRevenueTrend = () => {
    if (revenueData.length < 2) return { trend: 'stable', percentage: 0 };
    
    const recent = revenueData.slice(-7).reduce((sum, data) => sum + data.total, 0);
    const previous = revenueData.slice(-14, -7).reduce((sum, data) => sum + data.total, 0);
    
    if (previous === 0) return { trend: 'stable', percentage: 0 };
    
    const percentage = ((recent - previous) / previous) * 100;
    const trend = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable';
    
    return { trend, percentage: Math.abs(percentage) };
  };

  const pieData = [
    { name: 'Coins', value: revenueData.reduce((sum, data) => sum + data.coins, 0), color: '#fbbf24' },
    { name: 'Premium', value: revenueData.reduce((sum, data) => sum + data.premium, 0), color: '#a855f7' },
    { name: 'Patreon', value: revenueData.reduce((sum, data) => sum + data.patreon, 0), color: '#ef4444' },
    { name: 'Licenses', value: revenueData.reduce((sum, data) => sum + data.licenses, 0), color: '#22c55e' }
  ];

  const { trend, percentage } = getRevenueTrend();

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
          <h2 className="text-2xl font-bold tracking-tight">Revenue Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive revenue insights and performance metrics
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
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : null}
                  <span className={`text-sm ml-1 ${
                    trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {trend !== 'stable' && `${percentage.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold">{conversionMetrics.conversion_rate}%</p>
                <p className="text-sm text-muted-foreground">
                  {conversionMetrics.premium_users} of {conversionMetrics.total_users}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  ARPU
                </p>
                <p className="text-2xl font-bold">${conversionMetrics.avg_revenue_per_user}</p>
                <p className="text-sm text-muted-foreground">
                  Avg Revenue per User
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  License Sales
                </p>
                <p className="text-2xl font-bold">{licenseSales.length}</p>
                <p className="text-sm text-muted-foreground">
                  ${licenseSales.reduce((sum, sale) => sum + sale.price, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Top Customers</TabsTrigger>
          <TabsTrigger value="licenses">License Sales</TabsTrigger>
          <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="mr-2 h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>
                  Daily revenue across all streams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Revenue Sources
                </CardTitle>
                <CardDescription>
                  Revenue distribution by source
                </CardDescription>
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

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Top Purchasers
              </CardTitle>
              <CardDescription>
                Highest spending customers by total revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Purchases</TableHead>
                    <TableHead>Last Purchase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPurchasers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={customer.user_type === 'premium' ? 'default' : 
                                  customer.user_type === 'patreon' ? 'destructive' : 'secondary'}
                        >
                          {customer.user_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">${customer.total_spent.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>{customer.purchase_count}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(customer.last_purchase).toLocaleDateString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5" />
                License Sales
              </CardTitle>
              <CardDescription>
                Recent license purchases and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Sold At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenseSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <Badge variant="outline">{sale.license_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">${sale.price}</span>
                      </TableCell>
                      <TableCell>{sale.region}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(sale.sold_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Revenue Breakdown
              </CardTitle>
              <CardDescription>
                Detailed breakdown by revenue stream
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="coins" stackId="a" fill="#fbbf24" />
                    <Bar dataKey="premium" stackId="a" fill="#a855f7" />
                    <Bar dataKey="patreon" stackId="a" fill="#ef4444" />
                    <Bar dataKey="licenses" stackId="a" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueAnalytics;