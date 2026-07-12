import { useState, useCallback, useRef } from 'react';
import { ChildTheme } from './useChildTheme';
import { componentRegistry } from '@/components/themes/ComponentRegistry';

interface PreviewState {
  themeId: string | null;
  isPreviewMode: boolean;
  originalTheme: ChildTheme | null;
}

export const useThemePreview = () => {
  const [previewState, setPreviewState] = useState<PreviewState>({
    themeId: null,
    isPreviewMode: false,
    originalTheme: null
  });
  
  const previewTimeoutRef = useRef<NodeJS.Timeout>();

  // Enhancement 1: Live preview switching without full reload
  const startLivePreview = useCallback((theme: ChildTheme, originalTheme: ChildTheme) => {
    // Clear any existing preview
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    // Apply theme temporarily
    applyThemePreview(theme);
    
    setPreviewState({
      themeId: theme.id,
      isPreviewMode: true,
      originalTheme
    });

    // Load theme components for preview
    componentRegistry.loadThemeComponents(theme);
  }, []);

  const endLivePreview = useCallback(() => {
    if (previewState.originalTheme) {
      applyThemePreview(previewState.originalTheme);
    }
    
    setPreviewState({
      themeId: null,
      isPreviewMode: false,
      originalTheme: null
    });
  }, [previewState.originalTheme]);

  const applyThemePreview = (theme: ChildTheme) => {
    const root = document.documentElement;
    const config = theme.theme_config;

    // Apply colors
    if (config.colors) {
      Object.entries(config.colors).forEach(([key, value]) => {
        const cssVar = key.replace(/_/g, '-');
        root.style.setProperty(`--${cssVar}`, value as string);
      });
    }

    // Apply other theme properties
    if (config.borderRadius) {
      root.style.setProperty('--radius', config.borderRadius);
    }

    if (config.spacing?.scale) {
      root.style.setProperty('--spacing-scale', config.spacing.scale.toString());
    }

    // Apply custom CSS
    if (theme.custom_css) {
      const styleId = `preview-theme-${theme.id}`;
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = theme.custom_css;
    }
  };

  return {
    previewState,
    startLivePreview,
    endLivePreview,
    isPreviewMode: previewState.isPreviewMode
  };
};