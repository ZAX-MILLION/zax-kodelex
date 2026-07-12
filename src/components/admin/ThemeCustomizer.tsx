import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Palette, 
  Sun, 
  Moon, 
  Zap, 
  Monitor,
  Paintbrush,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ThemeConfig {
  mode: 'light' | 'dark' | 'neon' | 'auto';
  primary_color: string;
  accent_color: string;
  background_style: 'solid' | 'gradient' | 'pattern';
  font_family: string;
  border_radius: 'none' | 'small' | 'medium' | 'large';
  animation_level: 'none' | 'reduced' | 'normal' | 'enhanced';
  custom_css: string;
}

const THEME_PRESETS = {
  light: {
    name: 'Light Mode',
    description: 'Clean and bright interface',
    icon: Sun,
    colors: {
      primary: '#0066cc',
      accent: '#ff6b35',
      background: '#ffffff',
      foreground: '#0a0a0a'
    }
  },
  dark: {
    name: 'Dark Mode', 
    description: 'Easy on the eyes',
    icon: Moon,
    colors: {
      primary: '#3b82f6',
      accent: '#f59e0b',
      background: '#0a0a0a',
      foreground: '#fafafa'
    }
  },
  neon: {
    name: 'Neon Mode',
    description: 'Cyberpunk aesthetic',
    icon: Zap,
    colors: {
      primary: '#00ff88',
      accent: '#ff0088',
      background: '#0d001a',
      foreground: '#00ffff'
    }
  },
  auto: {
    name: 'Auto Mode',
    description: 'Follows system preference',
    icon: Monitor,
    colors: {
      primary: '#6366f1',
      accent: '#ec4899',
      background: 'auto',
      foreground: 'auto'
    }
  }
};

const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter (Default)', class: 'font-sans' },
  { value: 'roboto', label: 'Roboto', class: 'font-sans' },
  { value: 'playfair', label: 'Playfair Display', class: 'font-serif' },
  { value: 'fira', label: 'Fira Code', class: 'font-mono' },
  { value: 'poppins', label: 'Poppins', class: 'font-sans' }
];

