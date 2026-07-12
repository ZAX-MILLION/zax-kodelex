import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Crown, Users, DollarSign, RefreshCw, Search, TrendingUp } from 'lucide-react';

interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'premium';
  status: 'active' | 'canceled' | 'expired' | 'pending';
  paypal_subscription_id?: string;
  start_date: string;
  end_date?: string;
  amount?: number;
  currency: string;
  auto_renew: boolean;
  profiles?: {
    email: string;
    username?: string;
  } | null;
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  churnRate: number;
}

const SubscriptionManager = () => {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    churnRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          profiles (
            email,
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions((data || []) as unknown as Subscription[]);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('status, amount, plan, created_at');

      if (error) throw error;

      const stats = (data || []).reduce((acc, sub) => {
        acc.totalSubscriptions++;
        if (sub.status === 'active' && sub.plan === 'premium') {
          acc.activeSubscriptions++;
          acc.monthlyRevenue += Number(sub.amount || 0);
        }
        return acc;
      }, {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        churnRate: 0
      });

      // Calculate churn rate (simplified)
      const totalPremium = (data || []).filter(sub => sub.plan === 'premium').length;
      const cancelledPremium = (data || []).filter(sub => sub.plan === 'premium' && sub.status === 'canceled').length;
      stats.churnRate = totalPremium > 0 ? (cancelledPremium / totalPremium) * 100 : 0;

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateSubscriptionStatus = async (subscriptionId: string, newStatus: 'active' | 'canceled' | 'expired') => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: newStatus,
          end_date: newStatus === 'canceled' || newStatus === 'expired' ? new Date().toISOString() : null
        })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription status updated successfully",
      });

      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription status",
        variant: "destructive",
      });
    }
  };

  const upgradeUserToPremium = async (userId: string) => {
    try {
      // Check if user already has a subscription
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (existingSub) {
        toast({
          title: "Info",
          description: "User already has an active subscription",
        });
        return;
      }

      // Create new premium subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan: 'premium',
          status: 'active',
          amount: 5.00,
          currency: 'USD',
          auto_renew: true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User upgraded to premium successfully",
      });

      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      console.error('Error upgrading user:', error);
      toast({
        title: "Error",
        description: "Failed to upgrade user to premium",
        variant: "destructive",
      });
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = searchTerm === '' || 
      subscription.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.paypal_subscription_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'free':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Premium</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.churnRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>
            Manage user subscriptions, upgrade users manually, and monitor subscription health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email, username, or PayPal ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="canceled">Canceled</option>
              <option value="expired">Expired</option>
            </select>
            <Button onClick={fetchSubscriptions} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Subscriptions Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Auto Renew</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {subscription.profiles?.username || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{subscription.profiles?.email}</div>
                        {subscription.paypal_subscription_id && (
                          <div className="text-xs text-gray-400 font-mono">
                            PayPal: {subscription.paypal_subscription_id.slice(0, 12)}...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPlanColor(subscription.plan)}>
                        {subscription.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ${subscription.amount || 0} {subscription.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(subscription.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscription.auto_renew ? "outline" : "secondary"}>
                        {subscription.auto_renew ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {subscription.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updateSubscriptionStatus(subscription.id, 'active')}
                          >
                            Activate
                          </Button>
                        )}
                        {subscription.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSubscriptionStatus(subscription.id, 'canceled')}
                          >
                            Cancel
                          </Button>
                        )}
                        {subscription.plan === 'free' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => upgradeUserToPremium(subscription.user_id)}
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Upgrade
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSubscriptions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No subscriptions found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManager;