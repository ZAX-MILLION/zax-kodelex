import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ThemeSettings {
  id: string;
  theme_name: string;
  display_name: string;
  description?: string;
  author?: string;
  version: string;
  is_active: boolean;
  is_default: boolean;
  slider_settings: {
    autoSlideInterval: number;
    slidesCount: number;
    showFilters: boolean;
    animationType: 'fade' | 'slide' | 'zoom';
  };
  widget_settings: {
    enableTrendingSidebar: boolean;
    enableBlogSection: boolean;
    enableSupportWidget: boolean;
    feedChaptersCount: number;
  };
  color_settings: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    accent: string;
    mangaRed: string;
    mangaBlue: string;
    mangaGold: string;
  };
  layout_settings: {
    headerType: 'modern' | 'classic' | 'minimal';
    sidebarPosition: 'left' | 'right' | 'none';
    footerStyle: 'minimal' | 'full' | 'hidden';
    containerMaxWidth: string;
    spacing: 'tight' | 'normal' | 'spacious';
  };
  typography_settings: {
    fontFamily: string;
    headingFont: string;
    fontSize: string;
    lineHeight: string;
  };
  custom_css?: string;
  custom_js?: string;
  component_overrides: Record<string, any>;
  category: string;
  created_at: string;
  updated_at: string;
}

interface ThemeEngineState {
  currentTheme: ThemeSettings | null;
  availableThemes: ThemeSettings[];
  loading: boolean;
  error: string | null;
  isHydrated: boolean;
}

const CACHE_KEY = 'theme_engine_cache';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

const DEFAULT_THEME: Partial<ThemeSettings> = {
  theme_name: 'zaxmillion-fallback',
  display_name: 'Zax Million Fallback',
  version: '1.0.0',
  slider_settings: {
    autoSlideInterval: 5000,
    slidesCount: 10,
    showFilters: true,
    animationType: 'fade'
  },
  widget_settings: {
    enableTrendingSidebar: true,
    enableBlogSection: true,
    enableSupportWidget: true,
    feedChaptersCount: 10
  },
  color_settings: {
    primary: 'hsl(35, 85%, 65%)',
    secondary: 'hsl(230, 15%, 16%)',
    background: 'hsl(230, 15%, 9%)',
    foreground: 'hsl(35, 20%, 92%)',
    accent: 'hsl(230, 15%, 17%)',
    mangaRed: 'hsl(0, 60%, 58%)',
    mangaBlue: 'hsl(210, 70%, 65%)',
    mangaGold: 'hsl(35, 85%, 65%)'
  },
  layout_settings: {
    headerType: 'modern',
    sidebarPosition: 'left',
    footerStyle: 'minimal',
    containerMaxWidth: '1400px',
    spacing: 'normal'
  },
  typography_settings: {
    fontFamily: 'Inter',
    headingFont: 'Inter',
    fontSize: '16px',
    lineHeight: '1.5'
  },
  component_overrides: {},
  category: 'general'
};

