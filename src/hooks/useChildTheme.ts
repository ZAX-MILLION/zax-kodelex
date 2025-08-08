import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    manga_red: string;
    manga_gold: string;
    manga_blue: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    scale: number;
  };
  borderRadius: string;
  animations: {
    enabled: boolean;
    duration: string;
  };
  dark_variant?: ThemeConfig;
}

export interface ChildTheme {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  version: string;
  author?: string;
  is_active: boolean;
  is_default: boolean;
  theme_config: ThemeConfig;
  custom_css?: string;
  homepage_component?: string;
  layout_overrides?: any;
  preview_image_url?: string;
  created_at: string;
  updated_at: string;
}

interface DatabaseTheme {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  version: string;
  author?: string;
  is_active: boolean;
  is_default: boolean;
  theme_config: any;
  custom_css?: string;
  homepage_component?: string;
  layout_overrides?: any;
  preview_image_url?: string;
  created_at: string;
  updated_at: string;
}

export const useChildTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ChildTheme | null>(null);
  const [availableThemes, setAvailableThemes] = useState<ChildTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load active theme and available themes
  useEffect(() => {
    loadThemes();
  }, []);

  const transformDatabaseTheme = (dbTheme: DatabaseTheme): ChildTheme => ({
    ...dbTheme,
    theme_config: typeof dbTheme.theme_config === 'string' 
      ? JSON.parse(dbTheme.theme_config)
      : dbTheme.theme_config
  });

  const loadThemes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all available themes (not just active or default)
      const { data: dbThemes, error: themesError } = await supabase
        .from('child_themes')
        .select('*')
        .order('created_at', { ascending: true });

      if (themesError) throw themesError;

      console.log('🎨 Loaded themes from database:', dbThemes?.length || 0);
      console.log('📋 Theme details:', dbThemes?.map(t => ({ 
        name: t.name, 
        display_name: t.display_name, 
        is_active: t.is_active,
        homepage_component: t.homepage_component 
      })));

      // Transform database themes to proper TypeScript types
      const themes = (dbThemes as DatabaseTheme[] || []).map(transformDatabaseTheme);
      setAvailableThemes(themes);

      // Find the active theme or fallback to default
      const activeTheme = themes?.find(t => t.is_active) || themes?.find(t => t.is_default);
      if (activeTheme) {
        setCurrentTheme(activeTheme);
        applyTheme(activeTheme);
      }
    } catch (err) {
      console.error('Error loading themes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load themes');
      
      // Fallback to built-in default theme
      const fallbackTheme = getBuiltInDefaultTheme();
      setCurrentTheme(fallbackTheme);
      applyTheme(fallbackTheme);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: ChildTheme) => {
    try {
      const root = document.documentElement;
      const config = theme.theme_config;

      // Apply color variables
      if (config.colors) {
        Object.entries(config.colors).forEach(([key, value]) => {
          const cssVar = key.replace(/_/g, '-');
          root.style.setProperty(`--${cssVar}`, value);
        });
      }

      // Apply border radius
      if (config.borderRadius) {
        root.style.setProperty('--radius', config.borderRadius);
      }

      // Apply spacing scale
      if (config.spacing?.scale) {
        root.style.setProperty('--spacing-scale', config.spacing.scale.toString());
      }

      // Apply custom CSS if present
      if (theme.custom_css) {
        applyCustomCSS(theme.custom_css, theme.name);
      } else {
        removeCustomCSS(theme.name);
      }

      // Apply font settings
      if (config.fonts) {
        if (config.fonts.heading) {
          root.style.setProperty('--font-heading', config.fonts.heading);
        }
        if (config.fonts.body) {
          root.style.setProperty('--font-body', config.fonts.body);
        }
      }

      // Apply animation settings
      if (config.animations) {
        root.style.setProperty('--animation-duration', config.animations.duration);
        document.body.classList.toggle('no-animations', !config.animations.enabled);
      }

    } catch (err) {
      console.error('Error applying theme:', err);
      toast({
        title: "Theme Error",
        description: "Failed to apply theme. Falling back to default.",
        variant: "destructive"
      });
      
      // Fallback to default theme
      const defaultTheme = availableThemes.find(t => t.is_default) || getBuiltInDefaultTheme();
      if (defaultTheme.name !== theme.name) {
        applyTheme(defaultTheme);
      }
    }
  };

  const applyCustomCSS = (css: string, themeName: string) => {
    // Clean up any existing child theme styles before applying new ones
    removeCustomCSS();
    const styleId = `child-theme-${themeName}`;
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = css;
  };

  const removeCustomCSS = (_themeName?: string) => {
    const existing = document.querySelectorAll('style[id^="child-theme-"]');
    existing.forEach((el) => el.parentElement?.removeChild(el));
  };

  const switchTheme = async (themeId: string) => {
    try {
      // Update database to set new active theme
      const { error } = await supabase
        .from('child_themes')
        .update({ is_active: true })
        .eq('id', themeId);

      if (error) throw error;

      // Reload themes to get updated state
      await loadThemes();

      toast({
        title: "Theme Switched",
        description: "Theme has been successfully changed.",
      });
    } catch (err) {
      console.error('Error switching theme:', err);
      toast({
        title: "Error",
        description: "Failed to switch theme. Please try again.",
        variant: "destructive"
      });
    }
  };

  const previewTheme = (theme: ChildTheme) => {
    applyTheme(theme);
  };

  const resetToActive = () => {
    if (currentTheme) {
      applyTheme(currentTheme);
    }
  };

  const getBuiltInDefaultTheme = (): ChildTheme => ({
    id: 'built-in-default',
    name: 'built-in-default',
    display_name: 'Built-in Default',
    description: 'Fallback default theme',
    version: '1.0.0',
    is_active: false,
    is_default: true,
    theme_config: {
      colors: {
        primary: "35 85% 65%",
        secondary: "230 15% 16%",
        accent: "230 15% 17%",
        background: "230 15% 9%",
        foreground: "35 20% 92%",
        manga_red: "0 60% 58%",
        manga_gold: "35 85% 65%",
        manga_blue: "210 70% 65%"
      },
      fonts: {
        heading: "Inter",
        body: "Inter"
      },
      spacing: {
        scale: 1.0
      },
      borderRadius: "0.75rem",
      animations: {
        enabled: true,
        duration: "300ms"
      }
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Listen for real-time theme changes
  useEffect(() => {
    const subscription = supabase
      .channel('child_themes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'child_themes'
        },
        () => {
          loadThemes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    currentTheme,
    availableThemes,
    loading,
    error,
    switchTheme,
    previewTheme,
    resetToActive,
    refreshThemes: loadThemes
  };
};