import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Tablet, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { ChildTheme } from '@/hooks/useChildTheme';
import { ThemeErrorBoundary } from '../themes/ThemeErrorBoundary';
import { ComponentOverride, componentRegistry } from '../themes/ComponentRegistry';
import Home from '@/pages/Home';

interface ThemePreviewProps {
  theme: ChildTheme;
  isActive?: boolean;
  onApplyTheme?: (themeId: string) => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportSizes = {
  desktop: { width: '100%', height: '600px' },
  tablet: { width: '768px', height: '600px' },
  mobile: { width: '375px', height: '600px' }
};

export const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  isActive = false,
  onApplyTheme
}) => {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load theme components when component mounts
  useEffect(() => {
    componentRegistry.loadThemeComponents(theme).catch(error => {
      console.error('Failed to load theme components for preview:', error);
    });
  }, [theme]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    componentRegistry.hotReload(theme);
  };

  const handleTogglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const renderHomepagePreview = () => {
    if (theme.homepage_component) {
      return (
        <ThemeErrorBoundary 
          themeId={theme.id}
          componentName="Homepage"
          fallback={<Home />}
        >
          <ComponentOverride
            themeId={theme.id}
            componentName="Homepage"
            fallback={Home}
          />
        </ThemeErrorBoundary>
      );
    }
    
    return <Home />;
  };

  const applyThemeTemporarily = () => {
    // Apply theme styles temporarily for preview
    const root = document.documentElement;
    const config = theme.theme_config;

    if (config.colors) {
      Object.entries(config.colors).forEach(([key, value]) => {
        const cssVar = key.replace(/_/g, '-');
        root.style.setProperty(`--preview-${cssVar}`, value);
      });
    }
  };

  const removeTemporaryStyles = () => {
    // Remove temporary preview styles
    const root = document.documentElement;
    const config = theme.theme_config;

    if (config.colors) {
      Object.keys(config.colors).forEach(key => {
        const cssVar = key.replace(/_/g, '-');
        root.style.removeProperty(`--preview-${cssVar}`);
      });
    }
  };

  // Apply temporary styles when preview mode is enabled
  useEffect(() => {
    if (isPreviewMode) {
      applyThemeTemporarily();
    } else {
      removeTemporaryStyles();
    }

    return () => {
      removeTemporaryStyles();
    };
  }, [isPreviewMode, theme]);

  return (
    <Card className="w-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{theme.display_name}</h3>
            {isActive && <Badge>Active</Badge>}
            {theme.homepage_component && <Badge variant="secondary">Custom Homepage</Badge>}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePreview}
              className="flex items-center gap-2"
            >
              {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isPreviewMode ? 'Exit Preview' : 'Preview'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            
            {onApplyTheme && (
              <Button
                size="sm"
                onClick={() => onApplyTheme(theme.id)}
                disabled={isActive}
              >
                Apply Theme
              </Button>
            )}
          </div>
        </div>

        <Tabs value={viewport} onValueChange={(value) => setViewport(value as ViewportSize)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="tablet" className="flex items-center gap-2">
              <Tablet className="h-4 w-4" />
              Tablet
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4">
        <div className="bg-muted rounded-lg p-4 flex justify-center">
          <div
            ref={previewRef}
            key={refreshKey}
            className="bg-background border border-border rounded-lg overflow-hidden shadow-lg transition-all duration-300"
            style={{
              width: viewportSizes[viewport].width,
              height: viewportSizes[viewport].height,
              maxWidth: '100%'
            }}
          >
            <div className="w-full h-full overflow-auto">
              {renderHomepagePreview()}
            </div>
          </div>
        </div>

        {theme.description && (
          <p className="text-sm text-muted-foreground mt-4">
            {theme.description}
          </p>
        )}

        {theme.author && (
          <p className="text-xs text-muted-foreground mt-2">
            By {theme.author} • Version {theme.version}
          </p>
        )}
      </div>
    </Card>
  );
};