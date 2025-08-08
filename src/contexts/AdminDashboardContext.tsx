import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DashboardTheme = 'white' | 'dark' | 'custom';
export type MangaMode = 'single' | 'multi';

interface AdminDashboardContextType {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
  mangaMode: MangaMode;
  setMangaMode: (mode: MangaMode) => void;
  customThemeColor: string;
  setCustomThemeColor: (color: string) => void;
  isCompactMode: boolean;
  setIsCompactMode: (compact: boolean) => void;
}

const AdminDashboardContext = createContext<AdminDashboardContextType | undefined>(undefined);

export const useAdminDashboard = () => {
  const context = useContext(AdminDashboardContext);
  if (!context) {
    throw new Error('useAdminDashboard must be used within AdminDashboardProvider');
  }
  return context;
};

interface AdminDashboardProviderProps {
  children: ReactNode;
}

export const AdminDashboardProvider = ({ children }: AdminDashboardProviderProps) => {
  const [theme, setTheme] = useState<DashboardTheme>(() => {
    return (localStorage.getItem('admin-dashboard-theme') as DashboardTheme) || 'dark';
  });
  
  const [mangaMode, setMangaMode] = useState<MangaMode>(() => {
    return (localStorage.getItem('admin-manga-mode') as MangaMode) || 'multi';
  });
  
  const [customThemeColor, setCustomThemeColor] = useState(() => {
    return localStorage.getItem('admin-custom-theme-color') || '#3b82f6';
  });
  
  const [isCompactMode, setIsCompactMode] = useState(() => {
    return localStorage.getItem('admin-compact-mode') === 'true';
  });

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    // Reset all theme classes
    root.classList.remove('admin-theme-white', 'admin-theme-dark', 'admin-theme-custom');
    
    // Apply current theme
    root.classList.add(`admin-theme-${theme}`);
    
    if (theme === 'custom') {
      // Apply custom color as CSS variable
      const hsl = hexToHsl(customThemeColor);
      root.style.setProperty('--admin-custom-primary', hsl);
      root.style.setProperty('--admin-custom-primary-foreground', '0 0% 98%');
    }
    
    localStorage.setItem('admin-dashboard-theme', theme);
  }, [theme, customThemeColor]);

  useEffect(() => {
    localStorage.setItem('admin-manga-mode', mangaMode);
  }, [mangaMode]);

  useEffect(() => {
    localStorage.setItem('admin-custom-theme-color', customThemeColor);
  }, [customThemeColor]);

  useEffect(() => {
    localStorage.setItem('admin-compact-mode', isCompactMode.toString());
  }, [isCompactMode]);

  const value = {
    theme,
    setTheme,
    mangaMode,
    setMangaMode,
    customThemeColor,
    setCustomThemeColor,
    isCompactMode,
    setIsCompactMode,
  };

  return (
    <AdminDashboardContext.Provider value={value}>
      {children}
    </AdminDashboardContext.Provider>
  );
};

// Utility function to convert hex to HSL
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}