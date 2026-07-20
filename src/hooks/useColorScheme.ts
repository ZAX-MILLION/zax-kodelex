import { useEffect } from 'react';
import { appConfig } from '@/config/env';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';

interface ColorSettings {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  foreground_color?: string;
  manga_red?: string;
  manga_gold?: string;
  manga_blue?: string;
}

// Convert hex to HSL
const hexToHsl = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const applyColorScheme = (colors: ColorSettings) => {
  const root = document.documentElement;

  if (colors.primary_color) {
    root.style.setProperty('--primary', hexToHsl(colors.primary_color));
    root.style.setProperty('--manga-gold', hexToHsl(colors.primary_color));
  }
  
  if (colors.secondary_color) {
    root.style.setProperty('--secondary', hexToHsl(colors.secondary_color));
  }
  
  if (colors.accent_color) {
    root.style.setProperty('--accent', hexToHsl(colors.accent_color));
  }
  
  if (colors.background_color) {
    root.style.setProperty('--background', hexToHsl(colors.background_color));
    root.style.setProperty('--card', hexToHsl(colors.background_color));
  }
  
  if (colors.foreground_color) {
    root.style.setProperty('--foreground', hexToHsl(colors.foreground_color));
    root.style.setProperty('--card-foreground', hexToHsl(colors.foreground_color));
  }
  
  if (colors.manga_red) {
    root.style.setProperty('--manga-red', hexToHsl(colors.manga_red));
  }
  
  if (colors.manga_gold) {
    root.style.setProperty('--manga-gold', hexToHsl(colors.manga_gold));
  }
  
  if (colors.manga_blue) {
    root.style.setProperty('--manga-blue', hexToHsl(colors.manga_blue));
  }
};

export const useColorScheme = () => {
  useEffect(() => {
    // Public demo / offline: never query or subscribe.
    if (appConfig.isDemo || !isSupabaseConfigured) {
      return;
    }

    const loadColorScheme = async () => {
      try {
        // Check if child theme system is handling colors
        const activeTheme = document.documentElement.style.getPropertyValue('--primary');
        if (activeTheme) {
          // Child theme system is active, don't override
          return;
        }

        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading color scheme:', error);
          return;
        }

        if (data) {
          const colorData = data as any;
          applyColorScheme({
            primary_color: colorData.primary_color,
            secondary_color: colorData.secondary_color,
            accent_color: colorData.accent_color,
            background_color: colorData.background_color,
            foreground_color: colorData.foreground_color,
            manga_red: colorData.manga_red,
            manga_gold: colorData.manga_gold,
            manga_blue: colorData.manga_blue,
          });
        }
      } catch (error) {
        console.error('Failed to load color scheme:', error);
      }
    };

    // Delay loading to allow child theme system to initialize first
    const timer = setTimeout(loadColorScheme, 100);

    // Listen for realtime updates
    const subscription = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings'
        },
        (payload) => {
          if (payload.new) {
            applyColorScheme(payload.new as ColorSettings);
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  return { applyColorScheme };
};