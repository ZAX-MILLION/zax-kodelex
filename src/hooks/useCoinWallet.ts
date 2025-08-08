import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CoinTransaction } from '@/types/monetization';

interface CoinWallet {
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
}

export const useCoinWallet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<CoinWallet | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWallet();
      fetchTransactions();
    } else {
      setWallet(null);
      setTransactions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchWallet = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: walletError } = await supabase
        .from('coin_wallets')
        .select('balance, lifetime_earned, lifetime_spent')
        .eq('user_id', user.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') {
        throw walletError;
      }

      setWallet(data || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 });
    } catch (err: any) {
      console.error('Error fetching wallet:', err);
      setError(err.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Map existing schema to our interface
      const mappedTransactions = (data || []).map(tx => ({
        id: tx.id,
        user_id: tx.user_id,
        amount: tx.amount,
        transaction_type: tx.type as 'purchase' | 'spend' | 'refund' | 'reward',
        description: tx.description || tx.context,
        chapter_id: tx.reference_id,
        created_at: tx.created_at
      }));
      
      setTransactions(mappedTransactions);
    } catch (error) {
      console.error('Error fetching coin transactions:', error);
    }
  };

  const spendCoins = async (amount: number, description: string, chapterId?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to spend coins",
        variant: "destructive",
      });
      return false;
    }

    if (!wallet || amount > wallet.balance) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${amount} coins but only have ${wallet?.balance || 0}`,
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          type: 'spend',
          context: description,
          description: description,
          reference_id: chapterId,
        });

      if (error) throw error;

      await fetchWallet();
      await fetchTransactions();
      
      toast({
        title: "Coins Spent",
        description: `${amount} coins spent on ${description}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error spending coins:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to spend coins. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addCoins = async (amount: number, description: string, type: 'purchase' | 'reward' | 'refund' = 'reward') => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: user.id,
          amount,
          type,
          context: description,
          description: description,
        });

      if (error) throw error;

      await fetchWallet();
      await fetchTransactions();
      
      toast({
        title: "Coins Added",
        description: `${amount} coins added to your wallet`,
      });
      
      return true;
    } catch (error) {
      console.error('Error adding coins:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to add coins. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const refreshWallet = () => {
    fetchWallet();
    fetchTransactions();
  };

  return {
    wallet,
    transactions,
    loading,
    error,
    spendCoins,
    addCoins,
    refreshWallet
  };
};