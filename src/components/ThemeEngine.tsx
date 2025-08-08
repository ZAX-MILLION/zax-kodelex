import React, { useEffect, useState } from 'react';
import { useThemeEngineContext } from '@/contexts/ThemeEngineContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Palette } from 'lucide-react';

interface ThemeEngineProps {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  showLoadingOnSwitch?: boolean;
}

export const ThemeEngine: React.FC<ThemeEngineProps> = ({
  children,
  fallbackComponent,
  loadingComponent,
  showLoadingOnSwitch = false
}) => {
  const { 
    currentTheme, 
    loading, 
    error, 
    isHydrated,
    applyThemeToDOM 
  } = useThemeEngineContext();
  
  const [isClient, setIsClient] = useState(false);
  const [showThemeTransition, setShowThemeTransition] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Apply theme changes with smooth transition
  useEffect(() => {
    if (currentTheme && isClient) {
      if (showLoadingOnSwitch) {
        setShowThemeTransition(true);
        
        // Small delay for smooth transition
        const timer = setTimeout(() => {
          applyThemeToDOM(currentTheme);
          setShowThemeTransition(false);
        }, 150);
        
        return () => clearTimeout(timer);
      } else {
        applyThemeToDOM(currentTheme);
      }
    }
  }, [currentTheme, isClient, applyThemeToDOM, showLoadingOnSwitch]);

  // SSR-safe rendering
  if (!isClient || !isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        {loadingComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <Palette className="mx-auto h-8 w-8 animate-pulse text-primary" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show transition overlay when switching themes
  if (showThemeTransition) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Palette className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Applying theme...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with fallback
  if (error && !currentTheme) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto mt-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load theme: {error}
              {fallbackComponent && (
                <div className="mt-4">
                  <p className="text-sm">Using fallback theme...</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
        {fallbackComponent || children}
      </div>
    );
  }

  // Show loading state
  if (loading && !currentTheme) {
    return (
      <div className="min-h-screen bg-background">
        {loadingComponent || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <Palette className="mx-auto h-8 w-8 animate-pulse text-primary" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <p className="text-sm text-muted-foreground">Loading theme...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render children with loaded theme
  return (
    <div 
      className="theme-engine-wrapper"
      data-theme={currentTheme?.theme_name}
      data-theme-version={currentTheme?.version}
    >
      {children}
    </div>
  );
};