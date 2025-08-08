import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Trophy, 
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PurchaseRecord {
  id: string;
  amount: number;
  type: string;
  description: string;
  chapter_id?: string;
  created_at: string;
  chapter_title?: string;
  series_title?: string;
}

interface SeriesSpendData {
  series_id: string;
  series_title: string;
  total_spent: number;
  chapter_count: number;
  chapters: Array<{
    chapter_id: string;
    chapter_title: string;
    amount: number;
    date: string;
  }>;
}

interface TopSeries {
  series_id: string;
  series_title: string;
  total_revenue: number;
  unique_spenders: number;
  average_spend: number;
}

export const CoinAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);
  const [spendingLogs, setSpendingLogs] = useState<PurchaseRecord[]>([]);
  const [seriesSpending, setSeriesSpending] = useState<SeriesSpendData[]>([]);
  const [topSeries, setTopSeries] = useState<TopSeries[]>([]);
  const [stats, setStats] = useState({
    totalPurchased: 0,
    totalSpent: 0,
    currentBalance: 0,
    transactionCount: 0
  });

  const fetchAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch purchase history (coins bought)
      const { data: purchases, error: purchaseError } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'purchase')
        .order('created_at', { ascending: false });

      if (purchaseError) throw purchaseError;

      // Mock spending data for demo
      const spending: any[] = [];

      // Fetch current wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('coin_wallets')
        .select('balance, lifetime_earned, lifetime_spent')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') throw walletError;

      // Process data
      setPurchaseHistory(purchases || []);
      
      const processedSpending = (spending || []).map(record => ({
        ...record,
        chapter_title: record.chapters?.title,
        series_title: record.manga_meta?.title
      }));
      setSpendingLogs(processedSpending);

      // Group spending by series
      const seriesGroups = processedSpending.reduce((acc, record) => {
        if (!record.chapters?.series_id) return acc;
        
        const seriesId = record.chapters.series_id;
        if (!acc[seriesId]) {
          acc[seriesId] = {
            series_id: seriesId,
            series_title: record.series_title || 'Unknown Series',
            total_spent: 0,
            chapter_count: 0,
            chapters: []
          };
        }
        
        acc[seriesId].total_spent += Math.abs(record.amount);
        acc[seriesId].chapter_count += 1;
        acc[seriesId].chapters.push({
          chapter_id: record.chapter_id!,
          chapter_title: record.chapter_title || 'Unknown Chapter',
          amount: Math.abs(record.amount),
          date: record.created_at
        });
        
        return acc;
      }, {} as Record<string, SeriesSpendData>);

      setSeriesSpending(Object.values(seriesGroups));

      // Calculate stats
      const totalPurchased = (purchases || []).reduce((sum, p) => sum + p.amount, 0);
      const totalSpent = (spending || []).reduce((sum, s) => sum + Math.abs(s.amount), 0);

      setStats({
        totalPurchased,
        totalSpent,
        currentBalance: wallet?.balance || 0,
        transactionCount: (purchases || []).length + (spending || []).length
      });

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

  const fetchTopSeries = async () => {
    // Mock top series data for demo
    setTopSeries([]);
  };

  useEffect(() => {
    fetchAnalyticsData();
    fetchTopSeries();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coin Analytics</h2>
          <p className="text-muted-foreground">Track your spending and purchase history</p>
        </div>
        <Button onClick={fetchAnalyticsData} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.currentBalance}</p>
              </div>
              <Coins className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Purchased</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPurchased}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalSpent}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{stats.transactionCount}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="purchases" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          <TabsTrigger value="spending">Spending Log</TabsTrigger>
          <TabsTrigger value="series">Series Breakdown</TabsTrigger>
          <TabsTrigger value="top">Top Series</TabsTrigger>
        </TabsList>

        {/* Purchase History */}
        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>All coin purchases and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              {purchaseHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No purchases yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchaseHistory.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-full">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{record.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(record.created_at), 'PPP')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">+{record.amount}</div>
                        <Badge variant="outline" className="text-xs">Purchase</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spending Log */}
        <TabsContent value="spending">
          <Card>
            <CardHeader>
              <CardTitle>Spending Log</CardTitle>
              <CardDescription>Detailed breakdown of coin usage</CardDescription>
            </CardHeader>
            <CardContent>
              {spendingLogs.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No spending recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {spendingLogs.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-full">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium">{record.chapter_title}</div>
                          <div className="text-sm text-muted-foreground">{record.series_title}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(record.created_at), 'PPP')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">-{Math.abs(record.amount)}</div>
                        <Badge variant="secondary" className="text-xs">Chapter Unlock</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Series Breakdown */}
        <TabsContent value="series">
          <Card>
            <CardHeader>
              <CardTitle>Series Spending Breakdown</CardTitle>
              <CardDescription>How much you've spent on each series</CardDescription>
            </CardHeader>
            <CardContent>
              {seriesSpending.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No series spending data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {seriesSpending
                    .sort((a, b) => b.total_spent - a.total_spent)
                    .map((series) => (
                      <div key={series.series_id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{series.series_title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {series.chapter_count} chapters unlocked
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{series.total_spent} coins</div>
                            <div className="text-sm text-muted-foreground">
                              {(series.total_spent / series.chapter_count).toFixed(1)} avg per chapter
                            </div>
                          </div>
                        </div>
                        <div className="pl-4 space-y-2">
                          {series.chapters.map((chapter) => (
                            <div key={chapter.chapter_id} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{chapter.chapter_title}</span>
                              <div className="flex items-center gap-2">
                                <span>{chapter.amount} coins</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(chapter.date), 'MMM d')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Series Platform-wide */}
        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle>Top Revenue Generating Series</CardTitle>
              <CardDescription>Platform-wide series performance</CardDescription>
            </CardHeader>
            <CardContent>
              {topSeries.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topSeries.map((series, index) => (
                    <div key={series.series_id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{series.series_title}</div>
                          <div className="text-sm text-muted-foreground">
                            {series.unique_spenders} unique spenders
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{series.total_revenue} coins</div>
                        <div className="text-sm text-muted-foreground">
                          {series.average_spend.toFixed(1)} avg per transaction
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};