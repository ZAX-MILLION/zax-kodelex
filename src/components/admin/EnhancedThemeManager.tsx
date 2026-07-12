import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Eye, 
  Download, 
  Upload, 
  Users, 
  FileText, 
  Settings,
  Camera,
  Moon,
  Sun
} from 'lucide-react';
import { useChildTheme } from '@/hooks/useChildTheme';
import { useThemePreview } from '@/hooks/useThemePreview';
import { useThemeImportExport } from '@/hooks/useThemeImportExport';
import { ThemePreview } from './ThemePreview';
import { ThemeScreenshots } from './ThemeScreenshots';
import { ThemeChangelogManager } from './ThemeChangelogManager';
import { ThemeModeVariants } from './ThemeModeVariants';
import { componentRegistry } from '@/components/themes/ComponentRegistry';

export const EnhancedThemeManager: React.FC = () => {
  const { 
    currentTheme, 
    availableThemes, 
    loading, 
    switchTheme, 
    refreshThemes 
  } = useChildTheme();
  
  const { 
    previewState, 
    startLivePreview, 
    endLivePreview 
  } = useThemePreview();
  
  const { 
    exportTheme, 
    importTheme, 
    isExporting, 
    isImporting 
  } = useThemeImportExport();

  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  const handleLivePreview = (theme: any) => {
    if (previewState.isPreviewMode && previewState.themeId === theme.id) {
      endLivePreview();
    } else if (currentTheme) {
      startLivePreview(theme, currentTheme);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importTheme(file);
    }
  };

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
            Manage child themes with live preview, import/export, and advanced features
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
            id="theme-import"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('theme-import')?.click()}
            disabled={isImporting}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isImporting ? 'Importing...' : 'Import Theme'}
          </Button>
          
          <Button onClick={refreshThemes} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme List */}
        <Card className="lg:col-span-1 p-4">
          <h3 className="text-lg font-semibold mb-4">Available Themes</h3>
          <div className="space-y-2">
            {availableThemes.map((theme) => (
              <div
                key={theme.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTheme?.id === theme.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => setSelectedTheme(theme)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{theme.display_name}</h4>
                  <div className="flex items-center gap-1">
                    {theme.is_active && (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                    {theme.layout_overrides && (
                      <Badge variant="secondary" className="text-xs">+Layouts</Badge>
                    )}
                    {theme.theme_config.dark_variant && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Sun className="h-3 w-3" />
                        <Moon className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {theme.description || 'No description'}
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={previewState.themeId === theme.id ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLivePreview(theme);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    {previewState.themeId === theme.id ? 'End Preview' : 'Preview'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportTheme(theme);
                    }}
                    disabled={isExporting}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </Button>
                  
                  {!theme.is_active && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        switchTheme(theme.id);
                      }}
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Theme Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTheme ? (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="screenshots" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Screenshots
                </TabsTrigger>
                <TabsTrigger value="changelog" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Changelog
                </TabsTrigger>
                <TabsTrigger value="variants" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Variants
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <ThemePreview
                  theme={selectedTheme}
                  isActive={selectedTheme.is_active}
                  onApplyTheme={switchTheme}
                />
              </TabsContent>

              <TabsContent value="screenshots" className="space-y-4">
                <ThemeScreenshots
                  theme={selectedTheme}
                  onScreenshotUpdate={refreshThemes}
                />
              </TabsContent>

              <TabsContent value="changelog" className="space-y-4">
                <ThemeChangelogManager theme={selectedTheme} />
              </TabsContent>

              <TabsContent value="variants" className="space-y-4">
                <ThemeModeVariants
                  theme={selectedTheme}
                  onThemeUpdate={refreshThemes}
                />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Error Monitoring</h4>
                      <div className="text-sm text-muted-foreground">
                        Recent errors: 0
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total fallbacks: 0
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Theme Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Version:</span> {selectedTheme.version}
                        </div>
                        <div>
                          <span className="font-medium">Author:</span> {selectedTheme.author || 'Unknown'}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {
                            new Date(selectedTheme.created_at).toLocaleDateString()
                          }
                        </div>
                        <div>
                          <span className="font-medium">Updated:</span> {
                            new Date(selectedTheme.updated_at).toLocaleDateString()
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="p-8 text-center">
              <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Select a Theme</h3>
              <p className="text-muted-foreground">
                Choose a theme from the list to view its details and options
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};