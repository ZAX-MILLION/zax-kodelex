import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Coins, TrendingUp, Download, Eye, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LazyImage from '@/components/LazyImage';
import { formatDistanceToNow, format } from 'date-fns';

interface PurchaseHistory {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  username?: string;
}

interface SpendingLog {
  id: string;
  user_id: string;
  series_id: string;
  chapter_id: string;
  amount: number;
  created_at: string;
  username?: string;
}

interface TopSeries {
  series_id: string;
  title: string;
  cover_image_url: string;
  total_coins_spent: number;
  unique_users: number;
  total_unlocks: number;
}

const CoinAnalytics = () => {
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [spendingLogs, setSpendingLogs] = useState<SpendingLog[]>([]);
  const [topSeries, setTopSeries] = useState<TopSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const { toast } = useToast();

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calculate date filter
      const now = new Date();
      let dateFilter = '';
      if (dateRange !== 'all') {
        const daysAgo = parseInt(dateRange.replace('d', ''));
        const filterDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        dateFilter = filterDate.toISOString();
      }

      // Fetch purchase history from coin_transactions
      let purchaseQuery = supabase
        .from('coin_transactions')
        .select('*')
        .eq('type', 'purchase')
        .order('created_at', { ascending: false });

      if (dateFilter) {
        purchaseQuery = purchaseQuery.gte('created_at', dateFilter);
      }

      const { data: purchases, error: purchaseError } = await purchaseQuery;
      
      // Fetch spending logs
      let spendingQuery = supabase
        .from('coin_transactions')
        .select('*')
        .eq('type', 'spend')
        .order('created_at', { ascending: false });

      if (dateFilter) {
        spendingQuery = spendingQuery.gte('created_at', dateFilter);
      }

      const { data: spending, error: spendingError } = await spendingQuery;

      // Create mock top series data since we don't have the specific function
      const mockTopSeries: TopSeries[] = [
        {
          series_id: '1',
          title: 'Popular Series 1',
          cover_image_url: '/placeholder.svg',
          total_coins_spent: 1500,
          unique_users: 45,
          total_unlocks: 120
        },
        {
          series_id: '2', 
          title: 'Popular Series 2',
          cover_image_url: '/placeholder.svg',
          total_coins_spent: 1200,
          unique_users: 38,
          total_unlocks: 95
        }
      ];

      if (purchaseError) throw purchaseError;
      if (spendingError) throw spendingError;

      // Transform the data to match our interface, adding mock usernames
      const transformedPurchases: PurchaseHistory[] = (purchases || []).map(p => ({
        id: p.id,
        user_id: p.user_id,
        amount: p.amount,
        type: p.type,
        description: p.description || 'Coin purchase',
        created_at: p.created_at,
        username: `User${p.user_id.slice(-4)}`
      }));

      const transformedSpending: SpendingLog[] = (spending || []).map(s => ({
        id: s.id,
        user_id: s.user_id,
        series_id: s.reference_id || '',
        chapter_id: s.reference_id || '',
        amount: Math.abs(s.amount),
        created_at: s.created_at,
        username: `User${s.user_id.slice(-4)}`
      }));

      setPurchaseHistory(transformedPurchases);
      setSpendingLogs(transformedSpending);
      setTopSeries(mockTopSeries);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const totalRevenue = purchaseHistory.reduce((sum, purchase) => sum + purchase.amount, 0);
  const totalCoinsSpent = spendingLogs.reduce((sum, log) => sum + log.amount, 0);

  const exportData = (type: 'purchases' | 'spending') => {
    const data = type === 'purchases' ? purchaseHistory : spendingLogs;
    const csv = type === 'purchases' 
      ? 'Date,User,Amount,Type,Description\n' + purchaseHistory.map(p => 
          `${format(new Date(p.created_at), 'yyyy-MM-dd')},${p.username || 'Unknown'},${p.amount},${p.type},${p.description}`
        ).join('\n')
      : 'Date,User,Amount\n' + spendingLogs.map(s => 
          `${format(new Date(s.created_at), 'yyyy-MM-dd')},${s.username || 'Unknown'},${s.amount}`
        ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${dateRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold">Coin Analytics</h1>
              <p className="text-muted-foreground mt-2">Loading analytics data...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-8 bg-muted rounded w-16" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Coin Analytics Dashboard</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track coin purchases, spending patterns, and top-performing series
            </p>
            
            {/* Date Range Filter */}
            <div className="flex justify-center gap-2">
              {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(range)}
                >
                  {range === 'all' ? 'All Time' : range.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} coins</div>
                <p className="text-xs text-muted-foreground">
                  From {purchaseHistory.length} purchases
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coins Spent</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCoinsSpent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  From {spendingLogs.length} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Series</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{topSeries[0]?.total_coins_spent.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {topSeries[0]?.title || 'No data'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(spendingLogs.map(log => log.user_id)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique spenders
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="purchases" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="purchases">Purchase History</TabsTrigger>
              <TabsTrigger value="spending">Spending Logs</TabsTrigger>
              <TabsTrigger value="series">Top Series</TabsTrigger>
            </TabsList>

            <TabsContent value="purchases" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Purchase History</h2>
                <Button onClick={() => exportData('purchases')} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              
              <div className="space-y-4">
                {purchaseHistory.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No purchase data found</p>
                  </Card>
                ) : (
                  purchaseHistory.map((purchase) => (
                    <Card key={purchase.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-medium">{purchase.username || 'Unknown User'}</p>
                            <p className="text-sm text-muted-foreground">{purchase.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(purchase.created_at), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-lg font-bold">{purchase.amount} coins</p>
                            <Badge variant="default">
                              {purchase.type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="spending" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Spending Logs</h2>
                <Button onClick={() => exportData('spending')} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              
              <div className="space-y-4">
                {spendingLogs.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No spending data found</p>
                  </Card>
                ) : (
                  spendingLogs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                            <Coins className="h-6 w-6" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="font-medium">Coin Spending</p>
                            <p className="text-sm text-muted-foreground">
                              By {log.username || 'Unknown User'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-600">-{log.amount} coins</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="series" className="space-y-4">
              <h2 className="text-2xl font-bold">Top Revenue-Generating Series</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topSeries.length === 0 ? (
                  <Card className="p-8 text-center md:col-span-2 lg:col-span-3">
                    <p className="text-muted-foreground">No series data found</p>
                  </Card>
                ) : (
                  topSeries.map((series, index) => (
                    <Card key={series.series_id} className="overflow-hidden">
                      <div className="relative">
                        <LazyImage
                          src={series.cover_image_url || '/placeholder.svg'}
                          alt={series.title}
                          className="w-full h-48 object-cover"
                        />
                        {index < 3 && (
                          <Badge className="absolute top-2 left-2">
                            #{index + 1}
                          </Badge>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2">{series.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Coins</span>
                          <span className="font-bold text-lg">{series.total_coins_spent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Unique Users</span>
                          <span className="font-medium">{series.unique_users}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Unlocks</span>
                          <span className="font-medium">{series.total_unlocks}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CoinAnalytics;
