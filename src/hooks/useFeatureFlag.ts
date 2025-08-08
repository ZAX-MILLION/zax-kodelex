import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeatureFlag {
  id: string;
  flag_key: string;
  display_name: string;
  description: string;
  is_enabled: boolean;
  visibility: 'public' | 'admin-only';
  allowed_roles: string[];
  usage_count: number;
  last_toggled_at: string | null;
  last_toggled_by: string | null;
  created_at: string;
  updated_at: string;
}

interface UserFlag {
  id: string;
  user_id: string;
  flag_key: string;
  is_enabled: boolean;
  granted_by: string | null;
  reason: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useFeatureFlag = (flagKey: string) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userProfile } = useAuth();

  const checkFeatureFlag = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        setIsEnabled(false);
        return;
      }

      // Call the Supabase function to check flag access
      const { data, error: functionError } = await supabase.rpc('has_feature_flag', {
        flag_key_param: flagKey,
        user_id_param: user.id
      });

      if (functionError) {
        console.error('Error checking feature flag:', functionError);
        setError(functionError.message);
        setIsEnabled(false);
        return;
      }

      setIsEnabled(data || false);
    } catch (err) {
      console.error('Error in feature flag check:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkFeatureFlag();
  }, [flagKey, user?.id, userProfile?.role]);

  // Set up real-time subscription for flag changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('feature-flags-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags',
          filter: `flag_key=eq.${flagKey}`
        },
        () => {
          checkFeatureFlag();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_flags',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          checkFeatureFlag();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [flagKey, user?.id]);

  return { isEnabled, isLoading, error, refetch: checkFeatureFlag };
};

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [userFlags, setUserFlags] = useState<UserFlag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  const fetchFlags = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isAdmin) {
        setFlags([]);
        setUserFlags([]);
        return;
      }

      // Fetch all feature flags
      const { data: flagsData, error: flagsError } = await supabase
        .from('feature_flags')
        .select('*')
        .order('display_name');

      if (flagsError) {
        throw flagsError;
      }

      setFlags((flagsData || []) as FeatureFlag[]);

      // Fetch user flag overrides if user exists
      if (user) {
        const { data: userFlagsData, error: userFlagsError } = await supabase
          .from('user_flags')
          .select('*')
          .order('created_at', { ascending: false });

        if (userFlagsError) {
          throw userFlagsError;
        }

        setUserFlags(userFlagsData || []);
      }
    } catch (err) {
      console.error('Error fetching feature flags:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFlag = async (flagId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: enabled })
        .eq('id', flagId);

      if (error) throw error;

      // Log the action
      await supabase.from('system_logs').insert({
        level: 'info',
        message: `Feature flag ${enabled ? 'enabled' : 'disabled'}`,
        metadata: { flag_id: flagId, action: 'toggle', enabled }
      });

      await fetchFlags();
    } catch (err) {
      console.error('Error toggling feature flag:', err);
      throw err;
    }
  };

  const createFlag = async (flagData: { flag_key: string; display_name: string; description?: string; visibility?: 'public' | 'admin-only'; allowed_roles?: string[] }) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .insert(flagData as any);

      if (error) throw error;

      await supabase.from('system_logs').insert({
        level: 'info',
        message: 'Feature flag created',
        metadata: { flag_key: flagData.flag_key, action: 'create' }
      });

      await fetchFlags();
    } catch (err) {
      console.error('Error creating feature flag:', err);
      throw err;
    }
  };

  const updateFlag = async (flagId: string, flagData: Partial<FeatureFlag>) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update(flagData)
        .eq('id', flagId);

      if (error) throw error;

      await supabase.from('system_logs').insert({
        level: 'info',
        message: 'Feature flag updated',
        metadata: { flag_id: flagId, action: 'update' }
      });

      await fetchFlags();
    } catch (err) {
      console.error('Error updating feature flag:', err);
      throw err;
    }
  };

  const deleteFlag = async (flagId: string) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .delete()
        .eq('id', flagId);

      if (error) throw error;

      await supabase.from('system_logs').insert({
        level: 'info',
        message: 'Feature flag deleted',
        metadata: { flag_id: flagId, action: 'delete' }
      });

      await fetchFlags();
    } catch (err) {
      console.error('Error deleting feature flag:', err);
      throw err;
    }
  };

  const setUserFlag = async (userId: string, flagKey: string, enabled: boolean, reason?: string, expiresAt?: string) => {
    try {
      const { error } = await supabase
        .from('user_flags')
        .upsert({
          user_id: userId,
          flag_key: flagKey,
          is_enabled: enabled,
          granted_by: user?.id,
          reason,
          expires_at: expiresAt
        });

      if (error) throw error;

      await supabase.from('system_logs').insert({
        level: 'info',
        message: 'User flag override set',
        metadata: { user_id: userId, flag_key: flagKey, enabled, action: 'user_flag_set' }
      });

      await fetchFlags();
    } catch (err) {
      console.error('Error setting user flag:', err);
      throw err;
    }
  };

  const removeUserFlag = async (userFlagId: string) => {
    try {
      const { error } = await supabase
        .from('user_flags')
        .delete()
        .eq('id', userFlagId);

      if (error) throw error;

      await supabase.from('system_logs').insert({
        level: 'info',
        message: 'User flag override removed',
        metadata: { user_flag_id: userFlagId, action: 'user_flag_remove' }
      });

      await fetchFlags();
    } catch (err) {
      console.error('Error removing user flag:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchFlags();
  }, [user?.id, isAdmin]);

  // Set up real-time subscription
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('feature-flags-admin')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags'
        },
        () => {
          fetchFlags();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_flags'
        },
        () => {
          fetchFlags();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  return {
    flags,
    userFlags,
    isLoading,
    error,
    toggleFlag,
    createFlag,
    updateFlag,
    deleteFlag,
    setUserFlag,
    removeUserFlag,
    refetch: fetchFlags
  };
};