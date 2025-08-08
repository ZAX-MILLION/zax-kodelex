import { useState, useEffect } from 'react';
import { ChildTheme } from './useChildTheme';
import { componentRegistry } from '@/components/themes/ComponentRegistry';

interface RouteOverride {
  path: string;
  componentName: string;
  themeId: string;
}

interface RouteOverrides {
  '/': string | null; // Homepage
  '/chapters': string | null; // Chapters page
  '/reader': string | null; // Reader page
  '/profile': string | null; // Profile page
  '/support': string | null; // Support page
}

export const useRouteOverrides = (currentTheme: ChildTheme | null) => {
  const [routeOverrides, setRouteOverrides] = useState<RouteOverrides>({
    '/': null,
    '/chapters': null,
    '/reader': null,
    '/profile': null,
    '/support': null
  });

  useEffect(() => {
    if (!currentTheme) return;

    // Load theme components when theme changes
    componentRegistry.loadThemeComponents(currentTheme);

    // Enhancement 2: Support for additional route overrides
    const overrides: RouteOverrides = {
      '/': currentTheme.homepage_component || null,
      '/chapters': currentTheme.layout_overrides?.chapters || null,
      '/reader': currentTheme.layout_overrides?.reader || null,
      '/profile': currentTheme.layout_overrides?.profile || null,
      '/support': currentTheme.layout_overrides?.support || null
    };

    setRouteOverrides(overrides);
  }, [currentTheme]);

  const getComponentForRoute = (path: string) => {
    if (!currentTheme) return null;
    
    const componentName = routeOverrides[path as keyof RouteOverrides];
    if (!componentName) return null;

    // First try the specific component name, then fallback to "Homepage"
    let component = componentRegistry.getComponent(currentTheme.id, componentName);
    if (!component && path === '/') {
      component = componentRegistry.getComponent(currentTheme.id, 'Homepage');
    }
    
    return component;
  };

  const hasOverrideForRoute = (path: string): boolean => {
    return routeOverrides[path as keyof RouteOverrides] !== null;
  };

  return {
    routeOverrides,
    getComponentForRoute,
    hasOverrideForRoute
  };
};