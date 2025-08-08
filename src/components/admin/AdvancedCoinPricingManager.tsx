import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, AlertTriangle, DollarSign, Globe, Users, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/utils/DatabaseCompatibility';

interface CoinPricingRule {
  id: string;
  user_group: string;
  region: string;
  coin_amount: number;
  price_usd: number;
  currency: string;
  promo_code?: string;
  active: boolean;
  priority: number;
  created_at: string;
}

interface SiteSettings {
  default_coin_price: number;
  currency: string;
}

export const AdvancedCoinPricingManager = () => {
  const [rules, setRules] = useState<CoinPricingRule[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({ default_coin_price: 0.01, currency: 'USD' });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<CoinPricingRule | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    user_group: 'all',
    region: 'global',
    coin_amount: 100,
    price_usd: 1.0,
    currency: 'USD',
    promo_code: '',
    active: true,
    priority: 1
  });

  const userGroups = [
    { value: 'all', label: 'All Users' },
    { value: 'guest', label: 'Guest Users' },
    { value: 'free', label: 'Free Users' },
    { value: 'premium', label: 'Premium Users' },
    { value: 'patreon', label: 'Patreon Users' }
  ];

  const regions = [
    { value: 'global', label: 'Global' },
    { value: 'US', label: 'United States' },
    { value: 'EU', label: 'European Union' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'JP', label: 'Japan' },
    { value: 'OTHER', label: 'Other Regions' }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load pricing rules
      const rulesData = await db.query(
        'SELECT * FROM coin_pricing_rules ORDER BY priority ASC, created_at DESC',
        []
      );
      setRules(rulesData || []);

      // Load site settings
      const settingsData = await db.query(
        'SELECT default_coin_price, currency FROM site_settings LIMIT 1',
        []
      );
      
      if (settingsData && settingsData.length > 0) {
        setSettings({
          default_coin_price: settingsData[0].default_coin_price || 0.01,
          currency: settingsData[0].currency || 'USD'
        });
      }
    } catch (error) {
      console.error('Error loading pricing data:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing rules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateRule = (rule: typeof formData): string[] => {
    const conflicts: string[] = [];
    
    // Check for overlapping rules
    const overlapping = rules.filter(r => 
      r.id !== editingRule?.id &&
      r.user_group === rule.user_group &&
      r.region === rule.region &&
      r.coin_amount === rule.coin_amount &&
      r.active
    );

    if (overlapping.length > 0) {
      conflicts.push(`Overlapping rule exists for ${rule.user_group} users in ${rule.region} for ${rule.coin_amount} coins`);
    }

    // Check promo code uniqueness
    if (rule.promo_code) {
      const existingPromo = rules.find(r => 
        r.id !== editingRule?.id &&
        r.promo_code === rule.promo_code &&
        r.active
      );
      if (existingPromo) {
        conflicts.push(`Promo code "${rule.promo_code}" is already in use`);
      }
    }

    return conflicts;
  };

  const handleSaveRule = async () => {
    try {
      const conflicts = validateRule(formData);
      if (conflicts.length > 0) {
        toast({
          title: "Validation Error",
          description: conflicts.join('. '),
          variant: "destructive",
        });
        return;
      }

      if (editingRule) {
        // Update existing rule
        await db.query(
          `UPDATE coin_pricing_rules SET 
           user_group = ?, region = ?, coin_amount = ?, price_usd = ?, 
           currency = ?, promo_code = ?, active = ?, priority = ?
           WHERE id = ?`,
          [
            formData.user_group,
            formData.region,
            formData.coin_amount,
            formData.price_usd,
            formData.currency,
            formData.promo_code || null,
            formData.active,
            formData.priority,
            editingRule.id
          ]
        );
      } else {
        // Create new rule
        await db.query(
          `INSERT INTO coin_pricing_rules 
           (user_group, region, coin_amount, price_usd, currency, promo_code, active, priority)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            formData.user_group,
            formData.region,
            formData.coin_amount,
            formData.price_usd,
            formData.currency,
            formData.promo_code || null,
            formData.active,
            formData.priority
          ]
        );
      }

      toast({
        title: "Success",
        description: `Pricing rule ${editingRule ? 'updated' : 'created'} successfully`,
      });

      setShowForm(false);
      setEditingRule(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast({
        title: "Error",
        description: "Failed to save pricing rule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await db.query(
        'DELETE FROM coin_pricing_rules WHERE id = ?',
        [ruleId]
      );
      
      toast({
        title: "Success",
        description: "Pricing rule deleted successfully",
      });
      
      loadData();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete pricing rule",
        variant: "destructive",
      });
    }
  };

  const toggleRuleStatus = async (rule: CoinPricingRule) => {
    try {
      await db.query(
        'UPDATE coin_pricing_rules SET active = ? WHERE id = ?',
        [!rule.active, rule.id]
      );
      
      toast({
        title: "Success",
        description: `Rule ${!rule.active ? 'activated' : 'deactivated'}`,
      });
      
      loadData();
    } catch (error) {
      console.error('Error toggling rule status:', error);
      toast({
        title: "Error",
        description: "Failed to update rule status",
        variant: "destructive",
      });
    }
  };

  const updateDefaultPrice = async () => {
    try {
      await db.query(
        'UPDATE site_settings SET default_coin_price = ?, currency = ?',
        [settings.default_coin_price, settings.currency]
      );
      
      toast({
        title: "Success",
        description: "Default pricing updated successfully",
      });
    } catch (error) {
      console.error('Error updating default price:', error);
      toast({
        title: "Error",
        description: "Failed to update default pricing",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      user_group: 'all',
      region: 'global',
      coin_amount: 100,
      price_usd: 1.0,
      currency: 'USD',
      promo_code: '',
      active: true,
      priority: 1
    });
  };

  const startEdit = (rule: CoinPricingRule) => {
    setEditingRule(rule);
    setFormData({
      user_group: rule.user_group,
      region: rule.region,
      coin_amount: rule.coin_amount,
      price_usd: rule.price_usd,
      currency: rule.currency,
      promo_code: rule.promo_code || '',
      active: rule.active,
      priority: rule.priority
    });
    setShowForm(true);
  };

  if (isLoading) {
    return <div>Loading pricing rules...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Coin Pricing</h2>
          <p className="text-muted-foreground">
            Manage dynamic pricing rules for different user groups and regions
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pricing Rule
        </Button>
      </div>

      {/* Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Default Pricing Settings
          </CardTitle>
          <CardDescription>
            Fallback pricing when no specific rules apply
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Price per Coin</Label>
              <Input
                type="number"
                step="0.001"
                value={settings.default_coin_price}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  default_coin_price: parseFloat(e.target.value) || 0
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={updateDefaultPrice} variant="outline">
            Update Default Settings
          </Button>
        </CardContent>
      </Card>

      {/* Pricing Rules List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Pricing Rules
          </CardTitle>
          <CardDescription>
            Dynamic pricing rules ordered by priority
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pricing rules configured. Using default pricing for all users.
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={rule.active ? "default" : "secondary"}>
                        Priority {rule.priority}
                      </Badge>
                      <span className="font-medium">
                        {rule.coin_amount} coins = ${rule.price_usd} {rule.currency}
                      </span>
                      {rule.promo_code && (
                        <Badge variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {rule.promo_code}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.active}
                        onCheckedChange={() => toggleRuleStatus(rule)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {userGroups.find(g => g.value === rule.user_group)?.label || rule.user_group}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {regions.find(r => r.value === rule.region)?.label || rule.region}
                    </div>
                    <div>
                      Rate: ${(rule.price_usd / rule.coin_amount).toFixed(4)} per coin
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rule Form Modal */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingRule ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
            </CardTitle>
            <CardDescription>
              Define specific pricing for user groups and regions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>User Group</Label>
                <Select
                  value={formData.user_group}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, user_group: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {userGroups.map(group => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Region</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Coin Amount</Label>
                <Input
                  type="number"
                  value={formData.coin_amount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    coin_amount: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price_usd}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price_usd: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    priority: parseInt(e.target.value) || 1 
                  }))}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Promo Code (Optional)</Label>
                <Input
                  value={formData.promo_code}
                  placeholder="e.g., NEWUSER50"
                  onChange={(e) => setFormData(prev => ({ ...prev, promo_code: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2 col-span-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label>Active Rule</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveRule}>
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setEditingRule(null);
                  resetForm();
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