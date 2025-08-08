import React, { useState } from 'react';
import { useThemeEngineContext } from '@/contexts/ThemeEngineContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Settings, 
  Download, 
  Upload, 
  Eye, 
  Trash2, 
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ThemeEngineManager: React.FC = () => {
  const { 
    currentTheme, 
    availableThemes, 
    loading, 
    error, 
    switchTheme, 
    reloadThemes 
  } = useThemeEngineContext();
  
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleThemeSwitch = async (themeId: string) => {
    setActionLoading(themeId);
    try {
      await switchTheme(themeId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleThemeDelete = async (themeId: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;

    setActionLoading(`delete-${themeId}`);
    try {
      const { error } = await supabase
        .from('theme_settings')
        .delete()
        .eq('id', themeId);

      if (error) throw error;

      await reloadThemes();
      toast({
        title: "Theme Deleted",
        description: "Theme has been successfully deleted.",
      });
    } catch (error) {
      console.error('Failed to delete theme:', error);
      toast({
        title: "Error",
        description: "Failed to delete theme. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleThemeDuplicate = async (theme: any) => {
    setActionLoading(`duplicate-${theme.id}`);
    try {
      const newTheme = {
        ...theme,
        id: undefined,
        theme_name: `${theme.theme_name}-copy`,
        display_name: `${theme.display_name} (Copy)`,
        is_active: false,
        is_default: false
      };

      const { error } = await supabase
        .from('theme_settings')
        .insert(newTheme);

      if (error) throw error;

      await reloadThemes();
      toast({
        title: "Theme Duplicated",
        description: "Theme has been successfully duplicated.",
      });
    } catch (error) {
      console.error('Failed to duplicate theme:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate theme. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const exportTheme = (theme: any) => {
    const exportData = {
      ...theme,
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
      is_active: false,
      is_default: false
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.theme_name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Theme Exported",
      description: "Theme has been exported successfully.",
    });
  };

  if (loading && !currentTheme) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Engine Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Engine Manager
          </CardTitle>
          <CardDescription>
            Manage themes, switch active themes, and configure theme settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Current Theme</h3>
              <p className="text-sm text-muted-foreground">
                {currentTheme?.display_name || 'No theme loaded'} 
                {currentTheme?.version && ` v${currentTheme.version}`}
              </p>
            </div>
            <Button 
              onClick={reloadThemes} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Theme Management */}
      <Tabs defaultValue="themes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="themes">Available Themes</TabsTrigger>
          <TabsTrigger value="settings">Theme Settings</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableThemes.map((theme) => (
              <Card key={theme.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{theme.display_name}</CardTitle>
                      <CardDescription className="text-xs">
                        {theme.author} • v{theme.version}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {theme.is_active && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                      {theme.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {theme.description}
                  </p>

                   <div className="flex flex-wrap gap-1">
                     <Badge variant="outline" className="text-xs">
                       {theme.category}
                     </Badge>
                     <Badge variant="outline" className="text-xs">
                       v{theme.version}
                     </Badge>
                   </div>

                  <div className="flex gap-2">
                    {!theme.is_active && (
                      <Button
                        size="sm"
                        onClick={() => handleThemeSwitch(theme.id)}
                        disabled={actionLoading === theme.id}
                        className="flex-1"
                      >
                        {actionLoading === theme.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportTheme(theme)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleThemeDuplicate(theme)}
                      disabled={actionLoading === `duplicate-${theme.id}`}
                    >
                      {actionLoading === `duplicate-${theme.id}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>

                    {!theme.is_default && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleThemeDelete(theme.id)}
                        disabled={actionLoading === `delete-${theme.id}`}
                      >
                        {actionLoading === `delete-${theme.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Theme Configuration</CardTitle>
              <CardDescription>
                Configure the current theme settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentTheme ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Color Settings</h4>
                      <div className="space-y-2">
                        {Object.entries(currentTheme.color_settings).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: value }}
                            />
                            <span className="text-sm font-mono">{key}: {value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Layout Settings</h4>
                      <div className="space-y-1">
                        {Object.entries(currentTheme.layout_settings).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No theme loaded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import/Export Themes</CardTitle>
              <CardDescription>
                Import new themes or export existing ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Import Theme</h4>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop a theme JSON file or click to browse
                    </p>
                    <Button variant="outline" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Export Current Theme</h4>
                  <Button 
                    onClick={() => currentTheme && exportTheme(currentTheme)}
                    disabled={!currentTheme}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Current Theme
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