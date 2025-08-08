import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Coins, Plus, Edit, Trash2, Users, Globe, 
  DollarSign, TrendingUp, Settings, Save 
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
  created_at: string;
  updated_at: string;
}

interface UserGroup {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

const CoinPricingManager = () => {
  const { toast } = useToast();
  const [pricingRules, setPricingRules] = useState<CoinPricingRule[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<CoinPricingRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_group: '',
    coin_amount: 100,
    price_usd: 1.99,
    region: 'global',
    currency: 'USD',
    promo_code: ''
  });

  const regions = [
    { value: 'global', label: 'Global' },
    { value: 'us', label: 'United States' },
    { value: 'eu', label: 'European Union' },
    { value: 'asia', label: 'Asia Pacific' },
    { value: 'latam', label: 'Latin America' }
  ];

  const currencies = [
    { value: 'USD', label: 'US Dollar' },
    { value: 'EUR', label: 'Euro' },
    { value: 'GBP', label: 'British Pound' },
    { value: 'JPY', label: 'Japanese Yen' },
    { value: 'CAD', label: 'Canadian Dollar' }
  ];

  const defaultUserGroups = [
    { id: '1', name: 'new_users', description: 'Users registered < 30 days', member_count: 245 },
    { id: '2', name: 'premium_users', description: 'Premium subscribers', member_count: 89 },
    { id: '3', name: 'patreon_users', description: 'Patreon supporters', member_count: 34 },
    { id: '4', name: 'vip_users', description: 'VIP tier members', member_count: 12 },
    { id: '5', name: 'returning_users', description: 'Regular active users', member_count: 456 }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load pricing rules
      if (db.isSupabase()) {
        // Simulate pricing rules data for Supabase
        const mockRules: CoinPricingRule[] = [
          {
            id: '1',
            user_group: 'new_users',
            coin_amount: 100,
            price_usd: 0.99,
            region: 'global',
            currency: 'USD',
            is_active: true,
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            user_group: 'patreon_users',
            coin_amount: 1000,
            price_usd: 6.99,
            region: 'global',
            currency: 'USD',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setPricingRules(mockRules);
      } else {
        // MySQL implementation
        const result = await db.query(
          'SELECT * FROM coin_pricing_rules ORDER BY created_at DESC',
          []
        );
        setPricingRules(result.data || []);
      }

      setUserGroups(defaultUserGroups);
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

  const handleSaveRule = async () => {
    try {
      const ruleData = {
        ...formData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (selectedRule) {
        // Update existing rule
        if (db.isSupabase()) {
          // Simulate update
          setPricingRules(prev => 
            prev.map(rule => 
              rule.id === selectedRule.id 
                ? { ...rule, ...ruleData }
                : rule
            )
          );
        } else {
          await db.query(
            'UPDATE coin_pricing_rules SET user_group=?, coin_amount=?, price_usd=?, region=?, currency=?, promo_code=?, updated_at=? WHERE id=?',
            [ruleData.user_group, ruleData.coin_amount, ruleData.price_usd, ruleData.region, ruleData.currency, ruleData.promo_code, ruleData.updated_at, selectedRule.id]
          );
        }
        
        toast({
          title: "Success",
          description: "Pricing rule updated successfully",
        });
      } else {
        // Create new rule
        const newRule = {
          id: Date.now().toString(),
          ...ruleData
        };

        if (db.isSupabase()) {
          setPricingRules(prev => [newRule, ...prev]);
        } else {
          await db.query(
            'INSERT INTO coin_pricing_rules (user_group, coin_amount, price_usd, region, currency, promo_code, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [ruleData.user_group, ruleData.coin_amount, ruleData.price_usd, ruleData.region, ruleData.currency, ruleData.promo_code, true, ruleData.created_at, ruleData.updated_at]
          );
        }

        toast({
          title: "Success",
          description: "New pricing rule created successfully",
        });
      }

      await loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save pricing rule:', error);
      toast({
        title: "Error",
        description: "Failed to save pricing rule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      if (db.isSupabase()) {
        setPricingRules(prev => prev.filter(rule => rule.id !== ruleId));
      } else {
        await db.query('DELETE FROM coin_pricing_rules WHERE id = ?', [ruleId]);
      }

      toast({
        title: "Success",
        description: "Pricing rule deleted successfully",
      });
      
      await loadData();
    } catch (error) {
      console.error('Failed to delete pricing rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete pricing rule",
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
      promo_code: ''
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
      promo_code: rule.promo_code || ''
    });
    setIsDialogOpen(true);
  };

  const calculateDiscount = (originalPrice: number, currentPrice: number) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
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
          <h2 className="text-2xl font-bold tracking-tight">Coin Pricing Manager</h2>
          <p className="text-muted-foreground">
            Manage dynamic pricing rules for different user groups and regions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Pricing Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedRule ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
              </DialogTitle>
              <DialogDescription>
                Set up pricing for specific user groups and regions
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user_group" className="text-right">
                  User Group
                </Label>
                <Select
                  value={formData.user_group}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, user_group: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select user group" />
                  </SelectTrigger>
                  <SelectContent>
                    {userGroups.map((group) => (
                      <SelectItem key={group.id} value={group.name}>
                        {group.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="coin_amount" className="text-right">
                  Coin Amount
                </Label>
                <Input
                  id="coin_amount"
                  type="number"
                  value={formData.coin_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, coin_amount: parseInt(e.target.value) }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price_usd" className="text-right">
                  Price (USD)
                </Label>
                <Input
                  id="price_usd"
                  type="number"
                  step="0.01"
                  value={formData.price_usd}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_usd: parseFloat(e.target.value) }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="region" className="text-right">
                  Region
                </Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                >
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currency" className="text-right">
                  Currency
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="promo_code" className="text-right">
                  Promo Code
                </Label>
                <Input
                  id="promo_code"
                  value={formData.promo_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, promo_code: e.target.value }))}
                  placeholder="Optional"
                  className="col-span-3"
                />
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

      <Tabs defaultValue="pricing-rules" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pricing-rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="user-groups">User Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="mr-2 h-5 w-5" />
                Active Pricing Rules
              </CardTitle>
              <CardDescription>
                Current pricing configurations for different user segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Group</TableHead>
                    <TableHead>Coin Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Promo Code</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingRules.map((rule) => {
                    const basePrice = 1.99; // Base price for comparison
                    const discount = calculateDiscount(basePrice, rule.price_usd);
                    
                    return (
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
                            {discount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {discount}% off
                              </Badge>
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
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                User Groups Overview
              </CardTitle>
              <CardDescription>
                Manage and monitor different user segments for targeted pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userGroups.map((group) => (
                  <Card key={group.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold capitalize">
                          {group.name.replace('_', ' ')}
                        </h4>
                        <Badge variant="secondary">
                          {group.member_count} users
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {group.description}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <TrendingUp className="mr-1 h-4 w-4" />
                        Active pricing rules: {pricingRules.filter(rule => rule.user_group === group.name).length}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoinPricingManager;