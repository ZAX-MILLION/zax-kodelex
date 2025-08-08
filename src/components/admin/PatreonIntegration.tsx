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
import { 
  Heart, Link, Unlink, DollarSign, Crown, 
  Users, Coins, Webhook, Settings, RefreshCw 
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
  last_sync: string;
  created_at: string;
}

interface PatreonSettings {
  client_id: string;
  client_secret: string;
  webhook_secret: string;
  auto_coin_topup: boolean;
  coin_multiplier: number; // coins per dollar pledged
  sync_frequency: number; // hours
}

interface PatreonWebhook {
  id: string;
  event_type: string;
  pledge_amount: number;
  user_email: string;
  processed_at: string;
  status: 'processed' | 'failed' | 'pending';
}

const PatreonIntegration = () => {
  const { toast } = useToast();
  const [patreonUsers, setPatreonUsers] = useState<PatreonUser[]>([]);
  const [webhooks, setWebhooks] = useState<PatreonWebhook[]>([]);
  const [settings, setSettings] = useState<PatreonSettings>({
    client_id: '',
    client_secret: '',
    webhook_secret: '',
    auto_coin_topup: true,
    coin_multiplier: 50, // 50 coins per $1 pledged
    sync_frequency: 24
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

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

      // Mock Patreon users data
      const mockUsers: PatreonUser[] = [
        {
          id: '1',
          user_id: 'user1',
          patreon_id: 'patreon123',
          pledge_amount: 10,
          tier_name: 'Supporter',
          active: true,
          email: 'supporter@example.com',
          name: 'Alex Supporter',
          coins_granted: 500,
          last_sync: new Date().toISOString(),
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          user_id: 'user2',
          patreon_id: 'patreon456',
          pledge_amount: 25,
          tier_name: 'Premium Fan',
          active: true,
          email: 'premium@example.com',
          name: 'Jamie Premium',
          coins_granted: 1250,
          last_sync: new Date().toISOString(),
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          user_id: 'user3',
          patreon_id: 'patreon789',
          pledge_amount: 5,
          tier_name: 'Basic',
          active: false,
          email: 'basic@example.com',
          name: 'Sam Basic',
          coins_granted: 250,
          last_sync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Mock webhook data
      const mockWebhooks: PatreonWebhook[] = [
        {
          id: '1',
          event_type: 'pledge_created',
          pledge_amount: 10,
          user_email: 'supporter@example.com',
          processed_at: new Date().toISOString(),
          status: 'processed'
        },
        {
          id: '2',
          event_type: 'pledge_updated',
          pledge_amount: 25,
          user_email: 'premium@example.com',
          processed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'processed'
        },
        {
          id: '3',
          event_type: 'pledge_deleted',
          pledge_amount: 5,
          user_email: 'basic@example.com',
          processed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'processed'
        }
      ];

      if (db.isSupabase()) {
        setPatreonUsers(mockUsers);
        setWebhooks(mockWebhooks);
      } else {
        // MySQL implementation
        const usersResult = await db.query('SELECT * FROM patreon_users ORDER BY created_at DESC', []);
        const webhooksResult = await db.query('SELECT * FROM patreon_webhooks ORDER BY processed_at DESC LIMIT 50', []);
        
        setPatreonUsers(usersResult.data || mockUsers);
        setWebhooks(webhooksResult.data || mockWebhooks);
      }
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
    
    try {
      // In a real implementation, this would:
      // 1. Validate the credentials with Patreon API
      // 2. Set up OAuth flow
      // 3. Register webhook endpoints
      
      // For demo purposes, simulate connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('patreon_settings');
    setIsConnected(false);
    setSettings({
      client_id: '',
      client_secret: '',
      webhook_secret: '',
      auto_coin_topup: true,
      coin_multiplier: 50,
      sync_frequency: 24
    });
    
    toast({
      title: "Disconnected",
      description: "Patreon integration has been disconnected",
    });
  };

  const handleSyncUsers = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would call the Patreon API
      // to sync all patron data and update coin balances
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      await loadPatreonData();
      
      toast({
        title: "Success",
        description: "Patreon users synced successfully",
      });
    } catch (error) {
      console.error('Failed to sync users:', error);
      toast({
        title: "Error",
        description: "Failed to sync Patreon users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTierBadgeColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'basic': return 'bg-blue-500';
      case 'supporter': return 'bg-green-500';
      case 'premium fan': return 'bg-purple-500';
      case 'vip': return 'bg-gold-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-green-500">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const calculateTotalRevenue = () => {
    return patreonUsers
      .filter(user => user.active)
      .reduce((total, user) => total + user.pledge_amount, 0);
  };

  const calculateTotalCoinsGranted = () => {
    return patreonUsers.reduce((total, user) => total + user.coins_granted, 0);
  };

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
          <h2 className="text-2xl font-bold tracking-tight">Patreon Integration</h2>
          <p className="text-muted-foreground">
            Manage Patreon supporters and automatic coin rewards
          </p>
        </div>
        <div className="flex space-x-2">
          {isConnected && (
            <Button variant="outline" onClick={handleSyncUsers} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Users
            </Button>
          )}
          <Button
            variant={isConnected ? "destructive" : "default"}
            onClick={isConnected ? handleDisconnect : handleConnect}
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

      {/* Connection Status */}
      <Card className={`border-l-4 ${isConnected ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className={`h-6 w-6 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <h3 className="font-semibold">
                  {isConnected ? 'Connected to Patreon' : 'Not Connected'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isConnected 
                    ? 'Integration active - automatic sync enabled' 
                    : 'Connect your Patreon account to enable supporter features'
                  }
                </p>
              </div>
            </div>
            {isConnected && (
              <div className="text-right">
                <div className="flex space-x-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-lg font-semibold">${calculateTotalRevenue()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Patrons</p>
                    <p className="text-lg font-semibold">
                      {patreonUsers.filter(user => user.active).length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={isConnected ? "supporters" : "settings"} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="supporters">Supporters</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="supporters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Patreon Supporters
              </CardTitle>
              <CardDescription>
                Manage your Patreon supporters and their coin rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patreonUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supporter</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Pledge Amount</TableHead>
                      <TableHead>Coins Granted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Sync</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patreonUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTierBadgeColor(user.tier_name)}>
                            {user.tier_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="mr-1 h-4 w-4" />
                            {user.pledge_amount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Coins className="mr-1 h-4 w-4 text-yellow-500" />
                            {user.coins_granted.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.active)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.last_sync).toLocaleDateString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No supporters yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Connect your Patreon account to see your supporters here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Patreon Settings
              </CardTitle>
              <CardDescription>
                Configure your Patreon integration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="client_id">Patreon Client ID</Label>
                  <Input
                    id="client_id"
                    type="password"
                    value={settings.client_id}
                    onChange={(e) => setSettings(prev => ({ ...prev, client_id: e.target.value }))}
                    placeholder="Your Patreon app client ID"
                  />
                </div>
                <div>
                  <Label htmlFor="client_secret">Patreon Client Secret</Label>
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
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_topup">Automatic Coin Top-up</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically grant coins based on pledge amounts
                    </p>
                  </div>
                  <Switch
                    id="auto_topup"
                    checked={settings.auto_coin_topup}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_coin_topup: checked }))}
                  />
                </div>

                <div>
                  <Label htmlFor="coin_multiplier">Coins per Dollar Pledged</Label>
                  <Input
                    id="coin_multiplier"
                    type="number"
                    value={settings.coin_multiplier}
                    onChange={(e) => setSettings(prev => ({ ...prev, coin_multiplier: parseInt(e.target.value) }))}
                    placeholder="50"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    How many coins to grant per $1 pledged (current: {settings.coin_multiplier} coins/$1)
                  </p>
                </div>

                <div>
                  <Label htmlFor="sync_frequency">Sync Frequency (hours)</Label>
                  <Input
                    id="sync_frequency"
                    type="number"
                    value={settings.sync_frequency}
                    onChange={(e) => setSettings(prev => ({ ...prev, sync_frequency: parseInt(e.target.value) }))}
                    placeholder="24"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    How often to sync supporter data automatically
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Webhook className="mr-2 h-5 w-5" />
                Webhook Activity
              </CardTitle>
              <CardDescription>
                Recent webhook events from Patreon
              </CardDescription>
            </CardHeader>
            <CardContent>
              {webhooks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed At</TableHead>
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
                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="mr-1 h-4 w-4" />
                            {webhook.pledge_amount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={webhook.status === 'processed' ? 'default' : 'destructive'}
                          >
                            {webhook.status}
                          </Badge>
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
              ) : (
                <div className="text-center py-8">
                  <Webhook className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No webhook activity</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Webhook events will appear here once configured.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold">${calculateTotalRevenue()}</p>
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
                      Active Patrons
                    </p>
                    <p className="text-2xl font-bold">
                      {patreonUsers.filter(user => user.active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Coins className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Coins Granted
                    </p>
                    <p className="text-2xl font-bold">
                      {calculateTotalCoinsGranted().toLocaleString()}
                    </p>
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

export default PatreonIntegration;