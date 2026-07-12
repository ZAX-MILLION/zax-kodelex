import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Lock, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoinWallet } from '@/hooks/useCoinWallet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CoinStorePopup from './CoinStorePopup';

interface ChapterUnlockPopupProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string;
  chapterTitle: string;
  unlockCost: number;
  onUnlocked?: () => void;
}

const ChapterUnlockPopup: React.FC<ChapterUnlockPopupProps> = ({
  isOpen,
  onClose,
  chapterId,
  chapterTitle,
  unlockCost,
  onUnlocked
}) => {
  const { user } = useAuth();
  const { wallet, spendCoins, refreshWallet } = useCoinWallet();
  const { toast } = useToast();
  const [unlocking, setUnlocking] = useState(false);
  const [showCoinStore, setShowCoinStore] = useState(false);

  const canAfford = wallet && wallet.balance >= unlockCost;

  const handleUnlock = async () => {
    if (!user || !canAfford) return;

    setUnlocking(true);
    try {
      const success = await spendCoins(unlockCost, `Unlocked ${chapterTitle}`, chapterId);
      
      if (success) {
        // Record chapter access in database
        await supabase
          .from('chapter_access')
          .insert({
            user_id: user.id,
            chapter_id: chapterId,
            access_type: 'coin_purchase',
            coins_spent: unlockCost
          });

        onUnlocked?.();
        onClose();
        
        toast({
          title: "Chapter Unlocked!",
          description: `You've successfully unlocked ${chapterTitle}`,
        });
      }
    } catch (error) {
      console.error('Error unlocking chapter:', error);
      toast({
        title: "Unlock Failed",
        description: "Failed to unlock chapter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUnlocking(false);
    }
  };

  const handleBuyCoins = () => {
    setShowCoinStore(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" />
              Unlock Chapter
            </DialogTitle>
            <DialogDescription>
              This chapter requires coins to unlock
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Chapter Info */}
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{chapterTitle}</h3>
              <Badge variant="outline" className="gap-1">
                <Coins className="h-3 w-3" />
                {unlockCost} coins
              </Badge>
            </div>

            {/* User Balance */}
            {user && (
              <div className="flex items-center justify-between p-4 bg-background border rounded-lg">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Your Balance:</span>
                </div>
                <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                  {wallet?.balance || 0} coins
                </span>
              </div>
            )}

            {/* Insufficient Funds Warning */}
            {!canAfford && user && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">
                  You need {unlockCost - (wallet?.balance || 0)} more coins
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {user ? (
                <>
                  {canAfford ? (
                    <Button 
                      onClick={handleUnlock}
                      disabled={unlocking}
                      className="w-full"
                      size="lg"
                    >
                      {unlocking ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Coins className="h-4 w-4 mr-2" />
                          Unlock for {unlockCost} coins
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleBuyCoins}
                      className="w-full"
                      size="lg"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Buy More Coins
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Please sign in to unlock chapters
                  </p>
                  <Button onClick={onClose} variant="outline" className="w-full">
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CoinStorePopup 
        isOpen={showCoinStore} 
        onClose={() => {
          setShowCoinStore(false);
          refreshWallet();
        }} 
      />
    </>
  );
};

export default ChapterUnlockPopup;