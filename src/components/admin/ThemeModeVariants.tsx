import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Palette, Copy } from 'lucide-react';
import { ChildTheme, ThemeConfig } from '@/hooks/useChildTheme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ThemeModeVariantsProps {
  theme: ChildTheme;
  onThemeUpdate?: () => void;
}

interface ModeVariant {
  light: ThemeConfig;
  dark: ThemeConfig;
}

// Enhancement 12: Dark/light mode variants within each theme
export const ThemeModeVariants: React.FC<ThemeModeVariantsProps> = ({ 
  theme, 
  onThemeUpdate 
}) => {
  const [activeMode, setActiveMode] = useState<'light' | 'dark'>('light');
  const [hasVariants, setHasVariants] = useState(
    theme.theme_config.dark_variant !== undefined
  );
  const [lightConfig, setLightConfig] = useState<ThemeConfig>(
    theme.theme_config
  );
  const generateDarkVariant = (lightTheme: ThemeConfig): ThemeConfig => {
    // Auto-generate dark variant from light theme
    return {
      ...lightTheme,
      colors: {
        ...lightTheme.colors,
        background: "230 15% 9%",
        foreground: "35 20% 92%",
        secondary: "230 15% 16%",
        accent: "230 15% 17%",
        // Keep brand colors the same
        primary: lightTheme.colors.primary,
        manga_red: lightTheme.colors.manga_red,
        manga_gold: lightTheme.colors.manga_gold,
        manga_blue: lightTheme.colors.manga_blue
      }
    };
  };

  const [darkConfig, setDarkConfig] = useState<ThemeConfig>(
    theme.theme_config.dark_variant || generateDarkVariant(theme.theme_config)
  );
  const copyFromLightToDark = () => {
    setDarkConfig(generateDarkVariant(lightConfig));
    toast({
      title: "Dark Variant Generated",
      description: "Dark mode colors have been auto-generated from light mode."
    });
  };

  const copyFromDarkToLight = () => {
    setLightConfig({
      ...darkConfig,
      colors: {
        ...darkConfig.colors,
        background: "0 0% 100%",
        foreground: "230 15% 9%",
        secondary: "230 15% 96%",
        accent: "230 15% 94%"
      }
    });
    toast({
      title: "Light Variant Generated",
      description: "Light mode colors have been generated from dark mode."
    });
  };

  const saveVariants = async () => {
    try {
      const updatedConfig = {
        ...lightConfig,
        dark_variant: hasVariants ? darkConfig : undefined
      };

      const { error } = await supabase
        .from('child_themes')
        .update({ 
          theme_config: updatedConfig as any
        })
        .eq('id', theme.id);

      if (error) throw error;

      onThemeUpdate?.();
      
      toast({
        title: "Theme Variants Saved",
        description: "Light and dark mode variants have been updated."
      });
    } catch (error) {
      console.error('Error saving variants:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save theme variants.",
        variant: "destructive"
      });
    }
  };

  const updateColorValue = (mode: 'light' | 'dark', colorKey: string, value: string) => {
    if (mode === 'light') {
      setLightConfig(prev => ({
        ...prev,
        colors: {
          ...prev.colors,
          [colorKey]: value
        }
      }));
    } else {
      setDarkConfig(prev => ({
        ...prev,
        colors: {
          ...prev.colors,
          [colorKey]: value
        }
      }));
    }
  };

  const renderColorInputs = (config: ThemeConfig, mode: 'light' | 'dark') => (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(config.colors).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <Label className="text-sm capitalize">
            {key.replace(/_/g, ' ')}
          </Label>
          <div className="flex gap-2">
            <Input
              value={value as string}
              onChange={(e) => updateColorValue(mode, key, e.target.value)}
              placeholder="HSL values (e.g., 35 85% 65%)"
              className="text-sm"
            />
            <div 
              className="w-10 h-9 rounded border border-border"
              style={{ backgroundColor: `hsl(${value})` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Mode Variants
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="enable-variants" className="text-sm">
                Enable Dark Mode
              </Label>
              <Switch
                id="enable-variants"
                checked={hasVariants}
                onCheckedChange={setHasVariants}
              />
            </div>
            <Button onClick={saveVariants} size="sm">
              Save Variants
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {hasVariants ? (
          <Tabs value={activeMode} onValueChange={(v) => setActiveMode(v as 'light' | 'dark')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="light" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Light Mode
              </TabsTrigger>
              <TabsTrigger value="dark" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Dark Mode
              </TabsTrigger>
            </TabsList>

            <TabsContent value="light" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Light Mode Colors</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyFromDarkToLight}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy from Dark
                </Button>
              </div>
              {renderColorInputs(lightConfig, 'light')}
            </TabsContent>

            <TabsContent value="dark" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Dark Mode Colors</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyFromLightToDark}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy from Light
                </Button>
              </div>
              {renderColorInputs(darkConfig, 'dark')}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sun className="h-6 w-6" />
              <span>•</span>
              <Moon className="h-6 w-6" />
            </div>
            <p>Enable dark mode to create light and dark variants</p>
            <p className="text-sm">Each theme can have different colors for light and dark modes</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