export const ThemeCustomizer: React.FC = () => {
  const { toast } = useToast();
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    mode: 'auto',
    primary_color: '#6366f1',
    accent_color: '#ec4899',
    background_style: 'solid',
    font_family: 'inter',
    border_radius: 'medium',
    animation_level: 'normal',
    custom_css: ''
  });
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadThemeConfig();
    detectSystemTheme();
  }, []);

  const loadThemeConfig = () => {
    const stored = localStorage.getItem('theme_config');
    if (stored) {
      setThemeConfig({ ...themeConfig, ...JSON.parse(stored) });
    }
  };

  const detectSystemTheme = () => {
    if (themeConfig.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyThemeMode(prefersDark ? 'dark' : 'light');
    }
  };

  const applyThemeMode = (mode: string) => {
    const root = document.documentElement;
    const preset = THEME_PRESETS[mode as keyof typeof THEME_PRESETS];
    
    if (preset && preset.colors.background !== 'auto') {
      // Apply theme colors to CSS variables
      root.style.setProperty('--primary', preset.colors.primary);
      root.style.setProperty('--accent', preset.colors.accent);
      root.style.setProperty('--background', preset.colors.background);
      root.style.setProperty('--foreground', preset.colors.foreground);
      
      // Update dark mode class
      if (mode === 'dark' || mode === 'neon') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const saveThemeConfig = () => {
    setIsApplying(true);
    
    try {
      localStorage.setItem('theme_config', JSON.stringify(themeConfig));
      
      // Apply theme immediately
      if (themeConfig.mode === 'auto') {
        detectSystemTheme();
      } else {
        applyThemeMode(themeConfig.mode);
      }
      
      // Apply custom CSS
      if (themeConfig.custom_css) {
        let styleElement = document.getElementById('custom-theme-css');
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = 'custom-theme-css';
          document.head.appendChild(styleElement);
        }
        styleElement.textContent = themeConfig.custom_css;
      }
      
      toast({
        title: "Theme Applied",
        description: "Your theme settings have been saved and applied"
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply theme settings",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  const previewTheme = (mode: string) => {
    applyThemeMode(mode);
    setThemeConfig(prev => ({ ...prev, mode: mode as any }));
  };

  const resetToDefaults = () => {
    const defaultConfig: ThemeConfig = {
      mode: 'auto',
      primary_color: '#6366f1',
      accent_color: '#ec4899',
      background_style: 'solid',
      font_family: 'inter',
      border_radius: 'medium',
      animation_level: 'normal',
      custom_css: ''
    };
    setThemeConfig(defaultConfig);
    localStorage.removeItem('theme_config');
    detectSystemTheme();
    
    toast({
      title: "Reset Complete",
      description: "Theme settings reset to defaults"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Theme Customizer</h2>
          <p className="text-muted-foreground">
            Customize the appearance and feel of your platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={saveThemeConfig} disabled={isApplying}>
            {isApplying ? 'Applying...' : 'Apply Theme'}
          </Button>
        </div>
      </div>

      {/* Theme Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Mode
          </CardTitle>
          <CardDescription>
            Choose your preferred color scheme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(THEME_PRESETS).map(([mode, preset]) => {
              const Icon = preset.icon;
              const isActive = themeConfig.mode === mode;
              
              return (
                <Card 
                  key={mode} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isActive ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => previewTheme(mode)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-full ${isActive ? 'bg-primary text-white' : 'bg-muted'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{preset.name}</h4>
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                      </div>
                    </div>
                    
                    {/* Color Preview */}
                    <div className="flex gap-2 mb-2">
                      {Object.entries(preset.colors).map(([colorName, colorValue]) => (
                        colorValue !== 'auto' && (
                          <div
                            key={colorName}
                            className="w-6 h-6 rounded border-2 border-white shadow-sm"
                            style={{ backgroundColor: colorValue }}
                            title={colorName}
                          />
                        )
                      ))}
                    </div>
                    
                    {isActive && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
          <CardDescription>
            Fine-tune your theme with additional options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Selection */}
          <div className="space-y-3">
            <Label>Font Family</Label>
            <Select 
              value={themeConfig.font_family} 
              onValueChange={(value) => setThemeConfig(prev => ({ ...prev, font_family: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span className={font.class}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Border Radius */}
          <div className="space-y-3">
            <Label>Border Radius</Label>
            <Select 
              value={themeConfig.border_radius} 
              onValueChange={(value) => setThemeConfig(prev => ({ ...prev, border_radius: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Sharp corners)</SelectItem>
                <SelectItem value="small">Small (2px)</SelectItem>
                <SelectItem value="medium">Medium (6px)</SelectItem>
                <SelectItem value="large">Large (12px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Animation Level */}
          <div className="space-y-3">
            <Label>Animation Level</Label>
            <Select 
              value={themeConfig.animation_level} 
              onValueChange={(value) => setThemeConfig(prev => ({ ...prev, animation_level: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No animations</SelectItem>
                <SelectItem value="reduced">Reduced motion</SelectItem>
                <SelectItem value="normal">Normal animations</SelectItem>
                <SelectItem value="enhanced">Enhanced effects</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Background Style */}
          <div className="space-y-3">
            <Label>Background Style</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'solid', label: 'Solid Color' },
                { value: 'gradient', label: 'Gradient' },
                { value: 'pattern', label: 'Pattern' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={themeConfig.background_style === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setThemeConfig(prev => ({ ...prev, background_style: option.value as any }))}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom CSS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            Custom CSS
          </CardTitle>
          <CardDescription>
            Add custom CSS for advanced styling (use with caution)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full h-32 p-3 border rounded-md font-mono text-sm"
            value={themeConfig.custom_css}
            onChange={(e) => setThemeConfig(prev => ({ ...prev, custom_css: e.target.value }))}
            placeholder="/* Add your custom CSS here */
.custom-class {
  /* Your styles */
}"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Custom CSS will be applied after the theme styles. Use CSS variables like var(--primary) for theme colors.
          </p>
        </CardContent>
      </Card>

      {/* Theme Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription>
            Preview of UI elements with current theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-4 border rounded-lg bg-background">
            {/* Sample UI Elements */}
            <div className="flex items-center gap-4">
              <Button size="sm">Primary Button</Button>
              <Button variant="outline" size="sm">Secondary Button</Button>
              <Button variant="ghost" size="sm">Ghost Button</Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Sample Heading</h4>
              <p className="text-muted-foreground">
                This is sample text to preview the current theme settings. 
                The font family, colors, and styling will reflect your current configuration.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
            </div>
            
            <Card className="p-4">
              <h5 className="font-medium mb-2">Sample Card</h5>
              <p className="text-sm text-muted-foreground">
                Cards and other components will use the current border radius and color scheme.
              </p>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};