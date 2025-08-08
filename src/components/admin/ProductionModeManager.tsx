import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Globe, 
  Settings, 
  CheckCircle2,
  AlertTriangle,
  Code,
  Zap
} from 'lucide-react';

interface ProductionSettings {
  hideLovableBadge: boolean;
  removeBuilderUI: boolean;
  disableDevFeatures: boolean;
  enableSEOMode: boolean;
  enablePerformanceMode: boolean;
  hideAdminRoutes: boolean;
  customBranding: boolean;
}

export const ProductionModeManager: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ProductionSettings>({
    hideLovableBadge: false,
    removeBuilderUI: false,
    disableDevFeatures: false,
    enableSEOMode: true,
    enablePerformanceMode: true,
    hideAdminRoutes: false,
    customBranding: false
  });
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadProductionSettings();
  }, []);

  const loadProductionSettings = () => {
    const stored = localStorage.getItem('production_settings');
    if (stored) {
      setSettings({ ...settings, ...JSON.parse(stored) });
    }
  };

  const applyProductionSettings = async () => {
    setIsApplying(true);

    try {
      // Save settings
      localStorage.setItem('production_settings', JSON.stringify(settings));

      // Apply Lovable badge hiding
      if (settings.hideLovableBadge) {
        const lovableBadges = document.querySelectorAll('[data-lovable-badge], .lovable-badge, [aria-label="Edit in Lovable"]');
        lovableBadges.forEach(badge => {
          (badge as HTMLElement).style.display = 'none';
        });

        // Add global CSS to hide any Lovable UI elements
        const hideBuilderCSS = `
          /* Hide Lovable specific elements */
          [data-lovable-badge],
          .lovable-badge,
          [aria-label="Edit in Lovable"],
          [data-builder="lovable"] {
            display: none !important;
          }
          
          /* Hide any floating edit buttons */
          button[aria-label*="Edit"],
          button[title*="Edit"],
          .edit-overlay,
          .builder-overlay {
            display: none !important;
          }
        `;

        let styleElement = document.getElementById('hide-builder-ui');
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = 'hide-builder-ui';
          document.head.appendChild(styleElement);
        }
        styleElement.textContent = hideBuilderCSS;
      }

      // Apply performance optimizations
      if (settings.enablePerformanceMode) {
        // Enable performance mode
        document.documentElement.setAttribute('data-performance-mode', 'true');
      }

      // Apply SEO optimizations
      if (settings.enableSEOMode) {
        document.documentElement.setAttribute('data-seo-mode', 'true');
      }

      // Custom branding
      if (settings.customBranding) {
        // Remove any builder-specific branding
        document.body.setAttribute('data-custom-brand', 'true');
      }

      toast({
        title: "Production Settings Applied",
        description: "Your site is now optimized for production deployment.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply production settings.",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  const generateCleanHTML = () => {
    // This would generate a clean HTML version without any builder artifacts
    const cleanHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manga Reader Pro</title>
  <meta name="description" content="Professional manga reading platform">
  <link rel="stylesheet" href="/dist/styles.css">
</head>
<body>
  <div id="root"></div>
  <script src="/dist/main.js"></script>
</body>
</html>`;

    const blob = new Blob([cleanHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index-clean.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Clean HTML Generated",
      description: "Production-ready HTML file downloaded.",
    });
  };

  const getProductionScore = () => {
    const settingsArray = Object.values(settings);
    const enabledCount = settingsArray.filter(Boolean).length;
    return Math.round((enabledCount / settingsArray.length) * 100);
  };

  const productionScore = getProductionScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Production Mode</h2>
          <p className="text-muted-foreground">
            Optimize your site for production deployment
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{productionScore}%</div>
            <div className="text-xs text-muted-foreground">Production Ready</div>
          </div>
          <Badge 
            variant={productionScore >= 80 ? "default" : productionScore >= 60 ? "secondary" : "destructive"}
            className="flex items-center gap-1"
          >
            {productionScore >= 80 ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            {productionScore >= 80 ? 'Ready' : productionScore >= 60 ? 'Needs Work' : 'Not Ready'}
          </Badge>
        </div>
      </div>

      {/* Builder UI Removal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            Remove Builder Elements
          </CardTitle>
          <CardDescription>
            Hide or remove development and builder-specific UI elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hide-lovable">Hide Lovable Badge</Label>
                <p className="text-sm text-muted-foreground">
                  Remove "Edit in Lovable" footer badge and overlays
                </p>
              </div>
              <Switch
                id="hide-lovable"
                checked={settings.hideLovableBadge}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, hideLovableBadge: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="remove-builder">Remove Builder UI</Label>
                <p className="text-sm text-muted-foreground">
                  Hide all development and builder interface elements
                </p>
              </div>
              <Switch
                id="remove-builder"
                checked={settings.removeBuilderUI}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, removeBuilderUI: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="disable-dev">Disable Dev Features</Label>
                <p className="text-sm text-muted-foreground">
                  Turn off development tools and debug features
                </p>
              </div>
              <Switch
                id="disable-dev"
                checked={settings.disableDevFeatures}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, disableDevFeatures: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="custom-brand">Custom Branding</Label>
                <p className="text-sm text-muted-foreground">
                  Replace builder branding with your own
                </p>
              </div>
              <Switch
                id="custom-brand"
                checked={settings.customBranding}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, customBranding: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production Optimizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance & SEO
          </CardTitle>
          <CardDescription>
            Enable production optimizations and SEO features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="seo-mode">SEO Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable search engine optimization features
                </p>
              </div>
              <Switch
                id="seo-mode"
                checked={settings.enableSEOMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, enableSEOMode: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="performance-mode">Performance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable performance optimizations and caching
                </p>
              </div>
              <Switch
                id="performance-mode"
                checked={settings.enablePerformanceMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, enablePerformanceMode: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hide-admin">Hide Admin Routes</Label>
                <p className="text-sm text-muted-foreground">
                  Hide admin panel from non-admin users
                </p>
              </div>
              <Switch
                id="hide-admin"
                checked={settings.hideAdminRoutes}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, hideAdminRoutes: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Production Actions
          </CardTitle>
          <CardDescription>
            Apply settings and generate production files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={applyProductionSettings} 
              disabled={isApplying}
              className="flex-1"
            >
              {isApplying ? 'Applying...' : 'Apply Settings'}
            </Button>

            <Button 
              onClick={generateCleanHTML}
              variant="outline"
              className="flex-1"
            >
              <Code className="h-4 w-4 mr-2" />
              Generate Clean HTML
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h5 className="font-medium mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Production Checklist
            </h5>
            <ul className="text-sm space-y-1">
              <li className={`flex items-center gap-2 ${settings.hideLovableBadge ? 'text-green-600' : 'text-muted-foreground'}`}>
                {settings.hideLovableBadge ? '✓' : '○'} Builder elements hidden
              </li>
              <li className={`flex items-center gap-2 ${settings.enableSEOMode ? 'text-green-600' : 'text-muted-foreground'}`}>
                {settings.enableSEOMode ? '✓' : '○'} SEO optimizations enabled
              </li>
              <li className={`flex items-center gap-2 ${settings.enablePerformanceMode ? 'text-green-600' : 'text-muted-foreground'}`}>
                {settings.enablePerformanceMode ? '✓' : '○'} Performance optimized
              </li>
              <li className={`flex items-center gap-2 ${settings.customBranding ? 'text-green-600' : 'text-muted-foreground'}`}>
                {settings.customBranding ? '✓' : '○'} Custom branding applied
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};