import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Star, Gift, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoinWallet } from '@/hooks/useCoinWallet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  currency: string;
  bonus_coins: number;
  active: boolean;
  sort_order: number;
  name: string;
  popular?: boolean;
}

const CoinStore = () => {
  const { user } = useAuth();
  const { wallet, refreshWallet } = useCoinWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // Mock data - in production this would come from coin_packages table
  const coinPackages: CoinPackage[] = [
    {
      id: '1',
      name: 'Starter Pack',
      coins: 100,
      bonus_coins: 0,
      price: 4.99,
      currency: 'USD',
      active: true,
      sort_order: 1
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
      popular: true
    },
    {
      id: '3',
      name: 'Best Value',
      coins: 500,
      bonus_coins: 75,
      price: 19.99,
      currency: 'USD',
      active: true,
      sort_order: 3
    },
    {
      id: '4',
      name: 'Ultimate Pack',
      coins: 1000,
      bonus_coins: 200,
      price: 34.99,
      currency: 'USD',
      active: true,
      sort_order: 4
    }
  ];

  const handlePurchase = async (pkg: CoinPackage) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase coins",
        variant: "destructive"
      });
      return;
    }

    setLoading(pkg.id);
    try {
      // Call PayPal purchase function
      const { data, error } = await supabase.functions.invoke('paypal-purchase-coins', {
        body: {
          package_id: pkg.id,
          coins: pkg.coins + pkg.bonus_coins,
          amount: pkg.price,
          currency: pkg.currency
        }
      });

      if (error) throw error;

      if (data.url) {
        // Open PayPal checkout in new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to PayPal",
          description: "Complete your purchase to receive coins"
        });
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      toast({
        title: "Purchase Failed",
        description: "Unable to start payment process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-muted-foreground mb-4">
              Please sign in to purchase coins and unlock premium content
            </p>
            <Button asChild>
              <a href="/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Coin Store</h1>
        <p className="text-muted-foreground mb-4">
          Purchase coins to unlock premium chapters and exclusive content
        </p>
        
        {/* Current Balance */}
        <Card className="inline-block mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-full">
                <Coins className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-lg font-semibold">{wallet?.balance || 0} coins</div>
                <div className="text-sm text-muted-foreground">Current balance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coin Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {coinPackages
          .filter(pkg => pkg.active)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative ${pkg.popular ? 'ring-2 ring-primary' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">
                  {pkg.coins}
                  {pkg.bonus_coins > 0 && (
                    <span className="text-sm text-green-600">
                      +{pkg.bonus_coins}
                    </span>
                  )}
                </div>
                <CardDescription>
                  {pkg.bonus_coins > 0 ? (
                    <>
                      {pkg.coins} coins + {pkg.bonus_coins} bonus
                    </>
                  ) : (
                    `${pkg.coins} coins`
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <div className="text-2xl font-bold">
                  ${pkg.price}
                </div>
                
                {pkg.bonus_coins > 0 && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                    <Gift className="h-3 w-3 mr-1" />
                    {Math.round((pkg.bonus_coins / pkg.coins) * 100)}% Bonus
                  </Badge>
                )}
                
                <Button 
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading === pkg.id}
                  className="w-full"
                >
                  {loading === pkg.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Benefits Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">What can you do with coins?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-500/10 rounded-full w-fit mx-auto mb-4">
                <Coins className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">Unlock Chapters</h3>
              <p className="text-sm text-muted-foreground">
                Use coins to unlock premium chapters without a subscription
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-500/10 rounded-full w-fit mx-auto mb-4">
                <Star className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">Premium Features</h3>
              <p className="text-sm text-muted-foreground">
                Access exclusive themes, ad-free reading, and special content
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-500/10 rounded-full w-fit mx-auto mb-4">
                <Gift className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Gift to Friends</h3>
              <p className="text-sm text-muted-foreground">
                Share coins with other readers and support your favorite creators
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoinStore;