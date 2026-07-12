import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChildTheme } from '@/hooks/useChildTheme';
import { ThemePreview } from './ThemePreview';

// Simplified version without database dependencies for now
export const SimpleEnhancedThemeManager: React.FC = () => {
  const { 
    currentTheme, 
    availableThemes, 
    loading, 
    switchTheme, 
    refreshThemes 
  } = useChildTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading themes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Theme Manager</h2>
          <p className="text-muted-foreground">
            Manage child themes with live preview (Database features pending migration)
          </p>
        </div>
        <Button onClick={refreshThemes} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableThemes.map((theme) => (
          <Card key={theme.id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{theme.display_name}</h3>
              <div className="flex items-center gap-2">
                {theme.is_active && (
                  <Badge variant="default">Active</Badge>
                )}
                {theme.homepage_component && (
                  <Badge variant="secondary">Custom Homepage</Badge>
                )}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {theme.description || 'No description'}
            </p>
            
            <div className="flex items-center gap-2">
              {!theme.is_active && (
                <Button
                  size="sm"
                  onClick={() => switchTheme(theme.id)}
                >
                  Apply Theme
                </Button>
              )}
            </div>
            
            <div className="mt-4">
              <ThemePreview
                theme={theme}
                isActive={theme.is_active}
                onApplyTheme={switchTheme}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};