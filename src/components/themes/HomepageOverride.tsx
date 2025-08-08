import React, { useEffect } from 'react';
import { useChildTheme } from '@/hooks/useChildTheme';
import { ComponentOverride, componentRegistry } from './ComponentRegistry';
import { ThemeErrorBoundary } from './ThemeErrorBoundary';

interface HomepageOverrideProps {
  defaultHomepage: React.ComponentType;
}

export const HomepageOverride: React.FC<HomepageOverrideProps> = ({ 
  defaultHomepage: DefaultHomepage 
}) => {
  const { currentTheme } = useChildTheme();
  
  // Load theme components when theme changes
  useEffect(() => {
    if (currentTheme) {
      componentRegistry.loadThemeComponents(currentTheme).catch(error => {
        console.error('Failed to load theme components:', error);
      });
    }
  }, [currentTheme]);

  // If no current theme, use default
  if (!currentTheme) {
    return <DefaultHomepage />;
  }

  // If current theme has no homepage override, use default
  if (!currentTheme.homepage_component) {
    return <DefaultHomepage />;
  }

  // Use the secure component override system
  return (
    <ThemeErrorBoundary 
      themeId={currentTheme.id}
      componentName="Homepage"
      fallback={<DefaultHomepage />}
    >
      <ComponentOverride
        themeId={currentTheme.id}
        componentName="Homepage"
        fallback={DefaultHomepage}
      />
    </ThemeErrorBoundary>
  );
};