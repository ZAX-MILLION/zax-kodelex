import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Upload, 
  Eye, 
  Download, 
  Trash2, 
  Copy, 
  Settings,
  Palette,
  Code2,
  FileImage,
  Layout
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ThemePreview } from './ThemePreview';
import { ThemeVerification } from './ThemeVerification';
import { useChildTheme } from '@/hooks/useChildTheme';

interface ThemeAsset {
  id: string;
  theme_id: string;
  type: 'css' | 'image' | 'font' | 'component';
  name: string;
  path: string;
  content?: string;
  size: number;
  created_at: string;
}

interface ComponentOverride {
  id: string;
  theme_id: string;
  component_name: string;
  component_path: string;
  is_active: boolean;
  created_at: string;
}

export const EnhancedThemeArchitecture: React.FC = () => {
  const { availableThemes, currentTheme, refreshThemes } = useChildTheme();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [themeAssets, setThemeAssets] = useState<ThemeAsset[]>([]);
  const [componentOverrides, setComponentOverrides] = useState<ComponentOverride[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTheme) {
      loadThemeAssets(selectedTheme);
      loadComponentOverrides(selectedTheme);
    }
  }, [selectedTheme]);

  const loadThemeAssets = async (themeId: string) => {
    // For now, simulate theme assets until database tables are created
    setThemeAssets([]);
  };

  const loadComponentOverrides = async (themeId: string) => {
    // For now, simulate component overrides until database tables are created
    const mockOverrides: ComponentOverride[] = [];
    
    // Check if theme has homepage component
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme?.homepage_component) {
      mockOverrides.push({
        id: 'homepage-override',
        theme_id: themeId,
        component_name: 'Homepage',
        component_path: theme.homepage_component,
        is_active: true,
        created_at: theme.created_at
      });
    }
    
    setComponentOverrides(mockOverrides);
  };

  const createNewTheme = async () => {
    try {
      setLoading(true);
      const newTheme = {
        name: `custom-theme-${Date.now()}`,
        display_name: 'New Custom Theme',
        description: 'A new custom theme ready for configuration',
        version: '1.0.0',
        author: 'Admin',
        theme_config: {
          colors: {
            primary: "210 70% 65%",
            secondary: "230 15% 16%",
            accent: "230 15% 17%",
            background: "230 15% 9%",
            foreground: "35 20% 92%",
            manga_red: "0 60% 58%",
            manga_gold: "35 85% 65%",
            manga_blue: "210 70% 65%"
          },
          fonts: {
            heading: "Inter",
            body: "Inter"
          },
          spacing: {
            scale: 1.0
          },
          borderRadius: "0.75rem",
          animations: {
            enabled: true,
            duration: "300ms"
          }
        },
        custom_css: `/* Custom CSS for ${Date.now()} */\n:root {\n  /* Add your custom styles here */\n}`,
        is_active: false,
        is_default: false
      };

      const { data, error } = await supabase
        .from('child_themes')
        .insert([newTheme])
        .select()
        .single();

      if (error) throw error;

      await refreshThemes();
      setSelectedTheme(data.id);

      toast({
        title: "Theme Created",
        description: "New theme created successfully. You can now customize it.",
      });
    } catch (error) {
      console.error('Error creating theme:', error);
      toast({
        title: "Error",
        description: "Failed to create new theme",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadThemeAsset = async (file: File, type: string) => {
    if (!selectedTheme) return;

    try {
      setLoading(true);
      
      // For now, show success message - will implement when database tables are created
      toast({
        title: "Feature Coming Soon",
        description: "Theme asset upload will be available once database schema is updated.",
      });
    } catch (error) {
      console.error('Error uploading asset:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload theme asset",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedThemeData = availableThemes.find(t => t.id === selectedTheme);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Theme Architecture</h2>
          <p className="text-muted-foreground">
            Complete theme management with component overrides, assets, and custom styling
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewTheme} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Create Theme
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Available Themes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {availableThemes.map((theme) => (
              <div
                key={theme.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTheme === theme.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{theme.display_name}</h4>
                    <p className="text-sm text-muted-foreground">{theme.version}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {theme.is_active && <Badge>Active</Badge>}
                    {theme.is_default && <Badge variant="secondary">Default</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Theme Details */}
        <div className="lg:col-span-2">
          {selectedThemeData ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="css">Custom CSS</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedThemeData.display_name}</CardTitle>
                    <CardDescription>{selectedThemeData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Version</label>
                        <p>{selectedThemeData.version}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Author</label>
                        <p>{selectedThemeData.author || 'Unknown'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <div className="flex gap-2">
                          {selectedThemeData.is_active && <Badge>Active</Badge>}
                          {selectedThemeData.is_default && <Badge variant="secondary">Default</Badge>}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Created</label>
                        <p>{new Date(selectedThemeData.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Homepage Component</label>
                      <p className="text-sm text-muted-foreground">
                        {selectedThemeData.homepage_component || 'Using default homepage'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="components">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="h-5 w-5" />
                      Component Overrides
                    </CardTitle>
                    <CardDescription>
                      Override default components with theme-specific versions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {componentOverrides.length > 0 ? (
                        componentOverrides.map((override) => (
                          <div key={override.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{override.component_name}</h4>
                              <p className="text-sm text-muted-foreground">{override.component_path}</p>
                            </div>
                            <Badge variant={override.is_active ? "default" : "secondary"}>
                              {override.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Layout className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No component overrides found</p>
                          <p className="text-sm">Add component files to override default behavior</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assets">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileImage className="h-5 w-5" />
                      Theme Assets
                    </CardTitle>
                    <CardDescription>
                      Manage CSS files, images, fonts, and other theme resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept=".css,.js,.tsx,.jpg,.png,.svg,.woff,.woff2"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const type = file.name.endsWith('.css') ? 'css' : 
                                          file.name.match(/\.(jpg|png|svg)$/) ? 'image' :
                                          file.name.match(/\.(woff|woff2)$/) ? 'font' : 'component';
                              uploadThemeAsset(file, type);
                            }
                          }}
                          className="hidden"
                          id="asset-upload"
                        />
                        <Button asChild variant="outline">
                          <label htmlFor="asset-upload" className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Asset
                          </label>
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {themeAssets.length > 0 ? (
                          themeAssets.map((asset) => (
                            <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                                  {asset.type === 'css' && <Code2 className="h-4 w-4" />}
                                  {asset.type === 'image' && <FileImage className="h-4 w-4" />}
                                  {asset.type === 'component' && <Layout className="h-4 w-4" />}
                                </div>
                                <div>
                                  <h4 className="font-medium">{asset.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {asset.type} • {(asset.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileImage className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No assets uploaded</p>
                            <p className="text-sm">Upload CSS, images, or fonts to customize this theme</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="css">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code2 className="h-5 w-5" />
                      Custom CSS
                    </CardTitle>
                    <CardDescription>
                      Add custom styles specific to this theme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={selectedThemeData.custom_css || ''}
                      onChange={(e) => {
                        // Handle CSS changes
                      }}
                      className="min-h-[300px] font-mono text-sm"
                      placeholder="/* Add your custom CSS here */"
                    />
                    <div className="flex justify-end mt-4">
                      <Button>Save CSS</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <ThemePreview theme={selectedThemeData} />
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Select a Theme</h3>
                  <p className="text-muted-foreground">Choose a theme from the list to manage its settings</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Theme Verification */}
      <ThemeVerification />
    </div>
  );
};