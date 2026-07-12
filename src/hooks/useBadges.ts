import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  color: string;
  rarity: string;
  is_hidden: boolean;
  is_premium: boolean;
  is_animated: boolean;
  category: string;
  sort_order: number;
  requirements: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id?: string;
  new_badge_id?: string;
  granted_by?: string;
  granted_at: string;
  visibility: string;
  is_equipped: boolean;
  display_order: number;
  notes?: string;
  badge?: Badge;
}

export const useBadges = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchUserBadges = async (userId?: string) => {
    if (!userId) {
      setUserBadges([]);
      return;
    }

    try {
      // First try to get user badges with the new badge reference
      const { data: userBadgeData, error: userBadgeError } = await supabase
        .from('user_badge_assignments')
        .select(`
          *,
          badge:new_badge_id(*)
        `)
        .eq('user_id', userId)
        .not('new_badge_id', 'is', null);

      if (userBadgeError) throw userBadgeError;

      let combinedBadges: UserBadge[] = [];

      // Process new badge assignments
      if (userBadgeData) {
        combinedBadges = userBadgeData.map(item => ({
          ...item,
          badge: item.badge as Badge
        }));
      }

      setUserBadges(combinedBadges);
    } catch (error) {
      console.error('Error fetching user badges:', error);
      setUserBadges([]);
    }
  };

  const grantBadge = async (userId: string, badgeId: string, notes?: string) => {
    try {
      const { data, error } = await supabase.rpc('grant_badge_to_user', {
        target_user_id: userId,
        target_badge_id: badgeId,
        granter_id: user?.id,
        admin_notes: notes
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error granting badge:', error);
      throw error;
    }
  };

  const revokeBadge = async (userId: string, badgeId: string) => {
    try {
      const { data, error } = await supabase.rpc('revoke_badge_from_user', {
        target_user_id: userId,
        target_badge_id: badgeId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error revoking badge:', error);
      throw error;
    }
  };

  const updateBadgeSettings = async (
    assignmentId: string,
    updates: Partial<Pick<UserBadge, 'is_equipped' | 'visibility' | 'display_order'>>
  ) => {
    try {
      const { error } = await supabase
        .from('user_badge_assignments')
        .update(updates)
        .eq('id', assignmentId);

      if (error) throw error;
      
      // Refresh user badges
      if (user) {
        await fetchUserBadges(user.id);
      }
    } catch (error) {
      console.error('Error updating badge settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserBadges(user.id);
    } else {
      setUserBadges([]);
    }
    setLoading(false);
  }, [user]);

  return {
    badges,
    userBadges,
    loading,
    fetchBadges,
    fetchUserBadges,
    grantBadge,
    revokeBadge,
    updateBadgeSettings,
    refreshUserBadges: () => user && fetchUserBadges(user.id)
  };
};