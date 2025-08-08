import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  plan: 'free' | 'premium';
  status: 'active' | 'canceled' | 'expired' | 'pending';
  paypal_subscription_id?: string;
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  amount?: number;
  currency: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setIsPremium(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Use the new check-subscription edge function for real-time status
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error('Subscription check error:', error);
        // Fallback to direct database query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (fallbackError && fallbackError.code !== 'PGRST116') {
          throw fallbackError;
        }

        setSubscription(fallbackData);
        setIsPremium(fallbackData?.plan === 'premium' && fallbackData?.status === 'active');
      } else {
        setSubscription(data.subscription);
        setIsPremium(data.isPremium);
      }
      
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Set defaults for error cases
      setSubscription(null);
      setIsPremium(false);
      
      toast({
        title: "Error",
        description: "Failed to load subscription information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);

      const returnUrl = `${window.location.origin}/premium/success`;
      const cancelUrl = `${window.location.origin}/premium/cancelled`;

      const { data, error } = await supabase.functions.invoke('paypal-subscribe', {
        body: {
          userId: user.id,
          planId,
          returnUrl,
          cancelUrl,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Subscription Error",
        description: "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscription?.paypal_subscription_id) return;

    try {
      setLoading(true);

      // For now, just update the local status
      // In production, you'd call PayPal API to cancel
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'canceled',
          auto_renew: false 
        })
        .eq('id', subscription.id);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled and will not renew.",
      });

      fetchSubscription();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    subscription,
    isPremium,
    loading,
    fetchSubscription,
    createSubscription,
    cancelSubscription,
  };
};