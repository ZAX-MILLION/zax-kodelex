import React, { createContext, useContext, ReactNode } from 'react';
import { useThemeEngine, ThemeSettings } from '@/hooks/useThemeEngine';

interface ThemeEngineContextValue {
  currentTheme: ThemeSettings | null;
  availableThemes: ThemeSettings[];
  loading: boolean;
  error: string | null;
  isHydrated: boolean;
  switchTheme: (themeId: string) => Promise<void>;
  reloadThemes: () => Promise<void>;
  loadTheme: () => Promise<void>;
  applyThemeToDOM: (theme: ThemeSettings) => void;
}

const ThemeEngineContext = createContext<ThemeEngineContextValue | undefined>(undefined);

export const useThemeEngineContext = () => {
  const context = useContext(ThemeEngineContext);
  if (context === undefined) {
    throw new Error('useThemeEngineContext must be used within a ThemeEngineProvider');
  }
  return context;
};

interface ThemeEngineProviderProps {
  children: ReactNode;
}

export const ThemeEngineProvider: React.FC<ThemeEngineProviderProps> = ({ children }) => {
  const themeEngine = useThemeEngine();

  return (
    <ThemeEngineContext.Provider value={themeEngine}>
      {children}
    </ThemeEngineContext.Provider>
  );
};