import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Coins, Edit, Plus, Trash2, TrendingUp, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  bonus_coins: number;
  price: number;
  currency: string;
  active: boolean;
  sort_order: number;
  sales_count?: number;
  revenue?: number;
}

const CoinStoreManager = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<CoinPackage[]>([
    {
      id: '1',
      name: 'Starter Pack',
      coins: 100,
      bonus_coins: 0,
      price: 4.99,
      currency: 'USD',
      active: true,
      sort_order: 1,
      sales_count: 45,
      revenue: 224.55
    },
    {
      id: '2',
      name: 'Popular Pack',
      coins: 250,
      bonus_coins: 25,
      price: 9.99,
      currency: 'USD',
      active: true,
      sort_order: 2,
      sales_count: 78,
      revenue: 779.22
    },
    {
      id: '3',
      name: 'Best Value',
      coins: 500,
      bonus_coins: 75,
      price: 19.99,
      currency: 'USD',
      active: true,
      sort_order: 3,
      sales_count: 32,
      revenue: 639.68
    }
  ]);

  const [editingPackage, setEditingPackage] = useState<CoinPackage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSavePackage = (packageData: Partial<CoinPackage>) => {
    if (editingPackage) {
      // Update existing package
      setPackages(packages.map(pkg => 
        pkg.id === editingPackage.id 
          ? { ...pkg, ...packageData }
          : pkg
      ));
      toast({
        title: "Package Updated",
        description: "Coin package has been updated successfully"
      });
    } else {
      // Create new package
      const newPackage: CoinPackage = {
        id: Date.now().toString(),
        ...packageData as CoinPackage,
        sales_count: 0,
        revenue: 0
      };
      setPackages([...packages, newPackage]);
      toast({
        title: "Package Created",
        description: "New coin package has been created"
      });
    }
    setEditingPackage(null);
    setIsDialogOpen(false);
  };

  const handleDeletePackage = (id: string) => {
    setPackages(packages.filter(pkg => pkg.id !== id));
    toast({
      title: "Package Deleted",
      description: "Coin package has been removed"
    });
  };

  const togglePackageActive = (id: string) => {
    setPackages(packages.map(pkg => 
      pkg.id === id ? { ...pkg, active: !pkg.active } : pkg
    ));
  };

  const totalRevenue = packages.reduce((sum, pkg) => sum + (pkg.revenue || 0), 0);
  const totalSales = packages.reduce((sum, pkg) => sum + (pkg.sales_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">${totalRevenue.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">{totalSales}</div>
                <div className="text-sm text-muted-foreground">Total Sales</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-full">
                <Coins className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">{packages.filter(p => p.active).length}</div>
                <div className="text-sm text-muted-foreground">Active Packages</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Coin Packages</CardTitle>
              <CardDescription>
                Manage coin store packages and pricing
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingPackage(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingPackage ? 'Edit Package' : 'Create Package'}
                  </DialogTitle>
                </DialogHeader>
                <PackageForm 
                  package={editingPackage}
                  onSave={handleSavePackage}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {packages
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{pkg.name}</h3>
                      <Badge variant={pkg.active ? "default" : "secondary"}>
                        {pkg.active ? "Active" : "Inactive"}
                      </Badge>
                      {pkg.bonus_coins > 0 && (
                        <Badge variant="outline" className="text-green-600">
                          +{pkg.bonus_coins} bonus
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{pkg.coins} coins</span>
                      <span>${pkg.price}</span>
                      <span>{pkg.sales_count || 0} sales</span>
                      <span>${(pkg.revenue || 0).toFixed(2)} revenue</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pkg.active}
                      onCheckedChange={() => togglePackageActive(pkg.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPackage(pkg);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePackage(pkg.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface PackageFormProps {
  package: CoinPackage | null;
  onSave: (data: Partial<CoinPackage>) => void;
  onCancel: () => void;
}

const PackageForm: React.FC<PackageFormProps> = ({ package: pkg, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    coins: pkg?.coins || 0,
    bonus_coins: pkg?.bonus_coins || 0,
    price: pkg?.price || 0,
    currency: pkg?.currency || 'USD',
    active: pkg?.active ?? true,
    sort_order: pkg?.sort_order || 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Package Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Starter Pack"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="coins">Base Coins</Label>
          <Input
            id="coins"
            type="number"
            value={formData.coins}
            onChange={(e) => setFormData({ ...formData, coins: parseInt(e.target.value) || 0 })}
            min="1"
            required
          />
        </div>
        <div>
          <Label htmlFor="bonus_coins">Bonus Coins</Label>
          <Input
            id="bonus_coins"
            type="number"
            value={formData.bonus_coins}
            onChange={(e) => setFormData({ ...formData, bonus_coins: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            min="0.01"
            required
          />
        </div>
        <div>
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
            min="1"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {pkg ? 'Update' : 'Create'} Package
        </Button>
      </div>
    </form>
  );
};

export default CoinStoreManager;