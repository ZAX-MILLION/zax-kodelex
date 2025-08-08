import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Save, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface PatreonTier {
  id: string;
  name: string;
  monthly_coins: number;
  tier_id: string;
  is_active: boolean;
}

const PatreonCoinRulesManager = () => {
  const [tiers, setTiers] = useState<PatreonTier[]>([
    {
      id: '1',
      name: 'Bronze Supporter',
      monthly_coins: 100,
      tier_id: 'tier_001',
      is_active: true
    },
    {
      id: '2', 
      name: 'Silver Supporter',
      monthly_coins: 250,
      tier_id: 'tier_002',
      is_active: true
    },
    {
      id: '3',
      name: 'Gold Supporter', 
      monthly_coins: 500,
      tier_id: 'tier_003',
      is_active: true
    }
  ]);
  const [newTier, setNewTier] = useState({ name: '', monthly_coins: 0, tier_id: '' });
  const [isEnabled, setIsEnabled] = useState(true);
  const { toast } = useToast();

  const addTier = () => {
    if (!newTier.name || !newTier.tier_id || newTier.monthly_coins <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill all fields with valid values",
        variant: "destructive"
      });
      return;
    }

    const tier: PatreonTier = {
      id: Date.now().toString(),
      name: newTier.name,
      monthly_coins: newTier.monthly_coins,
      tier_id: newTier.tier_id,
      is_active: true
    };

    setTiers([...tiers, tier]);
    setNewTier({ name: '', monthly_coins: 0, tier_id: '' });
    
    toast({
      title: "Tier Added",
      description: `${tier.name} tier configured successfully`
    });
  };

  const removeTier = (id: string) => {
    setTiers(tiers.filter(tier => tier.id !== id));
    toast({
      title: "Tier Removed",
      description: "Patreon tier removed successfully"
    });
  };

  const updateTier = (id: string, field: keyof PatreonTier, value: any) => {
    setTiers(tiers.map(tier => 
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
  };

  const saveConfiguration = () => {
    // Simulate API call
    toast({
      title: "Configuration Saved",
      description: `${tiers.length} Patreon tier rules saved successfully`
    });
  };

  const toggleGlobalPatreon = () => {
    setIsEnabled(!isEnabled);
    toast({
      title: isEnabled ? "Patreon Disabled" : "Patreon Enabled",
      description: isEnabled 
        ? "Patreon integration has been disabled" 
        : "Patreon integration has been enabled"
    });
  };

  return (
    <div className="space-y-6">
      {/* Global Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Patreon Integration
              </CardTitle>
              <CardDescription>
                Enable or disable Patreon coin rewards globally
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="patreon-toggle">Enable Patreon</Label>
              <Switch
                id="patreon-toggle"
                checked={isEnabled}
                onCheckedChange={toggleGlobalPatreon}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tier Management */}
      <Card className={!isEnabled ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle>Patreon Tier → Coin Rules</CardTitle>
          <CardDescription>
            Configure monthly coin rewards for each Patreon tier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Tiers */}
          <div className="space-y-3">
            {tiers.map((tier) => (
              <div key={tier.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tier Name</Label>
                    <Input
                      value={tier.name}
                      onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                      placeholder="Tier name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Patreon Tier ID</Label>
                    <Input
                      value={tier.tier_id}
                      onChange={(e) => updateTier(tier.id, 'tier_id', e.target.value)}
                      placeholder="tier_123"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Monthly Coins</Label>
                    <Input
                      type="number"
                      value={tier.monthly_coins}
                      onChange={(e) => updateTier(tier.id, 'monthly_coins', parseInt(e.target.value) || 0)}
                      placeholder="100"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={tier.is_active}
                    onCheckedChange={(checked) => updateTier(tier.id, 'is_active', checked)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTier(tier.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Tier */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Add New Tier</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Tier Name</Label>
                <Input
                  value={newTier.name}
                  onChange={(e) => setNewTier({...newTier, name: e.target.value})}
                  placeholder="Premium Supporter"
                />
              </div>
              <div>
                <Label>Patreon Tier ID</Label>
                <Input
                  value={newTier.tier_id}
                  onChange={(e) => setNewTier({...newTier, tier_id: e.target.value})}
                  placeholder="tier_004"
                />
              </div>
              <div>
                <Label>Monthly Coins</Label>
                <Input
                  type="number"
                  value={newTier.monthly_coins || ''}
                  onChange={(e) => setNewTier({...newTier, monthly_coins: parseInt(e.target.value) || 0})}
                  placeholder="750"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={addTier} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Tier
              </Button>
              <Button onClick={saveConfiguration} variant="outline" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save All Changes
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Total Active Tiers:</span>
              <Badge>{tiers.filter(t => t.is_active).length}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span>Total Monthly Coins Available:</span>
              <Badge variant="outline">
                {tiers.filter(t => t.is_active).reduce((sum, t) => sum + t.monthly_coins, 0)} coins
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatreonCoinRulesManager;
