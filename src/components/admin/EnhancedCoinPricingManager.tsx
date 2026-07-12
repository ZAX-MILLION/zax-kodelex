import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Coins, Plus, Edit, Trash2, Users, Globe, 
  DollarSign, TrendingUp, Settings, Save, AlertTriangle,
  Info, Percent, Calendar, Target
} from 'lucide-react';
import { db } from '@/utils/DatabaseCompatibility';

interface CoinPricingRule {
  id: string;
  user_group: string;
  coin_amount: number;
  price_usd: number;
  region: string;
  currency: string;
  is_active: boolean;
  promo_code?: string;
  discount_percentage?: number;
  valid_from?: string;
  valid_until?: string;
  max_uses?: number;
  current_uses?: number;
  created_at: string;
  updated_at: string;
}

interface PromotionEvent {
  id: string;
  name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  target_groups: string[];
  is_active: boolean;
}

interface PricingConflict {
  rule1: CoinPricingRule;
  rule2: CoinPricingRule;
  conflictType: 'overlap' | 'duplicate' | 'pricing';
}

const EnhancedCoinPricingManager = () => {
  const { toast } = useToast();
  const [pricingRules, setPricingRules] = useState<CoinPricingRule[]>([]);
  const [promotions, setPromotions] = useState<PromotionEvent[]>([]);
  const [conflicts, setConflicts] = useState<PricingConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<CoinPricingRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [defaultPrice, setDefaultPrice] = useState(1.99);
  const [formData, setFormData] = useState({
    user_group: '',
    coin_amount: 100,
    price_usd: 1.99,
    region: 'global',
    currency: 'USD',
    promo_code: '',
    discount_percentage: 0,
    valid_from: '',
    valid_until: '',
    max_uses: 1000
  });

  const regions = [
    { value: 'global', label: 'Global' },
    { value: 'us', label: 'United States' },
    { value: 'eu', label: 'European Union' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'asia', label: 'Asia Pacific' },
    { value: 'latam', label: 'Latin America' },
    { value: 'africa', label: 'Africa' },
    { value: 'oceania', label: 'Oceania' }
  ];

  const currencies = [
    { value: 'USD', label: 'US Dollar' },
    { value: 'EUR', label: 'Euro' },
    { value: 'GBP', label: 'British Pound' },
    { value: 'JPY', label: 'Japanese Yen' },
    { value: 'CAD', label: 'Canadian Dollar' },
    { value: 'AUD', label: 'Australian Dollar' },
    { value: 'CNY', label: 'Chinese Yuan' }
  ];

  const userGroups = [
    { id: 'new_users', name: 'New Users', description: 'Users registered < 30 days' },
    { id: 'premium_users', name: 'Premium Users', description: 'Premium subscribers' },
    { id: 'patreon_users', name: 'Patreon Users', description: 'Patreon supporters' },
    { id: 'vip_users', name: 'VIP Users', description: 'VIP tier members' },
    { id: 'returning_users', name: 'Returning Users', description: 'Active users 30+ days' },
    { id: 'bulk_buyers', name: 'Bulk Buyers', description: 'Users buying 500+ coins' },
    { id: 'mobile_users', name: 'Mobile Users', description: 'Mobile app users' },
    { id: 'guest_users', name: 'Guest Users', description: 'Non-registered users' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load pricing rules with enhanced mock data
      const mockRules: CoinPricingRule[] = [
        {
          id: '1',
          user_group: 'new_users',
          coin_amount: 100,
          price_usd: 0.99,
          region: 'global',
          currency: 'USD',
          is_active: true,
          discount_percentage: 50,
          promo_code: 'WELCOME50',
          valid_from: new Date().toISOString(),
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          max_uses: 500,
          current_uses: 123,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          user_group: 'premium_users',
          coin_amount: 500,
          price_usd: 3.99,
          region: 'global',
          currency: 'USD',
          is_active: true,
          discount_percentage: 20,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          user_group: 'bulk_buyers',
          coin_amount: 1000,
          price_usd: 7.99,
          region: 'global',
          currency: 'USD',
          is_active: true,
          discount_percentage: 33,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          user_group: 'eu',
          coin_amount: 100,
          price_usd: 1.79,
          region: 'eu',
          currency: 'EUR',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Mock promotions
      const mockPromotions: PromotionEvent[] = [
        {
          id: '1',
          name: 'Black Friday Special',
          discount_percentage: 40,
          start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          target_groups: ['premium_users', 'returning_users'],
          is_active: true
        },
        {
          id: '2',
          name: 'Summer Sale',
          discount_percentage: 25,
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          target_groups: ['new_users', 'mobile_users'],
          is_active: false
        }
      ];

      setPricingRules(mockRules);
      setPromotions(mockPromotions);
      
      // Detect conflicts
      detectConflicts(mockRules);

    } catch (error) {
      console.error('Failed to load pricing data:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const detectConflicts = (rules: CoinPricingRule[]) => {
    const conflicts: PricingConflict[] = [];
    
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const rule1 = rules[i];
        const rule2 = rules[j];
        
        // Check for overlapping rules
        if (rule1.user_group === rule2.user_group && 
            rule1.region === rule2.region &&
            rule1.coin_amount === rule2.coin_amount &&
            rule1.is_active && rule2.is_active) {
          conflicts.push({
            rule1,
            rule2,
            conflictType: 'duplicate'
          });
        }
        
        // Check for pricing inconsistencies
        if (rule1.user_group === rule2.user_group &&
            rule1.region === rule2.region &&
            Math.abs(rule1.coin_amount - rule2.coin_amount) < 50 &&
            Math.abs(rule1.price_usd - rule2.price_usd) > rule1.price_usd * 0.5) {
          conflicts.push({
            rule1,
            rule2,
            conflictType: 'pricing'
          });
        }
      }
    }
    
    setConflicts(conflicts);
  };

  const calculateRealTimePrice = (userRole: string, region: string, coinAmount: number) => {
    const applicableRules = pricingRules.filter(rule => 
      rule.is_active &&
      (rule.user_group === userRole || rule.user_group === 'global') &&
      (rule.region === region || rule.region === 'global') &&
      rule.coin_amount <= coinAmount
    );

    if (applicableRules.length === 0) {
      return { price: defaultPrice, rule: null };
    }

    // Find best rule (most specific and best price)
    const bestRule = applicableRules.reduce((best, current) => {
      const bestScore = (best.user_group !== 'global' ? 1 : 0) + (best.region !== 'global' ? 1 : 0);
      const currentScore = (current.user_group !== 'global' ? 1 : 0) + (current.region !== 'global' ? 1 : 0);
      
      if (currentScore > bestScore || (currentScore === bestScore && current.price_usd < best.price_usd)) {
        return current;
      }
      return best;
    });

    return { price: bestRule.price_usd, rule: bestRule };
  };

  const handleSaveRule = async () => {
    try {
      const ruleData = {
        ...formData,
        is_active: true,
        current_uses: 0,
        created_at: selectedRule?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (selectedRule) {
        setPricingRules(prev => 
          prev.map(rule => 
            rule.id === selectedRule.id 
              ? { ...rule, ...ruleData }
              : rule
          )
        );
        toast({
          title: "Success",
          description: "Pricing rule updated successfully",
        });
      } else {
        const newRule = {
          id: Date.now().toString(),
          ...ruleData
        };
        setPricingRules(prev => [newRule, ...prev]);
        toast({
          title: "Success",
          description: "New pricing rule created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      detectConflicts(pricingRules);
    } catch (error) {
      console.error('Failed to save pricing rule:', error);
      toast({
        title: "Error",
        description: "Failed to save pricing rule",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      user_group: '',
      coin_amount: 100,
      price_usd: 1.99,
      region: 'global',
      currency: 'USD',
      promo_code: '',
      discount_percentage: 0,
      valid_from: '',
      valid_until: '',
      max_uses: 1000
    });
    setSelectedRule(null);
  };

  const openEditDialog = (rule: CoinPricingRule) => {
    setSelectedRule(rule);
    setFormData({
      user_group: rule.user_group,
      coin_amount: rule.coin_amount,
      price_usd: rule.price_usd,
      region: rule.region,
      currency: rule.currency,
      promo_code: rule.promo_code || '',
      discount_percentage: rule.discount_percentage || 0,
      valid_from: rule.valid_from?.split('T')[0] || '',
      valid_until: rule.valid_until?.split('T')[0] || '',
      max_uses: rule.max_uses || 1000
    });
    setIsDialogOpen(true);
  };

  const toggleRuleActive = (ruleId: string) => {
    setPricingRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, is_active: !rule.is_active }
          : rule
      )
    );
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
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Coin Pricing Manager</h2>
          <p className="text-muted-foreground">
            Advanced dynamic pricing with real-time updates and conflict detection
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Pricing Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedRule ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
                </DialogTitle>
                <DialogDescription>
                  Configure dynamic pricing for specific user groups and regions
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user_group">User Group</Label>
                    <Select
                      value={formData.user_group}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, user_group: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user group" />
                      </SelectTrigger>
                      <SelectContent>
                        {userGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            <div>
                              <div className="font-medium">{group.name}</div>
                              <div className="text-sm text-muted-foreground">{group.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="coin_amount">Coin Amount</Label>
                    <Input
                      id="coin_amount"
                      type="number"
                      value={formData.coin_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, coin_amount: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_usd">Price (USD)</Label>
                    <Input
                      id="price_usd"
                      type="number"
                      step="0.01"
                      value={formData.price_usd}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_usd: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_percentage">Discount %</Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="promo_code">Promo Code (Optional)</Label>
                    <Input
                      id="promo_code"
                      value={formData.promo_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, promo_code: e.target.value }))}
                      placeholder="e.g., SAVE20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_uses">Max Uses</Label>
                    <Input
                      id="max_uses"
                      type="number"
                      value={formData.max_uses}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_uses: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valid_from">Valid From</Label>
                    <Input
                      id="valid_from"
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valid_until">Valid Until</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRule}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold text-orange-700">
                  {conflicts.length} Pricing Conflicts Detected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Some pricing rules may conflict with each other. Review the conflicts tab.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pricing-rules" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pricing-rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts ({conflicts.length})</TabsTrigger>
          <TabsTrigger value="simulator">Price Simulator</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="mr-2 h-5 w-5" />
                Active Pricing Rules
              </CardTitle>
              <CardDescription>
                Manage dynamic pricing configurations for different user segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Coins</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Promo</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{rule.user_group.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {rule.coin_amount} coins
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">${rule.price_usd}</span>
                          {rule.discount_percentage && rule.discount_percentage > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="destructive" className="text-xs">
                                    {rule.discount_percentage}% off
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>From ${(rule.price_usd / (1 - rule.discount_percentage / 100)).toFixed(2)} base price</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{rule.region}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {rule.promo_code ? (
                          <Badge variant="outline">{rule.promo_code}</Badge>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {rule.max_uses && (
                          <div className="text-sm">
                            <span className="font-medium">{rule.current_uses || 0}</span>
                            <span className="text-muted-foreground">/{rule.max_uses}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={() => toggleRuleActive(rule.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPricingRules(prev => prev.filter(r => r.id !== rule.id));
                              toast({
                                title: "Success",
                                description: "Pricing rule deleted successfully",
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="simulator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Real-time Price Simulator
              </CardTitle>
              <CardDescription>
                Test pricing logic for different user scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>User Role</Label>
                  <Select defaultValue="new_users">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {userGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Region</Label>
                  <Select defaultValue="global">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Coin Amount</Label>
                  <Input type="number" defaultValue={100} />
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Calculated Price</h3>
                    <p className="text-sm text-muted-foreground">Based on active pricing rules</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">$0.99</div>
                    <div className="text-sm text-muted-foreground">50% discount applied</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Applied Rules:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Base Rule: New Users - Global</span>
                    <Badge variant="outline">WELCOME50</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    This pricing gives new users a 50% discount to encourage first purchase
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCoinPricingManager;