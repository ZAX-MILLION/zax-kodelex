import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Coins, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Users,
  Plus,
  Edit,
  Trash2,
  History
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCoinWallet } from '@/hooks/useCoinWallet';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CoinPackage {
  id: string;
  name: string;
  coin_amount: number;
  price_usd: number;
  bonus_coins: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface CoinStats {
  total_coins_sold: number;
  total_revenue: number;
  active_packages: number;
  recent_purchases: number;
}

export const CoinManager: React.FC = () => {
  const { toast } = useToast();
  const { wallet, transactions, loading: walletLoading } = useCoinWallet();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [stats, setStats] = useState<CoinStats>({
    total_coins_sold: 0,
    total_revenue: 0,
    active_packages: 0,
    recent_purchases: 0
  });
  const [newPackage, setNewPackage] = useState({
    name: '',
    coin_amount: 0,
    price_usd: 0,
    bonus_coins: 0
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CoinPackage | null>(null);

  useEffect(() => {
    loadCoinData();
  }, []);

  const loadCoinData = async () => {
    setLoading(true);
    try {
      // For demo purposes, we'll use localStorage to simulate coin packages
      const storedPackages = localStorage.getItem('coin_packages');
      if (storedPackages) {
        const parsedPackages = JSON.parse(storedPackages);
        setPackages(parsedPackages);
      } else {
        // Initialize with default packages
        const defaultPackages: CoinPackage[] = [
          {
            id: '1',
            name: 'Starter Pack',
            coin_amount: 100,
            price_usd: 0.99,
            bonus_coins: 0,
            is_active: true,
            display_order: 1,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Popular Pack',
            coin_amount: 500,
            price_usd: 4.99,
            bonus_coins: 50,
            is_active: true,
            display_order: 2,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Value Pack',
            coin_amount: 1000,
            price_usd: 9.99,
            bonus_coins: 150,
            is_active: true,
            display_order: 3,
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Ultimate Pack',
            coin_amount: 2500,
            price_usd: 19.99,
            bonus_coins: 500,
            is_active: true,
            display_order: 4,
            created_at: new Date().toISOString()
          }
        ];
        setPackages(defaultPackages);
        localStorage.setItem('coin_packages', JSON.stringify(defaultPackages));
      }

      // Calculate stats
      const activePackageCount = packages.filter(p => p.is_active).length;
      setStats({
        total_coins_sold: 12500, // Demo data
        total_revenue: 156.75,
        active_packages: activePackageCount,
        recent_purchases: 23
      });

    } catch (error: any) {
      console.error('Error loading coin data:', error);
      toast({
        title: "Error",
        description: "Failed to load coin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePackage = () => {
    if (!newPackage.name || newPackage.coin_amount <= 0 || newPackage.price_usd <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive"
      });
      return;
    }

    const packageToSave: CoinPackage = {
      id: editingPackage?.id || Date.now().toString(),
      ...newPackage,
      is_active: true,
      display_order: editingPackage?.display_order || packages.length + 1,
      created_at: editingPackage?.created_at || new Date().toISOString()
    };

    let updatedPackages;
    if (editingPackage) {
      updatedPackages = packages.map(p => p.id === editingPackage.id ? packageToSave : p);
    } else {
      updatedPackages = [...packages, packageToSave];
    }

    setPackages(updatedPackages);
    localStorage.setItem('coin_packages', JSON.stringify(updatedPackages));

    toast({
      title: "Success",
      description: `Coin package ${editingPackage ? 'updated' : 'created'} successfully`
    });

    setNewPackage({ name: '', coin_amount: 0, price_usd: 0, bonus_coins: 0 });
    setEditingPackage(null);
    setDialogOpen(false);
  };

  const togglePackageStatus = (packageId: string) => {
    const updatedPackages = packages.map(p => 
      p.id === packageId ? { ...p, is_active: !p.is_active } : p
    );
    setPackages(updatedPackages);
    localStorage.setItem('coin_packages', JSON.stringify(updatedPackages));
    
    toast({
      title: "Success",
      description: "Package status updated"
    });
  };

  const deletePackage = (packageId: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      const updatedPackages = packages.filter(p => p.id !== packageId);
      setPackages(updatedPackages);
      localStorage.setItem('coin_packages', JSON.stringify(updatedPackages));
      
      toast({
        title: "Success",
        description: "Package deleted successfully"
      });
    }
  };

  const editPackage = (pkg: CoinPackage) => {
    setEditingPackage(pkg);
    setNewPackage({
      name: pkg.name,
      coin_amount: pkg.coin_amount,
      price_usd: pkg.price_usd,
      bonus_coins: pkg.bonus_coins
    });
    setDialogOpen(true);
  };

  if (loading || walletLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading coin system...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Total Coins Sold</p>
                <p className="text-2xl font-bold">{stats.total_coins_sold.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.total_revenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Active Packages</p>
                <p className="text-2xl font-bold">{stats.active_packages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Recent Purchases</p>
                <p className="text-2xl font-bold">{stats.recent_purchases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Coin Management */}
      <Tabs defaultValue="packages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="packages">Coin Packages</TabsTrigger>
          <TabsTrigger value="wallet">User Wallet</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Coin Packages</CardTitle>
                <CardDescription>
                  Manage coin packages and pricing
                </CardDescription>
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingPackage(null);
                    setNewPackage({ name: '', coin_amount: 0, price_usd: 0, bonus_coins: 0 });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Package
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingPackage ? 'Edit' : 'Create'} Coin Package
                    </DialogTitle>
                    <DialogDescription>
                      Configure coin package details and pricing
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="package-name">Package Name</Label>
                      <Input
                        id="package-name"
                        value={newPackage.name}
                        onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                        placeholder="e.g., Starter Pack"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="coin-amount">Coin Amount</Label>
                        <Input
                          id="coin-amount"
                          type="number"
                          value={newPackage.coin_amount}
                          onChange={(e) => setNewPackage({ ...newPackage, coin_amount: parseInt(e.target.value) || 0 })}
                          placeholder="100"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (USD)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newPackage.price_usd}
                          onChange={(e) => setNewPackage({ ...newPackage, price_usd: parseFloat(e.target.value) || 0 })}
                          placeholder="0.99"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bonus-coins">Bonus Coins (Optional)</Label>
                      <Input
                        id="bonus-coins"
                        type="number"
                        value={newPackage.bonus_coins}
                        onChange={(e) => setNewPackage({ ...newPackage, bonus_coins: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button onClick={savePackage} className="flex-1">
                        {editingPackage ? 'Update' : 'Create'} Package
                      </Button>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <Card key={pkg.id} className={`p-4 ${!pkg.is_active ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{pkg.name}</h4>
                        <p className="text-2xl font-bold text-primary">
                          {pkg.coin_amount + pkg.bonus_coins} <span className="text-sm font-normal">coins</span>
                        </p>
                      </div>
                      <Badge variant={pkg.is_active ? "default" : "secondary"}>
                        {pkg.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Base Coins:</span>
                        <span>{pkg.coin_amount}</span>
                      </div>
                      {pkg.bonus_coins > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Bonus:</span>
                          <span>+{pkg.bonus_coins}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold">
                        <span>Price:</span>
                        <span>${pkg.price_usd}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editPackage(pkg)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={pkg.is_active ? "secondary" : "default"}
                        onClick={() => togglePackageStatus(pkg.id)}
                      >
                        {pkg.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePackage(pkg.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Your Coin Wallet</CardTitle>
              <CardDescription>
                Current balance and wallet statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {wallet ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/20 rounded-full">
                        <Coins className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className="text-2xl font-bold">{wallet.balance.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-full">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lifetime Earned</p>
                        <p className="text-2xl font-bold">{wallet.lifetime_earned.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-full">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lifetime Spent</p>
                        <p className="text-2xl font-bold">{wallet.lifetime_spent.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <Coins className="h-4 w-4" />
                  <AlertDescription>
                    No wallet found. A wallet will be created automatically when you make your first transaction.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                Recent coin transactions and spending history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.transaction_type === 'purchase' || transaction.transaction_type === 'reward' 
                            ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          <Coins className={`h-4 w-4 ${
                            transaction.transaction_type === 'purchase' || transaction.transaction_type === 'reward'
                              ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} coins
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.transaction_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <History className="h-4 w-4" />
                  <AlertDescription>
                    No transactions found. Your transaction history will appear here.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};