import React, { useState, useEffect } from 'react';
import { Coins, Plus, History, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CoinWallet {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
}

interface CoinTransaction {
  id: string;
  amount: number;
  type: string;
  context: string;
  description: string;
  created_at: string;
}

interface CoinWalletProps {
  className?: string;
  showTransactions?: boolean;
}

export const CoinWallet: React.FC<CoinWalletProps> = ({ 
  className = "",
  showTransactions = false 
}) => {
  const [wallet, setWallet] = useState<CoinWallet | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  const fetchWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: walletData, error: walletError } = await supabase
        .from('coin_wallets')
        .select('balance, lifetime_earned, lifetime_spent')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') {
        throw walletError;
      }

      setWallet(walletData || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast({
        title: "Error",
        description: "Failed to load coin wallet",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('coin_transactions')
        .select('id, amount, type, context, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchWallet();
    if (showTransactions) {
      fetchTransactions();
    }
  }, [showTransactions]);

  const formatContext = (context: string) => {
    switch (context) {
      case 'chapter_unlock':
        return 'Chapter Unlock';
      case 'welcome_bonus':
        return 'Welcome Bonus';
      case 'daily_bonus':
        return 'Daily Bonus';
      case 'contest':
        return 'Contest Reward';
      case 'admin_adjustment':
        return 'Admin Adjustment';
      default:
        return context.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getTransactionIcon = (type: string, context: string) => {
    if (type === 'earn') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return <Coins className="h-4 w-4 text-blue-500" />;
  };

  if (loading) {
    return (
      <Card className={`p-4 animate-pulse ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-20 mb-1"></div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-full">
              <Coins className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{wallet?.balance || 0}</span>
                <span className="text-sm text-muted-foreground">coins</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Earned: {wallet?.lifetime_earned || 0} • Spent: {wallet?.lifetime_spent || 0}
              </div>
            </div>
          </div>
          
          {showTransactions && (
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={fetchTransactions}
                >
                  <History className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Transaction History</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No transactions yet
                    </p>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type, transaction.context)}
                          <div>
                            <div className="text-sm font-medium">
                              {formatContext(transaction.context)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </div>
                            {transaction.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {transaction.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'earn' ? '+' : '-'}{Math.abs(transaction.amount)}
                          </div>
                          <Badge variant={transaction.type === 'earn' ? 'default' : 'secondary'} className="text-xs">
                            {transaction.type}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </Card>
    </>
  );
};