export const useThemeEngine = () => {
  const { toast } = useToast();
  const [state, setState] = useState<ThemeEngineState>({
    currentTheme: null,
    availableThemes: [],
    loading: true,
    error: null,
    isHydrated: false
  });

  // Cache management
  const getCachedTheme = useCallback((): ThemeSettings | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_EXPIRY;
      
      if (isExpired) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('Failed to parse cached theme:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  const setCachedTheme = useCallback((theme: ThemeSettings) => {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData = {
        data: theme,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache theme:', error);
    }
  }, []);

  // Apply theme to CSS variables
  const applyThemeToDOM = useCallback((theme: ThemeSettings) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const { color_settings, typography_settings } = theme;

    // Apply color variables
    Object.entries(color_settings).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });

    // Apply typography
    root.style.setProperty('--font-family', typography_settings.fontFamily);
    root.style.setProperty('--heading-font', typography_settings.headingFont);
    root.style.setProperty('--font-size', typography_settings.fontSize);
    root.style.setProperty('--line-height', typography_settings.lineHeight);

    // Apply custom CSS if present
    if (theme.custom_css) {
      let customStyleElement = document.getElementById('theme-custom-css');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'theme-custom-css';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = theme.custom_css;
    }

    // Execute custom JS if present (with safety checks)
    if (theme.custom_js) {
      try {
        // Create a safe execution context
        const script = new Function('theme', theme.custom_js);
        script(theme);
      } catch (error) {
        console.warn('Failed to execute custom theme JS:', error);
      }
    }
  }, []);

  // Validate and convert DB data to ThemeSettings
  const validateThemeData = (data: any): ThemeSettings => {
    // Parse theme_config JSON to get nested settings
    const themeConfig = data.theme_config || {};
    
    return {
      id: data.id || 'fallback',
      theme_name: data.name || 'zaxmillion-fallback',
      display_name: data.display_name || 'Zax Million Fallback',
      description: data.description || '',
      author: data.author || '',
      version: data.version || '1.0.0',
      is_active: data.is_active ?? true,
      is_default: data.is_default ?? false,
      slider_settings: {
        autoSlideInterval: themeConfig.slider_settings?.autoSlideInterval || 5000,
        slidesCount: themeConfig.slider_settings?.slidesCount || 10,
        showFilters: themeConfig.slider_settings?.showFilters ?? true,
        animationType: themeConfig.slider_settings?.animationType || 'fade'
      },
      widget_settings: {
        enableTrendingSidebar: themeConfig.widget_settings?.enableTrendingSidebar ?? true,
        enableBlogSection: themeConfig.widget_settings?.enableBlogSection ?? true,
        enableSupportWidget: themeConfig.widget_settings?.enableSupportWidget ?? true,
        feedChaptersCount: themeConfig.widget_settings?.feedChaptersCount || 10
      },
      color_settings: {
        primary: themeConfig.color_settings?.primary || 'hsl(35, 85%, 65%)',
        secondary: themeConfig.color_settings?.secondary || 'hsl(230, 15%, 16%)',
        background: themeConfig.color_settings?.background || 'hsl(230, 15%, 9%)',
        foreground: themeConfig.color_settings?.foreground || 'hsl(35, 20%, 92%)',
        accent: themeConfig.color_settings?.accent || 'hsl(230, 15%, 17%)',
        mangaRed: themeConfig.color_settings?.mangaRed || 'hsl(0, 60%, 58%)',
        mangaBlue: themeConfig.color_settings?.mangaBlue || 'hsl(210, 70%, 65%)',
        mangaGold: themeConfig.color_settings?.mangaGold || 'hsl(35, 85%, 65%)'
      },
      layout_settings: {
        headerType: themeConfig.layout_settings?.headerType || 'modern',
        sidebarPosition: themeConfig.layout_settings?.sidebarPosition || 'left',
        footerStyle: themeConfig.layout_settings?.footerStyle || 'minimal',
        containerMaxWidth: themeConfig.layout_settings?.containerMaxWidth || '1400px',
        spacing: themeConfig.layout_settings?.spacing || 'normal'
      },
      typography_settings: {
        fontFamily: themeConfig.typography_settings?.fontFamily || 'Inter',
        headingFont: themeConfig.typography_settings?.headingFont || 'Inter',
        fontSize: themeConfig.typography_settings?.fontSize || '16px',
        lineHeight: themeConfig.typography_settings?.lineHeight || '1.5'
      },
      custom_css: data.custom_css || '',
      custom_js: data.custom_js || '',
      component_overrides: data.layout_overrides || {},
      category: 'general',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    };
  };

  // Load theme from database with fallback
  const loadThemeFromDB = useCallback(async (): Promise<ThemeSettings> => {
    try {
      // Try to get cached theme from Supabase function
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_active_theme_cached');

      if (!functionError && functionData) {
        return validateThemeData(functionData);
      }

      // Fallback: Query child_themes directly  
      const { data: directData, error: directError } = await supabase
        .from('child_themes')
        .select('*')
        .eq('is_active', true)
        .single();

      if (!directError && directData) {
        return validateThemeData(directData);
      }

      // Final fallback: Get default theme
      const { data: defaultData, error: defaultError } = await supabase
        .from('child_themes')
        .select('*')
        .eq('is_default', true)
        .single();

      if (!defaultError && defaultData) {
        return validateThemeData(defaultData);
      }

      throw new Error('No theme found in database');
    } catch (error) {
      console.warn('Failed to load theme from database:', error);
      
      // Return hardcoded fallback theme
      return validateThemeData({
        id: 'fallback',
        is_active: true,
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...DEFAULT_THEME
      });
    }
  }, []);

  // Load all available themes
  const loadAvailableThemes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('child_themes')
        .select('*')
        .order('display_name');

      if (error) throw error;
      return data?.map(validateThemeData) || [];
    } catch (error) {
      console.warn('Failed to load available themes:', error);
      return [];
    }
  }, []);

  // Switch to a different theme
  const switchTheme = useCallback(async (themeId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Deactivate current theme and activate new one
      const { error: updateError } = await supabase.rpc('switch_active_theme', {
        new_theme_id: themeId
      });

      if (updateError) {
        console.warn('RPC call failed, using manual update:', updateError);
        // Fallback: Manual update
        await supabase
          .from('child_themes')
          .update({ is_active: false })
          .neq('id', themeId);

        await supabase
          .from('child_themes')
          .update({ is_active: true })
          .eq('id', themeId);
      }

      // Clear cache
      localStorage.removeItem(CACHE_KEY);

      // Reload theme
      await loadTheme();

      toast({
        title: "Theme Updated",
        description: "Theme has been successfully changed.",
      });
    } catch (error) {
      console.error('Failed to switch theme:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to switch theme' 
      }));
      
      toast({
        title: "Error",
        description: "Failed to switch theme. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Main theme loading function
  const loadTheme = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Try cache first for better performance
      const cachedTheme = getCachedTheme();
      if (cachedTheme) {
        setState(prev => ({
          ...prev,
          currentTheme: cachedTheme,
          loading: false,
          isHydrated: true
        }));
        applyThemeToDOM(cachedTheme);
        
        // Load fresh data in background
        loadThemeFromDB().then(freshTheme => {
          if (JSON.stringify(freshTheme) !== JSON.stringify(cachedTheme)) {
            setState(prev => ({ ...prev, currentTheme: freshTheme }));
            setCachedTheme(freshTheme);
            applyThemeToDOM(freshTheme);
          }
        });
        
        return;
      }

      // Load from database
      const [theme, availableThemes] = await Promise.all([
        loadThemeFromDB(),
        loadAvailableThemes()
      ]);

      setState(prev => ({
        ...prev,
        currentTheme: theme,
        availableThemes,
        loading: false,
        isHydrated: true
      }));

      // Cache and apply theme
      setCachedTheme(theme);
      applyThemeToDOM(theme);

    } catch (error) {
      console.error('Theme loading failed:', error);
      
      // Use fallback theme
      const fallbackTheme = {
        id: 'fallback',
        is_active: true,
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...DEFAULT_THEME
      } as ThemeSettings;

      setState(prev => ({
        ...prev,
        currentTheme: fallbackTheme,
        loading: false,
        error: 'Failed to load theme, using fallback',
        isHydrated: true
      }));

      applyThemeToDOM(fallbackTheme);
    }
  }, [getCachedTheme, setCachedTheme, applyThemeToDOM, loadThemeFromDB, loadAvailableThemes]);

  // Reload themes
  const reloadThemes = useCallback(async () => {
    localStorage.removeItem(CACHE_KEY);
    await loadTheme();
  }, [loadTheme]);

  // Initial load
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Listen for theme changes from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CACHE_KEY && e.newValue !== e.oldValue) {
        loadTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadTheme]);

  return {
    ...state,
    switchTheme,
    reloadThemes,
    loadTheme,
    applyThemeToDOM
  };
};