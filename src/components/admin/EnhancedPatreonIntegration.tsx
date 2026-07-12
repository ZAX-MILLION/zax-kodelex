import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, Link, Unlink, DollarSign, Crown, 
  Users, Coins, Webhook, Settings, RefreshCw,
  Shield, Gift, AlertCircle, CheckCircle, XCircle,
  Calendar, TrendingUp, UserPlus, CreditCard
} from 'lucide-react';
import { db } from '@/utils/DatabaseCompatibility';

interface PatreonUser {
  id: string;
  user_id: string;
  patreon_id: string;
  pledge_amount: number;
  tier_name: string;
  active: boolean;
  email: string;
  name: string;
  coins_granted: number;
  monthly_coins: number;
  last_sync: string;
  created_at: string;
  avatar_url?: string;
  total_lifetime_support: number;
  streak_months: number;
}

interface PatreonTier {
  id: string;
  name: string;
  amount_cents: number;
  monthly_coins: number;
  premium_access: boolean;
  special_badge: string;
  perks: string[];
  is_active: boolean;
}

interface PatreonWebhook {
  id: string;
  event_type: string;
  pledge_amount: number;
  user_email: string;
  tier_name: string;
  processed_at: string;
  status: 'processed' | 'failed' | 'pending';
  retry_count: number;
  error_message?: string;
}

interface PatreonSettings {
  client_id: string;
  client_secret: string;
  webhook_secret: string;
  webhook_url: string;
  auto_coin_topup: boolean;
  coin_multiplier: number;
  sync_frequency: number;
  premium_auto_upgrade: boolean;
  badge_display: boolean;
  welcome_message: string;
  thank_you_message: string;
}

