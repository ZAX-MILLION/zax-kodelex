import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Palette, Eye, Save, RotateCcw, Check, Crown, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserThemeSelection } from '@/hooks/useUserThemeSelection';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Theme {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  customCSS?: string;
  isPremium?: boolean;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const defaultThemes: Theme[] = [
  {
    id: 'default',
    name: 'KODELEX Dark',
    description: 'Eye-friendly dark theme with warm amber accents',
    primary: '35 85% 65%',
    secondary: '230 15% 16%',
    accent: '230 15% 17%',
    background: '230 15% 9%',
    foreground: '35 20% 92%',
    preview: { primary: '#d4a574', secondary: '#2a2d3a', accent: '#2e3440' }
  },
  {
    id: 'crimson',
    name: 'Crimson Blade',
    description: 'Bold red theme inspired by the manga series',
    primary: '0 80% 60%',
    secondary: '0 25% 15%',
    accent: '0 30% 20%',
    background: '0 15% 8%',
    foreground: '0 10% 92%',
    preview: { primary: '#e53e3e', secondary: '#3d1a1a', accent: '#4a2020' }
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    description: 'Cool blue theme for calm reading sessions',
    primary: '210 80% 60%',
    secondary: '210 25% 15%',
    accent: '210 30% 20%',
    background: '210 20% 8%',
    foreground: '210 15% 92%',
    preview: { primary: '#3182ce', secondary: '#1a2332', accent: '#1e2936' }
  },
  {
    id: 'forest',
    name: 'Mystic Forest',
    description: 'Nature-inspired green theme for peaceful reading',
    primary: '140 60% 55%',
    secondary: '140 25% 15%',
    accent: '140 30% 20%',
    background: '140 15% 8%',
    foreground: '140 10% 92%',
    preview: { primary: '#48bb78', secondary: '#1a2e1a', accent: '#1e3a1e' }
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    description: 'Warm golden theme reminiscent of sunset reading',
    primary: '45 90% 65%',
    secondary: '45 30% 15%',
    accent: '45 35% 20%',
    background: '45 20% 8%',
    foreground: '45 15% 92%',
    preview: { primary: '#ecc94b', secondary: '#332a1a', accent: '#3d2f1e' }
  },
  {
    id: 'shiranami-sakura',
    name: 'Shiranami Sakura EX',
    description: 'Premium cherry blossom theme with elegant animations',
    primary: '350 85% 75%',
    secondary: '350 25% 15%',
    accent: '350 30% 20%',
    background: '350 15% 8%',
    foreground: '350 10% 92%',
    isPremium: true,
    preview: { primary: '#f093a0', secondary: '#3d1a26', accent: '#4a1e2e' }
  },
  {
    id: 'platinum-elite',
    name: 'Platinum Elite',
    description: 'Luxurious platinum theme with premium effects',
    primary: '220 25% 75%',
    secondary: '220 15% 15%',
    accent: '220 20% 20%',
    background: '220 10% 8%',
    foreground: '220 5% 92%',
    isPremium: true,
    preview: { primary: '#a0aec0', secondary: '#2d3748', accent: '#4a5568' }
  }
];

const ThemeSelector: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [customCSS, setCustomCSS] = useState('');
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const { toast } = useToast();
  const { isPremium } = useSubscription();
  const { user } = useAuth();
  const { userTheme, isUserThemeEnabled, setUserThemePreference } = useUserThemeSelection(user);

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('manga-theme');
    const savedCSS = localStorage.getItem('manga-custom-css');
    
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
    
    if (savedCSS) {
      setCustomCSS(savedCSS);
      applyCustomCSS(savedCSS);
    }
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = defaultThemes.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--foreground', theme.foreground);
    
    // Update manga-specific colors to match theme
    const [h] = theme.primary.split(' ');
    root.style.setProperty('--manga-red', `${h} 60% 58%`);
    root.style.setProperty('--manga-gold', theme.primary);
    root.style.setProperty('--manga-blue', `210 70% 65%`);
  };

  const applyCustomCSS = (css: string) => {
    let styleElement = document.getElementById('custom-theme-css');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'custom-theme-css';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = css;
  };

  const handleThemeChange = async (themeId: string) => {
    const theme = defaultThemes.find(t => t.id === themeId);
    if (theme?.isPremium && !isPremium) {
      toast({
        title: "Premium Feature",
        description: "This theme is available for Premium subscribers only. Upgrade to unlock premium themes.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem('manga-theme', themeId);
    
    // Save user theme preference if user is logged in
    if (user && theme?.isPremium) {
      await setUserThemePreference(themeId, true);
    }
    
    toast({
      title: "Theme Applied",
      description: `Switched to ${theme?.name}`,
    });
  };

  const handlePreview = (themeId: string) => {
    setPreviewTheme(themeId);
    applyTheme(themeId);
  };

  const handlePreviewEnd = () => {
    setPreviewTheme(null);
    applyTheme(currentTheme);
  };

  const handleCustomCSSChange = (css: string) => {
    setCustomCSS(css);
  };

  const saveCustomCSS = () => {
    applyCustomCSS(customCSS);
    localStorage.setItem('manga-custom-css', customCSS);
    
    toast({
      title: "Custom CSS Saved",
      description: "Your custom styles have been applied.",
    });
  };

  const resetCustomCSS = () => {
    setCustomCSS('');
    applyCustomCSS('');
    localStorage.removeItem('manga-custom-css');
    
    toast({
      title: "Custom CSS Reset",
      description: "Custom styles have been cleared.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Palette className="h-4 w-4" />
          Themes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Customization
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="themes">Preset Themes</TabsTrigger>
            <TabsTrigger value="custom">Custom CSS</TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-4">
            {previewTheme && (
              <div className="bg-muted/50 border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Previewing: {defaultThemes.find(t => t.id === previewTheme)?.name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleThemeChange(previewTheme!)}>
                      <Check className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                    <Button size="sm" variant="outline" onClick={handlePreviewEnd}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {defaultThemes.map((theme) => (
                <Card 
                  key={theme.id} 
                  className={`p-4 transition-all hover:shadow-md relative ${
                    currentTheme === theme.id && !previewTheme ? 'ring-2 ring-primary' : ''
                  } ${previewTheme === theme.id ? 'ring-2 ring-accent' : ''} ${
                    theme.isPremium && !isPremium ? 'opacity-75' : 'cursor-pointer'
                  }`}
                >
                  {theme.isPremium && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-black">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        {theme.name}
                        {theme.isPremium && !isPremium && <Lock className="h-3 w-3" />}
                      </h3>
                      {currentTheme === theme.id && !previewTheme && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {theme.description}
                    </p>
                    
                    <div className="flex gap-2">
                      {Object.entries(theme.preview).map(([key, color]) => (
                        <div
                          key={key}
                          className="w-8 h-8 rounded-full border-2 border-border"
                          style={{ backgroundColor: color }}
                          title={key}
                        />
                      ))}
                    </div>
                    
                     <div className="flex gap-2">
                       {theme.isPremium && !isPremium ? (
                         <>
                           <Button asChild size="sm" className="flex-1">
                             <Link to="/subscribe">
                               <Crown className="h-3 w-3 mr-1" />
                               Upgrade to Premium
                             </Link>
                           </Button>
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => handlePreview(theme.id)}
                             disabled
                             className="opacity-50"
                           >
                             <Lock className="h-3 w-3" />
                           </Button>
                         </>
                       ) : (
                         <>
                           <Button
                             size="sm"
                             variant={currentTheme === theme.id && !previewTheme ? "default" : "outline"}
                             onClick={() => handleThemeChange(theme.id)}
                             className="flex-1"
                           >
                             {currentTheme === theme.id && !previewTheme ? 'Active' : 'Apply'}
                           </Button>
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => handlePreview(theme.id)}
                           >
                             <Eye className="h-3 w-3" />
                           </Button>
                         </>
                       )}
                     </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-css">Custom CSS Overrides</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add custom CSS to further customize your theme. Use CSS variables like --primary, --background, etc.
                </p>
                <Textarea
                  id="custom-css"
                  placeholder={`/* Example custom CSS */
:root {
  --custom-border-radius: 1rem;
  --custom-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.card {
  border-radius: var(--custom-border-radius);
  box-shadow: var(--custom-shadow);
}

/* Customize reading experience */
.reader-page {
  filter: sepia(10%);
}`}
                  value={customCSS}
                  onChange={(e) => handleCustomCSSChange(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={saveCustomCSS} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Custom CSS
                </Button>
                <Button variant="outline" onClick={resetCustomCSS}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSelector;