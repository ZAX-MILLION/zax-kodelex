// Shiranami Sakura theme now available via database
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useChildTheme } from '@/hooks/useChildTheme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Palette, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Upload,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Monitor
} from 'lucide-react';
import { ThemePreview } from './ThemePreview';
import { EnhancedThemePreview } from './EnhancedThemePreview';
import { ThemeVerification } from './ThemeVerification';
import { componentRegistry } from '../themes/ComponentRegistry';

interface NewThemeData {
  name: string;
  display_name: string;
  description: string;
  author: string;
  version: string;
  theme_config: any;
  custom_css: string;
  homepage_component: string;
}

const ThemeManager: React.FC = () => {
  const { 
    currentTheme, 
    availableThemes, 
    loading, 
    switchTheme, 
    previewTheme, 
    resetToActive,
    refreshThemes 
  } = useChildTheme();
  
  const [previewingTheme, setPreviewingTheme] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTheme, setNewTheme] = useState<NewThemeData>({
    name: '',
    display_name: '',
    description: '',
    author: '',
    version: '1.0.0',
    theme_config: {
      colors: {
        primary: "35 85% 65%",
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
    custom_css: '',
    homepage_component: ''
  });

  const handlePreview = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      previewTheme(theme);
      setPreviewingTheme(themeId);
    }
  };

  const handleStopPreview = () => {
    resetToActive();
    setPreviewingTheme(null);
  };

  const handleActivateTheme = async (themeId: string) => {
    await switchTheme(themeId);
    setPreviewingTheme(null);
  };

  const handleDeleteTheme = async (themeId: string) => {
    try {
      const { error } = await supabase
        .from('child_themes')
        .delete()
        .eq('id', themeId);

      if (error) throw error;

      toast({
        title: "Theme Deleted",
        description: "Theme has been successfully deleted.",
      });

      refreshThemes();
    } catch (err) {
      console.error('Error deleting theme:', err);
      toast({
        title: "Error",
        description: "Failed to delete theme. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateTheme = async () => {
    try {
      const { error } = await supabase
        .from('child_themes')
        .insert({
          name: newTheme.name,
          display_name: newTheme.display_name,
          description: newTheme.description,
          author: newTheme.author,
          version: newTheme.version,
          theme_config: newTheme.theme_config,
          custom_css: newTheme.custom_css || null,
          homepage_component: newTheme.homepage_component || null
        });

      if (error) throw error;

      toast({
        title: "Theme Created",
        description: "New theme has been successfully created.",
      });

      setShowCreateDialog(false);
      setNewTheme({
        name: '',
        display_name: '',
        description: '',
        author: '',
        version: '1.0.0',
        theme_config: newTheme.theme_config,
        custom_css: '',
        homepage_component: ''
      });
      
      refreshThemes();
    } catch (err) {
      console.error('Error creating theme:', err);
      toast({
        title: "Error",
        description: "Failed to create theme. Please try again.",
        variant: "destructive"
      });
    }
  };

  const exportTheme = (theme: any) => {
    const themeData = {
      name: theme.name,
      display_name: theme.display_name,
      description: theme.description,
      author: theme.author,
      version: theme.version,
      theme_config: theme.theme_config,
      custom_css: theme.custom_css,
      homepage_component: theme.homepage_component
    };

    const blob = new Blob([JSON.stringify(themeData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target?.result as string);
        setNewTheme({
          ...themeData,
          name: themeData.name + '-imported'
        });
        setShowCreateDialog(true);
        toast({
          title: "Theme Imported",
          description: "Theme data has been loaded. Review and save to add it.",
        });
      } catch (err) {
        toast({
          title: "Import Error",
          description: "Invalid theme file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleImportPremiumThemes = async () => {
    try {
      // Import the "01 - Midnight Professional" theme from local files
      const response = await fetch('/src/themes/01-midnight-professional.json');
      const themeData = await response.json();

      const { error } = await supabase
        .from('child_themes')
        .insert({
          name: themeData.name,
          display_name: themeData.display_name,
          description: themeData.description,
          author: themeData.author,
          version: themeData.version,
          theme_config: themeData.theme_config,
          custom_css: themeData.custom_css || null,
          homepage_component: themeData.homepage_component || null,
          is_active: false,
          is_default: false
        });

      if (error) throw error;

      toast({
        title: "Premium Theme Imported",
        description: `${themeData.display_name} has been imported successfully.`,
      });

      refreshThemes();
    } catch (err) {
      console.error('Error importing premium theme:', err);
      toast({
        title: "Import Error",
        description: "Failed to import premium theme. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">
      <RefreshCw className="h-8 w-8 animate-spin" />
    </div>;
  }

  // Get error log for debugging
  const errorLog = componentRegistry.getErrorLog();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Theme Manager
          </h2>
          <p className="text-muted-foreground">
            Manage child themes and customize the site appearance
          </p>
        </div>
        
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={importTheme}
            className="hidden"
            id="theme-import"
          />
          <Button variant="outline" onClick={() => document.getElementById('theme-import')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Theme
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Theme</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="css">Custom CSS</TabsTrigger>
                  <TabsTrigger value="component">Homepage</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Theme Name (slug)</Label>
                      <Input
                        id="name"
                        value={newTheme.name}
                        onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                        placeholder="my-custom-theme"
                      />
                    </div>
                    <div>
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={newTheme.display_name}
                        onChange={(e) => setNewTheme({ ...newTheme, display_name: e.target.value })}
                        placeholder="My Custom Theme"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newTheme.description}
                      onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
                      placeholder="A beautiful custom theme for..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={newTheme.author}
                        onChange={(e) => setNewTheme({ ...newTheme, author: e.target.value })}
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={newTheme.version}
                        onChange={(e) => setNewTheme({ ...newTheme, version: e.target.value })}
                        placeholder="1.0.0"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="colors" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(newTheme.theme_config.colors).map(([key, value]) => (
                      <div key={key}>
                        <Label htmlFor={key}>{key.replace(/_/g, ' ').toUpperCase()}</Label>
                        <Input
                          id={key}
                          value={String(value)}
                          onChange={(e) => setNewTheme({
                            ...newTheme,
                            theme_config: {
                              ...newTheme.theme_config,
                              colors: {
                                ...newTheme.theme_config.colors,
                                [key]: e.target.value
                              }
                            }
                          })}
                          placeholder="0 0% 100%"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="css" className="space-y-4">
                  <div>
                    <Label htmlFor="custom_css">Custom CSS</Label>
                    <Textarea
                      id="custom_css"
                      value={newTheme.custom_css}
                      onChange={(e) => setNewTheme({ ...newTheme, custom_css: e.target.value })}
                      rows={15}
                      placeholder="/* Custom CSS styles */"
                      className="font-mono"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="component" className="space-y-4">
                  <div>
                    <Label htmlFor="homepage_component">Homepage Component Override</Label>
                    <Textarea
                      id="homepage_component"
                      value={newTheme.homepage_component}
                      onChange={(e) => setNewTheme({ ...newTheme, homepage_component: e.target.value })}
                      rows={15}
                      placeholder={`Homepage component configuration (JSON):
{
  "template": "hero-centered",
  "styles": {
    "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  }
}

Supported templates: "hero-centered", "split-layout", "default"`}
                      className="font-mono"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTheme}>Create Theme</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Log Alert */}
      {errorLog.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Theme Component Errors ({errorLog.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {errorLog.slice(-5).map((error, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium">{error.theme}/{error.component}:</span>{' '}
                  <span className="text-muted-foreground">{error.error}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {error.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="themes" className="w-full">
        <TabsList>
          <TabsTrigger value="themes">Available Themes</TabsTrigger>
          <TabsTrigger value="verification">Theme Verification</TabsTrigger>
          <TabsTrigger value="preview">Theme Preview</TabsTrigger>
          <TabsTrigger value="editor">Theme Editor</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-6">
          {/* Previewing Theme Banner */}
          {previewingTheme && (
            <Card className="border-accent bg-accent/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-accent" />
                    <span className="font-medium">
                      Previewing: {availableThemes.find(t => t.id === previewingTheme)?.display_name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleActivateTheme(previewingTheme)}>
                      <Check className="h-3 w-3 mr-1" />
                      Activate
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleStopPreview}>
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Themes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableThemes.map((theme) => (
              <Card key={theme.id} className={`group hover:shadow-lg transition-all duration-300 ${
                currentTheme?.id === theme.id ? 'ring-2 ring-primary' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {theme.display_name}
                        {currentTheme?.id === theme.id && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
                        {theme.is_default && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {theme.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    v{theme.version} • {theme.author || 'Unknown Author'}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Color Swatches */}
                  <div className="flex gap-2">
                    {theme.theme_config?.colors && Object.entries(theme.theme_config.colors).slice(0, 4).map(([key, value]) => (
                      <div
                        key={key}
                        className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: `hsl(${value})` }}
                        title={key}
                      />
                    ))}
                  </div>

                  {/* Theme Features */}
                  {theme.custom_css && (
                    <Badge variant="outline" className="text-xs">
                      Custom CSS
                    </Badge>
                  )}
                  {theme.homepage_component && (
                    <Badge variant="outline" className="text-xs">
                      Custom Homepage
                    </Badge>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {currentTheme?.id !== theme.id && (
                      <Button
                        size="sm"
                        onClick={() => handleActivateTheme(theme.id)}
                        className="flex-1"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Activate
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(theme.id)}
                      disabled={previewingTheme === theme.id}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {previewingTheme === theme.id ? 'Previewing' : 'Preview'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportTheme(theme)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                    
                    {!theme.is_default && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTheme(theme.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Premium Themes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Premium Themes
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Import premium themes from the marketplace
              </p>
            </CardHeader>
            <CardContent>
              <Button onClick={handleImportPremiumThemes} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Import Premium Themes from Library
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <ThemeVerification />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="space-y-6">
            {availableThemes.length > 0 ? (
              availableThemes.map((theme) => (
                <EnhancedThemePreview
                  key={theme.id}
                  theme={theme}
                  isActive={currentTheme?.id === theme.id}
                  onApplyTheme={switchTheme}
                />
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No themes available for preview.</p>
                  <Button className="mt-4" onClick={handleImportPremiumThemes}>
                    Import Premium Themes
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Editor</CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced theme customization and live editing
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentTheme ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Editing: {currentTheme.display_name}</h3>
                    <Badge variant="outline">v{currentTheme.version}</Badge>
                  </div>
                  
                  <Tabs defaultValue="colors" className="w-full">
                    <TabsList>
                      <TabsTrigger value="colors">Colors</TabsTrigger>
                      <TabsTrigger value="typography">Typography</TabsTrigger>
                      <TabsTrigger value="layout">Layout</TabsTrigger>
                      <TabsTrigger value="custom">Custom CSS</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="colors" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {currentTheme.theme_config?.colors && Object.entries(currentTheme.theme_config.colors).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label htmlFor={`edit-${key}`}>
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id={`edit-${key}`}
                                value={String(value)}
                                placeholder="0 0% 100%"
                                className="font-mono"
                              />
                              <div
                                className="w-10 h-10 rounded border-2 border-background shadow-sm flex-shrink-0"
                                style={{ backgroundColor: `hsl(${value})` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="typography" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="heading-font">Heading Font</Label>
                          <Input
                            id="heading-font"
                            value={currentTheme.theme_config?.fonts?.heading || 'Inter'}
                            placeholder="Inter, sans-serif"
                          />
                        </div>
                        <div>
                          <Label htmlFor="body-font">Body Font</Label>
                          <Input
                            id="body-font"
                            value={currentTheme.theme_config?.fonts?.body || 'Inter'}
                            placeholder="Inter, sans-serif"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="layout" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="border-radius">Border Radius</Label>
                          <Input
                            id="border-radius"
                            value={currentTheme.theme_config?.borderRadius || '0.75rem'}
                            placeholder="0.75rem"
                          />
                        </div>
                        <div>
                          <Label htmlFor="spacing-scale">Spacing Scale</Label>
                          <Input
                            id="spacing-scale"
                            value={currentTheme.theme_config?.spacing?.scale || 1.0}
                            placeholder="1.0"
                            type="number"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="custom" className="space-y-4">
                      <div>
                        <Label htmlFor="custom-css-editor">Custom CSS</Label>
                        <Textarea
                          id="custom-css-editor"
                          value={currentTheme.custom_css || ''}
                          rows={20}
                          placeholder="/* Custom CSS styles */"
                          className="font-mono"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline">
                      Reset Changes
                    </Button>
                    <Button>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a theme to start editing
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Theme Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure global theme behavior and preferences
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode Default</Label>
                    <p className="text-sm text-muted-foreground">
                      Set dark mode as the default for new users
                    </p>
                  </div>
                  <Switch id="dark-mode" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="animations">Enable Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable theme animations globally
                    </p>
                  </div>
                  <Switch id="animations" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-theme">Auto Theme Detection</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically switch themes based on system preferences
                    </p>
                  </div>
                  <Switch id="auto-theme" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="theme-caching">Theme Caching</Label>
                    <p className="text-sm text-muted-foreground">
                      Cache theme assets for faster loading
                    </p>
                  </div>
                  <Switch id="theme-caching" defaultChecked />
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-4">
                <h4 className="font-medium">Performance Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preload-themes">Preload Themes</Label>
                    <Input
                      id="preload-themes"
                      type="number"
                      defaultValue="3"
                      min="1"
                      max="10"
                      placeholder="Number of themes to preload"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cache-duration">Cache Duration (minutes)</Label>
                    <Input
                      id="cache-duration"
                      type="number"
                      defaultValue="60"
                      min="5"
                      max="1440"
                      placeholder="Cache duration in minutes"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">System Actions</h4>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={refreshThemes}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Themes
                  </Button>
                  <Button variant="outline">
                    Clear Theme Cache
                  </Button>
                  <Button variant="outline">
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default ThemeManager;