const EnhancedPatreonIntegration = () => {
  const { toast } = useToast();
  const [patreonUsers, setPatreonUsers] = useState<PatreonUser[]>([]);
  const [patreonTiers, setPatreonTiers] = useState<PatreonTier[]>([]);
  const [webhooks, setWebhooks] = useState<PatreonWebhook[]>([]);
  const [settings, setSettings] = useState<PatreonSettings>({
    client_id: '',
    client_secret: '',
    webhook_secret: '',
    webhook_url: '',
    auto_coin_topup: true,
    coin_multiplier: 50,
    sync_frequency: 24,
    premium_auto_upgrade: true,
    badge_display: true,
    welcome_message: 'Welcome to our Patreon community! Thank you for your support.',
    thank_you_message: 'Thank you for your continued support! Your coins have been added.'
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    loadPatreonData();
  }, []);

  const loadPatreonData = async () => {
    try {
      setLoading(true);

      // Load Patreon settings
      const savedSettings = localStorage.getItem('patreon_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
        setIsConnected(true);
      }

      // Enhanced mock tiers
      const mockTiers: PatreonTier[] = [
        {
          id: '1',
          name: 'Supporter',
          amount_cents: 500,
          monthly_coins: 250,
          premium_access: false,
          special_badge: '🌟',
          perks: ['Monthly coins', 'Discord access', 'Early chapter previews'],
          is_active: true
        },
        {
          id: '2',
          name: 'Premium Fan',
          amount_cents: 1000,
          monthly_coins: 600,
          premium_access: true,
          special_badge: '💎',
          perks: ['Premium access', 'Ad-free reading', 'Exclusive content', 'Monthly coins', 'Discord perks'],
          is_active: true
        },
        {
          id: '3',
          name: 'VIP Patron',
          amount_cents: 2500,
          monthly_coins: 1500,
          premium_access: true,
          special_badge: '👑',
          perks: ['All Premium perks', 'Early access', 'Character naming rights', 'Direct author contact'],
          is_active: true
        }
      ];

      // Enhanced mock users
      const mockUsers: PatreonUser[] = [
        {
          id: '1',
          user_id: 'user1',
          patreon_id: 'patreon123',
          pledge_amount: 10,
          tier_name: 'Premium Fan',
          active: true,
          email: 'supporter@example.com',
          name: 'Alex Supporter',
          coins_granted: 3600,
          monthly_coins: 600,
          last_sync: new Date().toISOString(),
          created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          total_lifetime_support: 60,
          streak_months: 6
        },
        {
          id: '2',
          user_id: 'user2',
          patreon_id: 'patreon456',
          pledge_amount: 25,
          tier_name: 'VIP Patron',
          active: true,
          email: 'vip@example.com',
          name: 'Jamie VIP',
          coins_granted: 9000,
          monthly_coins: 1500,
          last_sync: new Date().toISOString(),
          created_at: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString(),
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie',
          total_lifetime_support: 300,
          streak_months: 12
        },
        {
          id: '3',
          user_id: 'user3',
          patreon_id: 'patreon789',
          pledge_amount: 5,
          tier_name: 'Supporter',
          active: false,
          email: 'former@example.com',
          name: 'Sam Former',
          coins_granted: 750,
          monthly_coins: 250,
          last_sync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
          total_lifetime_support: 15,
          streak_months: 0
        }
      ];

      // Enhanced webhook data
      const mockWebhooks: PatreonWebhook[] = [
        {
          id: '1',
          event_type: 'pledge_created',
          pledge_amount: 10,
          user_email: 'newuser@example.com',
          tier_name: 'Premium Fan',
          processed_at: new Date().toISOString(),
          status: 'processed',
          retry_count: 0
        },
        {
          id: '2',
          event_type: 'pledge_updated',
          pledge_amount: 25,
          user_email: 'vip@example.com',
          tier_name: 'VIP Patron',
          processed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'processed',
          retry_count: 0
        },
        {
          id: '3',
          event_type: 'pledge_deleted',
          pledge_amount: 5,
          user_email: 'former@example.com',
          tier_name: 'Supporter',
          processed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'failed',
          retry_count: 3,
          error_message: 'User account not found'
        }
      ];

      setPatreonTiers(mockTiers);
      setPatreonUsers(mockUsers);
      setWebhooks(mockWebhooks);

    } catch (error) {
      console.error('Failed to load Patreon data:', error);
      toast({
        title: "Error",
        description: "Failed to load Patreon integration data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!settings.client_id || !settings.client_secret) {
      toast({
        title: "Error",
        description: "Please provide both Client ID and Client Secret",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);
    setSyncProgress(0);
    
    try {
      // Simulate connection process
      for (let i = 0; i <= 100; i += 10) {
        setSyncProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      localStorage.setItem('patreon_settings', JSON.stringify(settings));
      setIsConnected(true);
      
      toast({
        title: "Success",
        description: "Successfully connected to Patreon",
      });
    } catch (error) {
      console.error('Failed to connect to Patreon:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Patreon",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
      setSyncProgress(0);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      setSyncProgress(0);
      
      // Simulate sync process
      for (let i = 0; i <= 100; i += 20) {
        setSyncProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      await loadPatreonData();
      
      toast({
        title: "Success",
        description: "Patreon data synced successfully",
      });
    } catch (error) {
      console.error('Failed to sync:', error);
      toast({
        title: "Error",
        description: "Failed to sync Patreon data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSyncProgress(0);
    }
  };

  const giftCoins = async (userId: string, amount: number) => {
    try {
      // In real implementation, this would call API to add coins
      toast({
        title: "Success",
        description: `${amount} coins gifted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to gift coins",
        variant: "destructive",
      });
    }
  };

  const calculateStats = () => {
    const activePatrons = patreonUsers.filter(user => user.active);
    const totalRevenue = activePatrons.reduce((sum, user) => sum + user.pledge_amount, 0);
    const totalCoins = patreonUsers.reduce((sum, user) => sum + user.coins_granted, 0);
    const avgPledge = activePatrons.length > 0 ? totalRevenue / activePatrons.length : 0;
    
    return { activePatrons: activePatrons.length, totalRevenue, totalCoins, avgPledge };
  };

  const getTierBadge = (tierName: string) => {
    const tier = patreonTiers.find(t => t.name === tierName);
    return tier?.special_badge || '💙';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const stats = calculateStats();

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
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Patreon Integration</h2>
          <p className="text-muted-foreground">
            Advanced Patreon management with automated rewards and tier system
          </p>
        </div>
        <div className="flex space-x-2">
          {isConnected && (
            <Button variant="outline" onClick={handleSync} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Data
            </Button>
          )}
          <Button
            variant={isConnected ? "destructive" : "default"}
            onClick={isConnected ? () => setIsConnected(false) : handleConnect}
            disabled={connecting}
          >
            {isConnected ? (
              <>
                <Unlink className="mr-2 h-4 w-4" />
                Disconnect
              </>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                {connecting ? 'Connecting...' : 'Connect Patreon'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Connection Progress */}
      {(connecting || syncProgress > 0) && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {connecting ? 'Connecting to Patreon...' : 'Syncing data...'}
                </span>
                <span className="text-sm text-muted-foreground">{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Patrons</p>
                <p className="text-2xl font-bold">{stats.activePatrons}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Coins className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Coins Granted</p>
                <p className="text-2xl font-bold">{stats.totalCoins.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Pledge</p>
                <p className="text-2xl font-bold">${stats.avgPledge.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={isConnected ? "patrons" : "settings"} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="patrons">Patrons</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="patrons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Patreon Supporters
              </CardTitle>
              <CardDescription>
                Manage your Patreon supporters and their rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supporter</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Pledge</TableHead>
                    <TableHead>Coins</TableHead>
                    <TableHead>Streak</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patreonUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={user.avatar_url} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium flex items-center">
                              {user.name} {getTierBadge(user.tier_name)}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "default" : "secondary"}>
                          {user.tier_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">${user.pledge_amount}/month</p>
                          <p className="text-xs text-muted-foreground">
                            ${user.total_lifetime_support} total
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.coins_granted.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            +{user.monthly_coins}/month
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-sm">{user.streak_months}m</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "default" : "secondary"}>
                          {user.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => giftCoins(user.user_id, 100)}
                          >
                            <Gift className="h-3 w-3 mr-1" />
                            Gift
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5" />
                Patreon Tiers Configuration
              </CardTitle>
              <CardDescription>
                Configure tier rewards and coin allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patreonTiers.map((tier) => (
                  <Card key={tier.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                          <span className="mr-2">{tier.special_badge}</span>
                          {tier.name}
                        </CardTitle>
                        <Switch checked={tier.is_active} />
                      </div>
                      <CardDescription>
                        ${tier.amount_cents / 100}/month
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Monthly Coins:</span>
                          <Badge variant="secondary">{tier.monthly_coins}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Premium Access:</span>
                          {tier.premium_access ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-medium">Perks:</span>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {tier.perks.map((perk, index) => (
                              <li key={index}>• {perk}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Webhook className="mr-2 h-5 w-5" />
                Webhook Events
              </CardTitle>
              <CardDescription>
                Monitor Patreon webhook events and their processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {webhook.event_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{webhook.user_email}</TableCell>
                      <TableCell>${webhook.pledge_amount}</TableCell>
                      <TableCell>{webhook.tier_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(webhook.status)}
                          <span className="text-sm">{webhook.status}</span>
                          {webhook.retry_count > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {webhook.retry_count} retries
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(webhook.processed_at).toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Patreon API credentials and webhook settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="client_id">Client ID</Label>
                  <Input
                    id="client_id"
                    type="password"
                    value={settings.client_id}
                    onChange={(e) => setSettings(prev => ({ ...prev, client_id: e.target.value }))}
                    placeholder="Your Patreon app client ID"
                  />
                </div>
                <div>
                  <Label htmlFor="client_secret">Client Secret</Label>
                  <Input
                    id="client_secret"
                    type="password"
                    value={settings.client_secret}
                    onChange={(e) => setSettings(prev => ({ ...prev, client_secret: e.target.value }))}
                    placeholder="Your Patreon app client secret"
                  />
                </div>
                <div>
                  <Label htmlFor="webhook_secret">Webhook Secret</Label>
                  <Input
                    id="webhook_secret"
                    type="password"
                    value={settings.webhook_secret}
                    onChange={(e) => setSettings(prev => ({ ...prev, webhook_secret: e.target.value }))}
                    placeholder="Webhook verification secret"
                  />
                </div>
                <div>
                  <Label htmlFor="webhook_url">Webhook URL</Label>
                  <Input
                    id="webhook_url"
                    value={settings.webhook_url}
                    onChange={(e) => setSettings(prev => ({ ...prev, webhook_url: e.target.value }))}
                    placeholder="https://your-domain.com/api/patreon/webhook"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>
                  Configure automatic rewards and sync behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Coin Top-up</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically grant monthly coins to patrons
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_coin_topup}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_coin_topup: checked }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="coin_multiplier">Coin Multiplier</Label>
                  <Input
                    id="coin_multiplier"
                    type="number"
                    value={settings.coin_multiplier}
                    onChange={(e) => setSettings(prev => ({ ...prev, coin_multiplier: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Coins per dollar pledged (base rate)
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Premium Auto-upgrade</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically upgrade eligible patrons to premium
                    </p>
                  </div>
                  <Switch
                    checked={settings.premium_auto_upgrade}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, premium_auto_upgrade: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Display Badges</Label>
                    <p className="text-sm text-muted-foreground">
                      Show Patreon badges in comments and profiles
                    </p>
                  </div>
                  <Switch
                    checked={settings.badge_display}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, badge_display: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Customize messages sent to Patreon supporters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="welcome_message">Welcome Message</Label>
                <Textarea
                  id="welcome_message"
                  value={settings.welcome_message}
                  onChange={(e) => setSettings(prev => ({ ...prev, welcome_message: e.target.value }))}
                  placeholder="Message sent to new patrons"
                />
              </div>
              <div>
                <Label htmlFor="thank_you_message">Monthly Thank You</Label>
                <Textarea
                  id="thank_you_message"
                  value={settings.thank_you_message}
                  onChange={(e) => setSettings(prev => ({ ...prev, thank_you_message: e.target.value }))}
                  placeholder="Message sent with monthly coin grants"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPatreonIntegration;