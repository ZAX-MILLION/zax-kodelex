import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, CreditCard, Calculator } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoinWallet } from '@/hooks/useCoinWallet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CoinStorePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CoinStorePopup: React.FC<CoinStorePopupProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { wallet, refreshWallet } = useCoinWallet();
  const { toast } = useToast();
  const [customCoins, setCustomCoins] = useState<number>(50);
  const [loading, setLoading] = useState(false);

  // 50 coins = $3, so 1 coin = $0.06
  const pricePerCoin = 3 / 50;
  const totalPrice = customCoins * pricePerCoin;

  const quickAmounts = [50, 100, 250, 500, 1000];

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase coins",
        variant: "destructive"
      });
      return;
    }

    if (customCoins < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter at least 1 coin",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Call PayPal purchase function with custom amount
      const { data, error } = await supabase.functions.invoke('paypal-purchase-coins', {
        body: {
          package_id: 'custom',
          coins: customCoins,
          amount: totalPrice,
          currency: 'USD'
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
        
        onClose();
      }
    } catch (error) {
      console.error('Error initiating purchase:', error);
      toast({
        title: "Purchase Failed",
        description: "Unable to start payment process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setCustomCoins(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Buy Coins
          </DialogTitle>
          <DialogDescription>
            Purchase coins to unlock premium chapters and content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Balance */}
          {user && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-full">
                    <Coins className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <div className="font-semibold">{wallet?.balance || 0} coins</div>
                    <div className="text-sm text-muted-foreground">Current balance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Amount Buttons */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Quick Select</Label>
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map(amount => (
                <Button
                  key={amount}
                  variant={customCoins === amount ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickAmount(amount)}
                  className="text-xs"
                >
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="coins">Custom Amount</Label>
            <Input
              id="coins"
              type="number"
              min="1"
              value={customCoins}
              onChange={(e) => setCustomCoins(Math.max(1, parseInt(e.target.value) || 1))}
              placeholder="Enter number of coins"
            />
          </div>

          {/* Price Calculator */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Price Breakdown</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{customCoins} coins</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Rate</span>
                  <span>${pricePerCoin.toFixed(3)} per coin</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)} USD</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Button */}
          {user ? (
            <Button 
              onClick={handlePurchase}
              disabled={loading || customCoins < 1}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase with PayPal
                </>
              )}
            </Button>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Please sign in to purchase coins</p>
              <Button onClick={onClose} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoinStorePopup;