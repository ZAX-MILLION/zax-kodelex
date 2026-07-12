import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useCoinWallet } from '@/hooks/useCoinWallet';
import { PremiumOnly, RoleGuard } from '@/components/auth/RoleGuard';
import { Coins, Download, Eye, Clock, Star, AlertCircle, Crown, TrendingUp, Shield } from 'lucide-react';
import { openAuthModal } from '@/utils/authRedirect';
import { Link } from 'react-router-dom';

interface UsageStats {
  daily_downloads: number;
  monthly_downloads: number;
  daily_reads: number;
  last_activity: string | null;
}

const MonetizationDashboard = () => {
  const { user, userProfile } = useAuth();
  const { isPremium } = useSubscription();
  const { wallet, transactions, spendCoins, addCoins } = useCoinWallet();
  const [usageStats, setUsageStats] = useState<UsageStats>({
    daily_downloads: 2,
    monthly_downloads: 8,
    daily_reads: 15,
    last_activity: null
  });

  // Usage limits for free users
  const limits = {
    daily_downloads: 3,
    monthly_downloads: 10,
    daily_reads: 20
  };

  const downloadLimitReached = usageStats.daily_downloads >= limits.daily_downloads;
  const monthlyLimitReached = usageStats.monthly_downloads >= limits.monthly_downloads;
  const readLimitReached = usageStats.daily_reads >= limits.daily_reads;

  const handleTestCoinSpend = async () => {
    await spendCoins(5, 'Test premium feature access');
  };

  const handleTestCoinGrant = async () => {
    await addCoins(100, 'Test coin grant for development');
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">
            Sign in to access monetization features and track your usage
          </p>
          <Button onClick={() => openAuthModal()}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Account Status
              </CardTitle>
              <CardDescription>
                Your current subscription and usage summary
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isPremium ? (
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium Active
                </Badge>
              ) : (
                <Badge variant="outline">Free User</Badge>
              )}
              {userProfile?.role && userProfile.role !== 'user' && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                  {userProfile.role}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Coin Balance */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 p-4 rounded-lg border border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <Coins className="h-6 w-6 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-600">
                  {wallet?.balance || 0}
                </span>
              </div>
              <p className="text-sm text-yellow-600">Available Coins</p>
            </div>

            {/* Download Usage */}
            <div className={`p-4 rounded-lg border ${
              downloadLimitReached 
                ? 'bg-red-500/10 border-red-500/20' 
                : 'bg-blue-500/10 border-blue-500/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <Download className="h-6 w-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">
                  {isPremium ? '∞' : `${usageStats.daily_downloads}/${limits.daily_downloads}`}
                </span>
              </div>
              <p className="text-sm text-blue-600">Daily Downloads</p>
            </div>

            {/* Read Usage */}
            <div className={`p-4 rounded-lg border ${
              readLimitReached && !isPremium
                ? 'bg-red-500/10 border-red-500/20' 
                : 'bg-green-500/10 border-green-500/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <Eye className="h-6 w-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {isPremium ? '∞' : `${usageStats.daily_reads}/${limits.daily_reads}`}
                </span>
              </div>
              <p className="text-sm text-green-600">Daily Reads</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Warnings for Free Users */}
      {!isPremium && (downloadLimitReached || monthlyLimitReached || readLimitReached) && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-700">Usage Limits Reached</h3>
                <div className="text-sm text-amber-600 mt-1 space-y-1">
                  {downloadLimitReached && <p>• Daily download limit reached (3/3)</p>}
                  {monthlyLimitReached && <p>• Monthly download limit reached ({limits.monthly_downloads}/{limits.monthly_downloads})</p>}
                  {readLimitReached && <p>• Daily reading limit reached ({limits.daily_reads}/{limits.daily_reads})</p>}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black">
                    <Link to="/subscribe">
                      <Crown className="h-3 w-3 mr-1" />
                      Upgrade to Premium
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleTestCoinSpend}>
                    <Coins className="h-3 w-3 mr-1" />
                    Use 5 Coins
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest coin transactions and usage
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleTestCoinGrant}>
                Add Test Coins
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.amount > 0 
                        ? 'bg-green-500/20 text-green-600' 
                        : 'bg-red-500/20 text-red-600'
                    }`}>
                      <Coins className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Features */}
      <PremiumOnly fallback={
        <Card className="border-amber-500/30">
          <CardContent className="p-6 text-center">
            <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unlock Premium Features</h3>
            <p className="text-muted-foreground mb-4">
              Get unlimited downloads, reads, ad-free experience, and exclusive themes
            </p>
            <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black">
              <Link to="/subscribe">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Link>
            </Button>
          </CardContent>
        </Card>
      }>
        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Crown className="h-5 w-5" />
              Premium Benefits Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Download className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                <p className="text-sm font-medium">Unlimited Downloads</p>
              </div>
              <div className="text-center">
                <Eye className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                <p className="text-sm font-medium">Unlimited Reading</p>
              </div>
              <div className="text-center">
                <Star className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                <p className="text-sm font-medium">Ad-Free Experience</p>
              </div>
              <div className="text-center">
                <Crown className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                <p className="text-sm font-medium">Premium Themes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PremiumOnly>

      {/* Admin Controls */}
      <RoleGuard allowedRoles={['admin']} hideWhenUnauthorized>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Admin Monetization Controls
            </CardTitle>
            <CardDescription>
              Administrative controls for monetization and user limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/flags">Feature Flags</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/analytics">Usage Analytics</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/subscriptions">Subscription Manager</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </RoleGuard>
    </div>
  );
};

export default MonetizationDashboard;