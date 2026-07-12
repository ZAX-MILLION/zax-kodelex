import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, Users, Award, Settings, Plus, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MonetizationStats {
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  activeWallets: number;
  topSpenders: Array<{
    user_id: string;
    lifetime_spent: number;
    email: string;
  }>;
  chapterUnlocks: number;
  contestEntries: number;
}

interface ChapterPrice {
  id: string;
  chapter_id: string;
  coin_cost: number;
  premium_only: boolean;
  early_access_hours: number;
  chapter_title: string;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  reward_type: string;
  coin_reward: number;
  premium_days: number;
  max_winners: number;
  status: string;
}

export const MonetizationPanel: React.FC = () => {
  const [stats, setStats] = useState<MonetizationStats | null>(null);
  const [chapterPrices, setChapterPrices] = useState<ChapterPrice[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<ChapterPrice | null>(null);
  const [newContest, setNewContest] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    reward_type: 'coins',
    coin_reward: 100,
    premium_days: 0,
    max_winners: 1
  });
  const [coinAdjustment, setCoinAdjustment] = useState({
    userId: '',
    amount: 0,
    reason: ''
  });
  const { toast } = useToast();

  const fetchMonetizationStats = async () => {
    try {
      // Get coin statistics
      const { data: coinStats } = await supabase
        .from('coin_wallets')
        .select('balance, lifetime_earned, lifetime_spent');

      const totalEarned = coinStats?.reduce((sum, wallet) => sum + wallet.lifetime_earned, 0) || 0;
      const totalSpent = coinStats?.reduce((sum, wallet) => sum + wallet.lifetime_spent, 0) || 0;
      const activeWallets = coinStats?.filter(wallet => wallet.balance > 0).length || 0;

      // Get top spenders
      const { data: topSpenders } = await supabase
        .from('coin_wallets')
        .select(`
          user_id,
          lifetime_spent,
          profiles!inner(email)
        `)
        .order('lifetime_spent', { ascending: false })
        .limit(5);

      // Get chapter unlock count
      const { count: chapterUnlocks } = await supabase
        .from('chapter_access')
        .select('*', { count: 'exact', head: true })
        .eq('access_type', 'coins');

      // Get contest entries count
      const { count: contestEntries } = await supabase
        .from('contest_entries')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalCoinsEarned: totalEarned,
        totalCoinsSpent: totalSpent,
        activeWallets,
        topSpenders: topSpenders?.map(s => ({
          user_id: s.user_id,
          lifetime_spent: s.lifetime_spent,
          email: (s.profiles as any)?.email || 'Unknown'
        })) || [],
        chapterUnlocks: chapterUnlocks || 0,
        contestEntries: contestEntries || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchChapterPrices = async () => {
    try {
      const { data } = await supabase
        .from('chapter_prices')
        .select(`
          *,
          chapters!inner(title)
        `)
        .order('coin_cost', { ascending: false });

      setChapterPrices(data?.map(price => ({
        ...price,
        chapter_title: (price.chapters as any)?.title || 'Unknown Chapter'
      })) || []);
    } catch (error) {
      console.error('Error fetching chapter prices:', error);
    }
  };

  const fetchContests = async () => {
    try {
      const { data } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false });

      setContests(data || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
    }
  };

  const updateChapterPrice = async (chapterPrice: ChapterPrice) => {
    try {
      const { error } = await supabase
        .from('chapter_prices')
        .upsert({
          chapter_id: chapterPrice.chapter_id,
          coin_cost: chapterPrice.coin_cost,
          premium_only: chapterPrice.premium_only,
          early_access_hours: chapterPrice.early_access_hours
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chapter pricing updated successfully"
      });

      fetchChapterPrices();
      setSelectedChapter(null);
    } catch (error) {
      console.error('Error updating chapter price:', error);
      toast({
        title: "Error",
        description: "Failed to update chapter pricing",
        variant: "destructive"
      });
    }
  };

  const createContest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('contests')
        .insert({
          ...newContest,
          created_by: user.id,
          status: 'upcoming'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contest created successfully"
      });

      setNewContest({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        reward_type: 'coins',
        coin_reward: 100,
        premium_days: 0,
        max_winners: 1
      });

      fetchContests();
    } catch (error) {
      console.error('Error creating contest:', error);
      toast({
        title: "Error",
        description: "Failed to create contest",
        variant: "destructive"
      });
    }
  };

  const adjustUserCoins = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: success, error } = await supabase
        .rpc('process_coin_transaction', {
          user_id_param: coinAdjustment.userId,
          amount_param: Math.abs(coinAdjustment.amount),
          type_param: 'admin_adjustment',
          context_param: 'admin_manual',
          description_param: coinAdjustment.reason,
          admin_user_id_param: user.id
        });

      if (error) throw error;

      if (success) {
        toast({
          title: "Success",
          description: "Coin adjustment applied successfully"
        });

        setCoinAdjustment({ userId: '', amount: 0, reason: '' });
        fetchMonetizationStats();
      } else {
        throw new Error('Failed to process transaction');
      }
    } catch (error) {
      console.error('Error adjusting coins:', error);
      toast({
        title: "Error",
        description: "Failed to adjust user coins",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMonetizationStats(),
        fetchChapterPrices(),
        fetchContests()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Total Coins Earned</span>
          </div>
          <div className="text-2xl font-bold mt-2">{stats?.totalCoinsEarned.toLocaleString()}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Total Coins Spent</span>
          </div>
          <div className="text-2xl font-bold mt-2">{stats?.totalCoinsSpent.toLocaleString()}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium">Active Wallets</span>
          </div>
          <div className="text-2xl font-bold mt-2">{stats?.activeWallets}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">Chapter Unlocks</span>
          </div>
          <div className="text-2xl font-bold mt-2">{stats?.chapterUnlocks}</div>
        </Card>
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList>
          <TabsTrigger value="pricing">Chapter Pricing</TabsTrigger>
          <TabsTrigger value="contests">Contest Manager</TabsTrigger>
          <TabsTrigger value="coins">Coin Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chapter Pricing</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Set Chapter Price
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Chapter Price</DialogTitle>
                </DialogHeader>
                {/* Chapter pricing form would go here */}
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {chapterPrices.map((price) => (
              <Card key={price.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{price.chapter_title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{price.coin_cost} coins</Badge>
                      {price.premium_only && <Badge variant="secondary">Premium Only</Badge>}
                      {price.early_access_hours > 0 && (
                        <Badge variant="outline">{price.early_access_hours}h early access</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedChapter(price)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Contest Management</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Contest
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Contest</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Contest Title</Label>
                      <Input
                        id="title"
                        value={newContest.title}
                        onChange={(e) => setNewContest({ ...newContest, title: e.target.value })}
                        placeholder="Enter contest title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_winners">Max Winners</Label>
                      <Input
                        id="max_winners"
                        type="number"
                        value={newContest.max_winners}
                        onChange={(e) => setNewContest({ ...newContest, max_winners: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newContest.description}
                      onChange={(e) => setNewContest({ ...newContest, description: e.target.value })}
                      placeholder="Describe the contest..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={newContest.start_date}
                        onChange={(e) => setNewContest({ ...newContest, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={newContest.end_date}
                        onChange={(e) => setNewContest({ ...newContest, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="reward_type">Reward Type</Label>
                      <Select
                        value={newContest.reward_type}
                        onValueChange={(value) => setNewContest({ ...newContest, reward_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coins">Coins</SelectItem>
                          <SelectItem value="premium">Premium Days</SelectItem>
                          <SelectItem value="badge">Badge</SelectItem>
                          <SelectItem value="early_access">Early Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newContest.reward_type === 'coins' && (
                      <div>
                        <Label htmlFor="coin_reward">Coin Reward</Label>
                        <Input
                          id="coin_reward"
                          type="number"
                          value={newContest.coin_reward}
                          onChange={(e) => setNewContest({ ...newContest, coin_reward: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    )}
                    {newContest.reward_type === 'premium' && (
                      <div>
                        <Label htmlFor="premium_days">Premium Days</Label>
                        <Input
                          id="premium_days"
                          type="number"
                          value={newContest.premium_days}
                          onChange={(e) => setNewContest({ ...newContest, premium_days: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    )}
                  </div>

                  <Button onClick={createContest} className="w-full">
                    Create Contest
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {contests.map((contest) => (
              <Card key={contest.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{contest.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={
                        contest.status === 'active' ? 'default' :
                        contest.status === 'upcoming' ? 'secondary' : 'outline'
                      }>
                        {contest.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {contest.reward_type === 'coins' ? `${contest.coin_reward} coins` : 
                         contest.reward_type === 'premium' ? `${contest.premium_days} days` : 
                         contest.reward_type}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Max Winners: {contest.max_winners}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coins" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Manual Coin Adjustment</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={coinAdjustment.userId}
                    onChange={(e) => setCoinAdjustment({ ...coinAdjustment, userId: e.target.value })}
                    placeholder="Enter user UUID"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (positive to add, negative to subtract)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={coinAdjustment.amount}
                    onChange={(e) => setCoinAdjustment({ ...coinAdjustment, amount: parseInt(e.target.value) || 0 })}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={coinAdjustment.reason}
                    onChange={(e) => setCoinAdjustment({ ...coinAdjustment, reason: e.target.value })}
                    placeholder="Reason for adjustment"
                  />
                </div>
                <Button onClick={adjustUserCoins} className="w-full">
                  Apply Adjustment
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Spenders</h3>
              <div className="space-y-3">
                {stats?.topSpenders.map((spender, index) => (
                  <div key={spender.user_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">#{index + 1}</div>
                      <div className="text-sm text-muted-foreground">{spender.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{spender.lifetime_spent.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">coins spent</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Coin Economy Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Coins in Circulation:</span>
                  <span className="font-semibold">
                    {((stats?.totalCoinsEarned || 0) - (stats?.totalCoinsSpent || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Coins per Active User:</span>
                  <span className="font-semibold">
                    {stats?.activeWallets ? Math.round(((stats.totalCoinsEarned - stats.totalCoinsSpent) / stats.activeWallets)) : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Spending Rate:</span>
                  <span className="font-semibold">
                    {stats?.totalCoinsEarned ? Math.round((stats.totalCoinsSpent / stats.totalCoinsEarned) * 100) : 0}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Chapter Unlocks:</span>
                  <span className="font-semibold">{stats?.chapterUnlocks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contest Entries:</span>
                  <span className="font-semibold">{stats?.contestEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Contests:</span>
                  <span className="font-semibold">
                    {contests.filter(c => c.status === 'active').length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Chapter Price Edit Modal */}
      <Dialog open={!!selectedChapter} onOpenChange={() => setSelectedChapter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chapter Price</DialogTitle>
          </DialogHeader>
          {selectedChapter && (
            <div className="space-y-4">
              <div>
                <Label>Chapter: {selectedChapter.chapter_title}</Label>
              </div>
              <div>
                <Label htmlFor="coin_cost">Coin Cost</Label>
                <Input
                  id="coin_cost"
                  type="number"
                  value={selectedChapter.coin_cost}
                  onChange={(e) => setSelectedChapter({
                    ...selectedChapter,
                    coin_cost: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div>
                <Label htmlFor="early_access">Early Access Hours</Label>
                <Input
                  id="early_access"
                  type="number"
                  value={selectedChapter.early_access_hours}
                  onChange={(e) => setSelectedChapter({
                    ...selectedChapter,
                    early_access_hours: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="premium_only"
                  checked={selectedChapter.premium_only}
                  onCheckedChange={(checked) => setSelectedChapter({
                    ...selectedChapter,
                    premium_only: checked
                  })}
                />
                <Label htmlFor="premium_only">Premium Only</Label>
              </div>
              <Button onClick={() => updateChapterPrice(selectedChapter)} className="w-full">
                Update Price
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};