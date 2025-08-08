import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChildTheme } from './useChildTheme';

interface UserThemePreference {
  userId: string;
  themeId: string;
  isEnabled: boolean;
}

export const useUserThemeSelection = (currentUser: any) => {
  const [userTheme, setUserTheme] = useState<ChildTheme | null>(null);
  const [isUserThemeEnabled, setIsUserThemeEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadUserThemePreference();
    }
  }, [currentUser]);

  // Enhancement 10: Allow users to select their own theme
  const loadUserThemePreference = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_theme_preferences')
        .select(`
          *,
          child_themes (*)
        `)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.child_themes) {
        const theme = data.child_themes;
        // Transform the theme_config from JSON to proper TypeScript type
        const transformedTheme: ChildTheme = {
          ...theme,
          theme_config: typeof theme.theme_config === 'string' 
            ? JSON.parse(theme.theme_config)
            : theme.theme_config
        };
        setUserTheme(transformedTheme);
      } else {
        setUserTheme(null);
      }
      setIsUserThemeEnabled(data?.is_enabled || false);
    } catch (error) {
      console.error('Error loading user theme preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const setUserThemePreference = async (themeId: string | null, enabled: boolean = true) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('user_theme_preferences')
        .upsert({
          user_id: currentUser.id,
          theme_id: themeId,
          is_enabled: enabled
        });

      if (error) throw error;
      
      await loadUserThemePreference();
    } catch (error) {
      console.error('Error setting user theme preference:', error);
    }
  };

  const toggleUserTheme = async () => {
    if (!currentUser || !userTheme) return;
    
    await setUserThemePreference(userTheme.id, !isUserThemeEnabled);
  };

  return {
    userTheme,
    isUserThemeEnabled,
    loading,
    setUserThemePreference,
    toggleUserTheme
  };
};