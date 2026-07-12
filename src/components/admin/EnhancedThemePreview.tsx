import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChildTheme } from '@/hooks/useChildTheme';
import { componentRegistry } from '@/components/themes/ComponentRegistry';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Download,
  Check
} from 'lucide-react';

interface EnhancedThemePreviewProps {
  theme: ChildTheme;
  isActive?: boolean;
  onApplyTheme?: (themeId: string) => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export const EnhancedThemePreview: React.FC<EnhancedThemePreviewProps> = ({
  theme,
  isActive = false,
  onApplyTheme
}) => {
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load theme components when preview loads
  useEffect(() => {
    if (theme.homepage_component) {
      componentRegistry.loadThemeComponents(theme);
    }
  }, [theme]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Hot-reload theme components
      await componentRegistry.hotReload(theme);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const renderHomepagePreview = () => {
    const HomepageComponent = componentRegistry.getComponent(theme.id, 'Homepage');
    
    if (HomepageComponent) {
      return <HomepageComponent />;
    }

    // Fallback preview
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <h1 className="text-4xl font-bold text-foreground">{theme.display_name}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {theme.description || 'Experience this beautiful theme'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="px-8 py-3">Get Started</Button>
            <Button variant="outline" className="px-8 py-3">Learn More</Button>
          </div>
        </div>
      </div>
    );
  };

  // Apply theme styles temporarily for preview
  useEffect(() => {
    if (isPreviewMode) {
      applyThemeTemporarily();
    } else {
      removeTemporaryStyles();
    }

    return () => removeTemporaryStyles();
  }, [isPreviewMode, theme]);

  const applyThemeTemporarily = () => {
    const root = document.documentElement;
    const config = theme.theme_config;

    if (config.colors) {
      Object.entries(config.colors).forEach(([key, value]) => {
        const cssVar = key.replace(/_/g, '-');
        root.style.setProperty(`--preview-${cssVar}`, value as string);
        root.style.setProperty(`--${cssVar}`, value as string);
      });
    }

    if (config.borderRadius) {
      root.style.setProperty('--preview-radius', config.borderRadius);
      root.style.setProperty('--radius', config.borderRadius);
    }

    // Apply custom CSS if present
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

  const removeTemporaryStyles = () => {
    const root = document.documentElement;
    const config = theme.theme_config;

    if (config.colors) {
      Object.keys(config.colors).forEach((key) => {
        const cssVar = key.replace(/_/g, '-');
        root.style.removeProperty(`--preview-${cssVar}`);
      });
    }

    root.style.removeProperty('--preview-radius');

    const styleElement = document.getElementById(`preview-theme-${theme.id}`);
    if (styleElement) {
      styleElement.remove();
    }
  };

  const getViewportDimensions = () => {
    switch (viewportSize) {
      case 'desktop':
        return { width: '100%', height: '600px' };
      case 'tablet':
        return { width: '768px', height: '600px' };
      case 'mobile':
        return { width: '375px', height: '600px' };
      default:
        return { width: '100%', height: '600px' };
    }
  };

  const dimensions = getViewportDimensions();

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {theme.display_name}
              {isActive && <Badge>Active</Badge>}
              {theme.homepage_component && <Badge variant="secondary">Custom Homepage</Badge>}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {theme.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTogglePreview}
            >
              {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isPreviewMode ? 'Exit Preview' : 'Live Preview'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Viewport Selection */}
        <Tabs value={viewportSize} onValueChange={(value) => setViewportSize(value as ViewportSize)}>
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

        {/* Preview Area */}
        <div className="border rounded-lg overflow-hidden bg-background">
          <div 
            className="mx-auto transition-all duration-300 overflow-hidden"
            style={dimensions}
          >
            <div className="h-full overflow-y-auto">
              {renderHomepagePreview()}
            </div>
          </div>
        </div>

        {/* Theme Info */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              v{theme.version} • {theme.author || 'Unknown Author'}
            </div>
            <div className="flex gap-1">
              {theme.theme_config?.colors && Object.entries(theme.theme_config.colors).slice(0, 5).map(([key, value]) => (
                <div
                  key={key}
                  className="w-4 h-4 rounded-full border border-background shadow-sm"
                  style={{ backgroundColor: `hsl(${value})` }}
                  title={key}
                />
              ))}
            </div>
          </div>
          
          {onApplyTheme && (
            <Button 
              onClick={() => onApplyTheme(theme.id)}
              disabled={isActive}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {isActive ? 'Active' : 'Apply Theme'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};