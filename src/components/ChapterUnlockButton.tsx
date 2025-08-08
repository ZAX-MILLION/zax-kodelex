import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Coins, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChapterPrice {
  coin_cost: number;
  premium_only: boolean;
  early_access_hours: number;
}

interface ChapterUnlockButtonProps {
  chapterId: string;
  chapterTitle?: string;
  className?: string;
  onUnlocked?: () => void;
}

export const ChapterUnlockButton: React.FC<ChapterUnlockButtonProps> = ({
  chapterId,
  chapterTitle = "Chapter",
  className = "",
  onUnlocked
}) => {
  const [price, setPrice] = useState<ChapterPrice | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { toast } = useToast();

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check chapter access
      const { data: accessData } = await supabase
        .rpc('user_has_chapter_access', { 
          chapter_id_param: chapterId,
          user_id_param: user.id 
        });

      setHasAccess(accessData || false);

      // Get chapter pricing
      const { data: priceData } = await supabase
        .from('chapter_prices')
        .select('coin_cost, premium_only, early_access_hours')
        .eq('chapter_id', chapterId)
        .single();

      setPrice(priceData);

      // Get user coin balance
      const { data: walletData } = await supabase
        .from('coin_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      setUserBalance(walletData?.balance || 0);

      // Check premium status
      const { data: premiumData } = await supabase
        .rpc('is_premium_user', { user_id: user.id });

      setIsPremium(premiumData || false);

    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!price || unlocking) return;

    setUnlocking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: success, error } = await supabase
        .rpc('unlock_chapter_with_coins', {
          chapter_id_param: chapterId,
          user_id_param: user.id
        });

      if (error) throw error;

      if (success) {
        setHasAccess(true);
        setUserBalance(prev => prev - price.coin_cost);
        setShowConfirm(false);
        onUnlocked?.();
        
        toast({
          title: "Chapter Unlocked!",
          description: `You've unlocked ${chapterTitle} for ${price.coin_cost} coins.`
        });
      } else {
        toast({
          title: "Unlock Failed",
          description: "You don't have enough coins to unlock this chapter.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error unlocking chapter:', error);
      toast({
        title: "Error",
        description: "Failed to unlock chapter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUnlocking(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [chapterId]);

  if (loading) {
    return (
      <Button disabled className={className}>
        <Lock className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  // User has access
  if (hasAccess) {
    return (
      <Badge variant="secondary" className={className}>
        <Unlock className="h-4 w-4 mr-1" />
        Unlocked
      </Badge>
    );
  }

  // Chapter is free
  if (!price || price.coin_cost === 0) {
    return (
      <Badge variant="default" className={className}>
        <Unlock className="h-4 w-4 mr-1" />
        Free
      </Badge>
    );
  }

  // Premium only chapter
  if (price.premium_only && !isPremium) {
    return (
      <Badge variant="secondary" className={className}>
        <Crown className="h-4 w-4 mr-1" />
        Premium Only
      </Badge>
    );
  }

  // Premium user can access
  if (isPremium && !price.premium_only) {
    return (
      <Badge variant="default" className={className}>
        <Crown className="h-4 w-4 mr-1" />
        Premium Access
      </Badge>
    );
  }

  // Needs coins to unlock
  const canAfford = userBalance >= price.coin_cost;

  return (
    <>
      <Button
        variant={canAfford ? "default" : "outline"}
        className={className}
        onClick={() => setShowConfirm(true)}
        disabled={!canAfford}
      >
        <Coins className="h-4 w-4 mr-2" />
        {canAfford ? `Unlock (${price.coin_cost} coins)` : `Need ${price.coin_cost} coins`}
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Chapter</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlock "{chapterTitle}" for {price.coin_cost} coins?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>Current Balance:</span>
              <span className="font-semibold">{userBalance} coins</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>Cost:</span>
              <span className="font-semibold text-red-600">-{price.coin_cost} coins</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span>Remaining Balance:</span>
              <span className="font-semibold">{userBalance - price.coin_cost} coins</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleUnlock}
              disabled={unlocking || !canAfford}
            >
              {unlocking ? 'Unlocking...' : 'Confirm Unlock'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};