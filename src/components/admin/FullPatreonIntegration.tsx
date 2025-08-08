import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Settings, Users, DollarSign, Webhook, Crown, Heart, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/utils/DatabaseCompatibility';

interface PatreonSettings {
  client_id?: string;
  client_secret?: string;
  webhook_secret?: string;
  redirect_uri: string;
  enabled: boolean;
  test_mode: boolean;
}

interface PatreonTier {
  id: string;
  name: string;
  pledge_amount: number;
  reward_coins: number;
  premium_access: boolean;
  active: boolean;
}

interface PatreonUser {
  id: string;
  user_id: string;
  patreon_id: string;
  tier_name: string;
  pledge_amount: number;
  reward_coins: number;
  active: boolean;
  synced_at: string;
  user_email?: string;
}

export const FullPatreonIntegration = () => {
  const [settings, setSettings] = useState<PatreonSettings>({
    redirect_uri: `${window.location.origin}/auth/patreon/callback`,
    enabled: false,
    test_mode: true
  });
  const [tiers, setTiers] = useState<PatreonTier[]>([]);
  const [users, setUsers] = useState<PatreonUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTierForm, setShowTierForm] = useState(false);
  const [editingTier, setEditingTier] = useState<PatreonTier | null>(null);
  const { toast } = useToast();

  const [tierForm, setTierForm] = useState({
    name: '',
    pledge_amount: 0,
    reward_coins: 0,
    premium_access: false,
    active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load Patreon settings
      const settingsData = await db.query(
        'SELECT patreon_client_id, patreon_client_secret, patreon_webhook_secret, patreon_enabled, patreon_test_mode FROM site_settings LIMIT 1',
        []
      );

      if (settingsData && settingsData.length > 0) {
        const data = settingsData[0];
        setSettings(prev => ({
          ...prev,
          client_id: data.patreon_client_id || '',
          client_secret: data.patreon_client_secret || '',
          webhook_secret: data.patreon_webhook_secret || '',
          enabled: data.patreon_enabled || false,
          test_mode: data.patreon_test_mode || true
        }));
      }

      // Load Patreon tiers
      const tiersData = await db.query(
        'SELECT * FROM patreon_tiers ORDER BY pledge_amount ASC',
        []
      );
      setTiers(tiersData || []);

      // Load Patreon users
      const usersQuery = `
        SELECT pu.*, u.email as user_email 
        FROM patreon_users pu 
        LEFT JOIN users u ON pu.user_id = u.id 
        ORDER BY pu.pledge_amount DESC, pu.synced_at DESC
      `;
      const usersData = await db.query(usersQuery, []);
      setUsers(usersData || []);

    } catch (error) {
      console.error('Error loading Patreon data:', error);
      toast({
        title: "Error",
        description: "Failed to load Patreon settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async () => {
    try {
      await db.query(
        'UPDATE site_settings SET patreon_client_id = ?, patreon_client_secret = ?, patreon_webhook_secret = ?, patreon_enabled = ?, patreon_test_mode = ?',
        [settings.client_id, settings.client_secret, settings.webhook_secret, settings.enabled, settings.test_mode]
      );

      toast({
        title: "Success",
        description: "Patreon settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update Patreon settings",
        variant: "destructive",
      });
    }
  };

  const handleSaveTier = async () => {
    try {
      if (editingTier) {
        await db.query(
          'UPDATE patreon_tiers SET name = ?, pledge_amount = ?, reward_coins = ?, premium_access = ?, active = ? WHERE id = ?',
          [tierForm.name, tierForm.pledge_amount, tierForm.reward_coins, tierForm.premium_access, tierForm.active, editingTier.id]
        );
      } else {
        await db.query(
          'INSERT INTO patreon_tiers (name, pledge_amount, reward_coins, premium_access, active) VALUES (?, ?, ?, ?, ?)',
          [tierForm.name, tierForm.pledge_amount, tierForm.reward_coins, tierForm.premium_access, tierForm.active]
        );
      }

      toast({
        title: "Success",
        description: `Tier ${editingTier ? 'updated' : 'created'} successfully`,
      });

      setShowTierForm(false);
      setEditingTier(null);
      resetTierForm();
      loadData();
    } catch (error) {
      console.error('Error saving tier:', error);
      toast({
        title: "Error",
        description: "Failed to save tier",
        variant: "destructive",
      });
    }
  };

  const deleteTier = async (tierId: string) => {
    try {
      await db.query('DELETE FROM patreon_tiers WHERE id = ?', [tierId]);
      toast({
        title: "Success",
        description: "Tier deleted successfully",
      });
      loadData();
    } catch (error) {
      console.error('Error deleting tier:', error);
      toast({
        title: "Error",
        description: "Failed to delete tier",
        variant: "destructive",
      });
    }
  };

  const syncPatreonUser = async (userId: string) => {
    try {
      // Simulate Patreon API sync
      await db.query(
        'UPDATE patreon_users SET synced_at = ? WHERE id = ?',
        [new Date().toISOString(), userId]
      );

      toast({
        title: "Success",
        description: "User synced with Patreon",
      });
      loadData();
    } catch (error) {
      console.error('Error syncing user:', error);
      toast({
        title: "Error",
        description: "Failed to sync user",
        variant: "destructive",
      });
    }
  };

  const simulatePatreonHook = async () => {
    try {
      // Simulate webhook event
      const testUser = {
        patreon_id: 'test_patron_' + Date.now(),
        tier_name: 'Premium Supporter',
        pledge_amount: 10,
        reward_coins: 500
      };

      await db.query(
        'INSERT INTO patreon_users (user_id, patreon_id, tier_name, pledge_amount, reward_coins, active, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['user_123', testUser.patreon_id, testUser.tier_name, testUser.pledge_amount, testUser.reward_coins, true, new Date().toISOString()]
      );

      toast({
        title: "Success",
        description: "Test Patreon webhook simulated",
      });
      loadData();
    } catch (error) {
      console.error('Error simulating webhook:', error);
      toast({
        title: "Error",
        description: "Failed to simulate webhook",
        variant: "destructive",
      });
    }
  };

  const resetTierForm = () => {
    setTierForm({
      name: '',
      pledge_amount: 0,
      reward_coins: 0,
      premium_access: false,
      active: true
    });
  };

  const startEditTier = (tier: PatreonTier) => {
    setEditingTier(tier);
    setTierForm({
      name: tier.name,
      pledge_amount: tier.pledge_amount,
      reward_coins: tier.reward_coins,
      premium_access: tier.premium_access,
      active: tier.active
    });
    setShowTierForm(true);
  };

  const generateOAuthUrl = () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: settings.client_id || '',
      redirect_uri: settings.redirect_uri,
      scope: 'identity campaigns pledges-to-me my-campaign'
    });
    return `https://www.patreon.com/oauth2/authorize?${params.toString()}`;
  };

  if (isLoading) {
    return <div>Loading Patreon settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Patreon Integration</h2>
          <p className="text-muted-foreground">
            Connect your Patreon account and manage supporter benefits
          </p>
        </div>
        <Badge variant={settings.enabled ? "default" : "secondary"} className="gap-2">
          <Heart className="h-4 w-4" />
          {settings.enabled ? 'Active' : 'Disabled'}
        </Badge>
      </div>

      {/* OAuth Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            OAuth2 Configuration
          </CardTitle>
          <CardDescription>
            Set up your Patreon OAuth application credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client ID</Label>
              <Input
                type="password"
                value={settings.client_id || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, client_id: e.target.value }))}
                placeholder="Your Patreon Client ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Client Secret</Label>
              <Input
                type="password"
                value={settings.client_secret || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, client_secret: e.target.value }))}
                placeholder="Your Patreon Client Secret"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Webhook Secret</Label>
              <Input
                type="password"
                value={settings.webhook_secret || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, webhook_secret: e.target.value }))}
                placeholder="Webhook Secret for validation"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Redirect URI</Label>
              <Input
                value={settings.redirect_uri}
                onChange={(e) => setSettings(prev => ({ ...prev, redirect_uri: e.target.value }))}
                placeholder="OAuth redirect URI"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
                />
                <Label>Enable Patreon Integration</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.test_mode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, test_mode: checked }))}
                />
                <Label>Test Mode</Label>
              </div>
            </div>
            <Button onClick={updateSettings}>Save Settings</Button>
          </div>

          {settings.client_id && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Authorization URL:</p>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                  {generateOAuthUrl()}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(generateOAuthUrl(), '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Patreon Tiers
          </CardTitle>
          <CardDescription>
            Configure reward tiers and coin bonuses for your patrons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {tiers.length} tier(s) configured
            </p>
            <Button onClick={() => setShowTierForm(true)} size="sm">
              Add Tier
            </Button>
          </div>

          {tiers.length > 0 ? (
            <div className="space-y-3">
              {tiers.map((tier) => (
                <div key={tier.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{tier.name}</h4>
                        <Badge variant={tier.active ? "default" : "secondary"}>
                          {tier.active ? 'Active' : 'Inactive'}
                        </Badge>
                        {tier.premium_access && (
                          <Badge variant="outline">Premium Access</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${tier.pledge_amount}/month → {tier.reward_coins} coins
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEditTier(tier)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteTier(tier.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No tiers configured. Add your first Patreon tier to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patreon Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connected Patrons
          </CardTitle>
          <CardDescription>
            Manage users who have connected their Patreon accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {user.user_email || `User ${user.user_id}`}
                        </span>
                        <Badge variant={user.active ? "default" : "secondary"}>
                          {user.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.tier_name} • ${user.pledge_amount}/month • {user.reward_coins} coins
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last synced: {new Date(user.synced_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => syncPatreonUser(user.id)}>
                      Sync
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No patrons connected yet. Share your Patreon connect link with supporters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Developer Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Developer Tools
          </CardTitle>
          <CardDescription>
            Test Patreon integration and simulate webhooks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={simulatePatreonHook}>
              <Gift className="h-4 w-4 mr-2" />
              Simulate Webhook
            </Button>
            <Button variant="outline" onClick={loadData}>
              Refresh Data
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Webhook endpoint: <code>{window.location.origin}/api/patreon/webhook</code></p>
            <p>Events: member:create, member:update, member:delete</p>
          </div>
        </CardContent>
      </Card>

      {/* Tier Form */}
      {showTierForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTier ? 'Edit Tier' : 'Add New Tier'}
            </CardTitle>
            <CardDescription>
              Configure Patreon tier rewards and benefits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier Name</Label>
                <Input
                  value={tierForm.name}
                  onChange={(e) => setTierForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premium Supporter"
                />
              </div>
              <div className="space-y-2">
                <Label>Pledge Amount ($)</Label>
                <Input
                  type="number"
                  value={tierForm.pledge_amount}
                  onChange={(e) => setTierForm(prev => ({ 
                    ...prev, 
                    pledge_amount: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Coin Reward</Label>
                <Input
                  type="number"
                  value={tierForm.reward_coins}
                  onChange={(e) => setTierForm(prev => ({ 
                    ...prev, 
                    reward_coins: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={tierForm.active ? 'active' : 'inactive'}
                  onValueChange={(value) => setTierForm(prev => ({ 
                    ...prev, 
                    active: value === 'active' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={tierForm.premium_access}
                onCheckedChange={(checked) => setTierForm(prev => ({ 
                  ...prev, 
                  premium_access: checked 
                }))}
              />
              <Label>Grant Premium Access</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveTier}>
                {editingTier ? 'Update Tier' : 'Create Tier'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowTierForm(false);
                  setEditingTier(null);
                  resetTierForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};