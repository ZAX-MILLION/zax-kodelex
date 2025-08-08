import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Palette, 
  Shield, 
  Bell,
  Globe,
  Database,
  Save,
  RefreshCw,
  Eye
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SiteSettings {
  site_title: string;
  logo_url: string | null;
  theme_color: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
  manga_red: string;
  manga_gold: string;
  manga_blue: string;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  analytics_code: string | null;
  custom_css: string | null;
  custom_js: string | null;
  hero_bg_url: string | null;
  hero_height: string;
}

interface GlobalSettings {
  defaultAgeRating: string;
  defaultLanguage: string;
  siteBanner: string;
  enableComments: boolean;
  enableBookmarks: boolean;
  enableNotifications: boolean;
  maxUploadSize: number;
  allowedFileTypes: string[];
}

export const SiteSettings = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    site_title: "Manga Reader",
    logo_url: null,
    theme_color: "#dc2626",
    primary_color: "#f59e0b",
    secondary_color: "#374151",
    accent_color: "#3b82f6",
    background_color: "#0f172a",
    foreground_color: "#f1f5f9",
    manga_red: "#ef4444",
    manga_gold: "#f59e0b",
    manga_blue: "#3b82f6",
    maintenance_mode: false,
    maintenance_message: null,
    analytics_code: null,
    custom_css: null,
    custom_js: null,
    hero_bg_url: null,
    hero_height: "50vh",
  });
  
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    defaultAgeRating: "T",
    defaultLanguage: "en",
    siteBanner: "",
    enableComments: true,
    enableBookmarks: true,
    enableNotifications: false,
    maxUploadSize: 10,
    allowedFileTypes: ["jpg", "jpeg", "png", "webp"],
  });

  // Live preview function
  const previewColorScheme = () => {
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const root = document.documentElement;
    root.style.setProperty('--primary', hexToHsl(siteSettings.primary_color));
    root.style.setProperty('--secondary', hexToHsl(siteSettings.secondary_color));
    root.style.setProperty('--accent', hexToHsl(siteSettings.accent_color));
    root.style.setProperty('--background', hexToHsl(siteSettings.background_color));
    root.style.setProperty('--foreground', hexToHsl(siteSettings.foreground_color));
    root.style.setProperty('--manga-red', hexToHsl(siteSettings.manga_red));
    root.style.setProperty('--manga-gold', hexToHsl(siteSettings.manga_gold));
    root.style.setProperty('--manga-blue', hexToHsl(siteSettings.manga_blue));
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSiteSettings(prev => ({
          ...prev,
          ...data,
          // Ensure all new color properties have defaults if not present in DB
          primary_color: (data as any).primary_color || prev.primary_color,
          secondary_color: (data as any).secondary_color || prev.secondary_color,
          accent_color: (data as any).accent_color || prev.accent_color,
          background_color: (data as any).background_color || prev.background_color,
          foreground_color: (data as any).foreground_color || prev.foreground_color,
          manga_red: (data as any).manga_red || prev.manga_red,
          manga_gold: (data as any).manga_gold || prev.manga_gold,
          manga_blue: (data as any).manga_blue || prev.manga_blue,
        }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('site_settings')
        .upsert(siteSettings);

      if (error) throw error;

      // Log admin action
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          action_type: 'settings_update',
          admin_user_id: (await supabase.auth.getUser()).data.user?.id,
          description: 'Updated site settings',
          target_type: 'settings',
          metadata: { settings_updated: Object.keys(siteSettings) }
        });

      if (logError) console.error('Failed to log admin action:', logError);

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Site Settings</h2>
          <p className="text-muted-foreground">Configure your manga reader site</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchSettings} variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>Basic site configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-title">Site Title</Label>
                <Input
                  id="site-title"
                  value={siteSettings.site_title}
                  onChange={(e) => setSiteSettings({...siteSettings, site_title: e.target.value})}
                  placeholder="My Manga Site"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  value={siteSettings.logo_url || ""}
                  onChange={(e) => setSiteSettings({...siteSettings, logo_url: e.target.value || null})}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-age-rating">Default Age Rating</Label>
                <Select 
                  value={globalSettings.defaultAgeRating} 
                  onValueChange={(value) => setGlobalSettings({...globalSettings, defaultAgeRating: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="G">G - General Audiences</SelectItem>
                    <SelectItem value="PG">PG - Parental Guidance</SelectItem>
                    <SelectItem value="T">T - Teen</SelectItem>
                    <SelectItem value="M">M - Mature</SelectItem>
                    <SelectItem value="A">A - Adult</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-language">Default Language</Label>
                <Select 
                  value={globalSettings.defaultLanguage} 
                  onValueChange={(value) => setGlobalSettings({...globalSettings, defaultLanguage: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site-banner">Site-wide Banner</Label>
                <Textarea
                  id="site-banner"
                  value={globalSettings.siteBanner}
                  onChange={(e) => setGlobalSettings({...globalSettings, siteBanner: e.target.value})}
                  placeholder="Display a message across all pages..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Color Scheme
                </div>
                <Button onClick={previewColorScheme} variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </CardTitle>
              <CardDescription>Customize the main color scheme of your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={siteSettings.primary_color}
                      onChange={(e) => setSiteSettings({...siteSettings, primary_color: e.target.value})}
                      className="w-20"
                    />
                    <Input
                      value={siteSettings.primary_color}
                      onChange={(e) => setSiteSettings({...siteSettings, primary_color: e.target.value})}
                      placeholder="#f59e0b"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={siteSettings.secondary_color}
                      onChange={(e) => setSiteSettings({...siteSettings, secondary_color: e.target.value})}
                      className="w-20"
                    />
                    <Input
                      value={siteSettings.secondary_color}
                      onChange={(e) => setSiteSettings({...siteSettings, secondary_color: e.target.value})}
                      placeholder="#374151"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={siteSettings.accent_color}
                      onChange={(e) => setSiteSettings({...siteSettings, accent_color: e.target.value})}
                      className="w-20"
                    />
                    <Input
                      value={siteSettings.accent_color}
                      onChange={(e) => setSiteSettings({...siteSettings, accent_color: e.target.value})}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="background-color"
                      type="color"
                      value={siteSettings.background_color}
                      onChange={(e) => setSiteSettings({...siteSettings, background_color: e.target.value})}
                      className="w-20"
                    />
                    <Input
                      value={siteSettings.background_color}
                      onChange={(e) => setSiteSettings({...siteSettings, background_color: e.target.value})}
                      placeholder="#0f172a"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foreground-color">Text Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="foreground-color"
                      type="color"
                      value={siteSettings.foreground_color}
                      onChange={(e) => setSiteSettings({...siteSettings, foreground_color: e.target.value})}
                      className="w-20"
                    />
                    <Input
                      value={siteSettings.foreground_color}
                      onChange={(e) => setSiteSettings({...siteSettings, foreground_color: e.target.value})}
                      placeholder="#f1f5f9"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-md font-medium">Manga Theme Colors</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manga-red">Manga Red</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="manga-red"
                        type="color"
                        value={siteSettings.manga_red}
                        onChange={(e) => setSiteSettings({...siteSettings, manga_red: e.target.value})}
                        className="w-20"
                      />
                      <Input
                        value={siteSettings.manga_red}
                        onChange={(e) => setSiteSettings({...siteSettings, manga_red: e.target.value})}
                        placeholder="#ef4444"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manga-gold">Manga Gold</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="manga-gold"
                        type="color"
                        value={siteSettings.manga_gold}
                        onChange={(e) => setSiteSettings({...siteSettings, manga_gold: e.target.value})}
                        className="w-20"
                      />
                      <Input
                        value={siteSettings.manga_gold}
                        onChange={(e) => setSiteSettings({...siteSettings, manga_gold: e.target.value})}
                        placeholder="#f59e0b"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manga-blue">Manga Blue</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="manga-blue"
                        type="color"
                        value={siteSettings.manga_blue}
                        onChange={(e) => setSiteSettings({...siteSettings, manga_blue: e.target.value})}
                        className="w-20"
                      />
                      <Input
                        value={siteSettings.manga_blue}
                        onChange={(e) => setSiteSettings({...siteSettings, manga_blue: e.target.value})}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="hero-bg-url">Hero Background Image URL</Label>
                <Input
                  id="hero-bg-url"
                  value={siteSettings.hero_bg_url || ""}
                  onChange={(e) => setSiteSettings({...siteSettings, hero_bg_url: e.target.value || null})}
                  placeholder="https://example.com/hero-bg.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Background image for the homepage hero section
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-height">Hero Section Height</Label>
                <Select 
                  value={siteSettings.hero_height} 
                  onValueChange={(value) => setSiteSettings({...siteSettings, hero_height: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="40vh">Small (40vh)</SelectItem>
                    <SelectItem value="50vh">Medium (50vh)</SelectItem>
                    <SelectItem value="60vh">Large (60vh)</SelectItem>
                    <SelectItem value="70vh">Extra Large (70vh)</SelectItem>
                    <SelectItem value="80vh">Full Height (80vh)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  value={siteSettings.custom_css || ""}
                  onChange={(e) => setSiteSettings({...siteSettings, custom_css: e.target.value || null})}
                  placeholder="/* Add your custom CSS here */"
                  rows={6}
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Feature Settings
              </CardTitle>
              <CardDescription>Enable or disable site features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comments System</Label>
                  <p className="text-sm text-muted-foreground">Allow users to comment on chapters</p>
                </div>
                <Switch
                  checked={globalSettings.enableComments}
                  onCheckedChange={(checked) => setGlobalSettings({...globalSettings, enableComments: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bookmarks</Label>
                  <p className="text-sm text-muted-foreground">Allow users to bookmark pages</p>
                </div>
                <Switch
                  checked={globalSettings.enableBookmarks}
                  onCheckedChange={(checked) => setGlobalSettings({...globalSettings, enableBookmarks: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">Push notifications for new chapters</p>
                </div>
                <Switch
                  checked={globalSettings.enableNotifications}
                  onCheckedChange={(checked) => setGlobalSettings({...globalSettings, enableNotifications: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-upload">Max Upload Size (MB)</Label>
                <Input
                  id="max-upload"
                  type="number"
                  value={globalSettings.maxUploadSize}
                  onChange={(e) => setGlobalSettings({...globalSettings, maxUploadSize: parseInt(e.target.value)})}
                  min="1"
                  max="100"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>Site security and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
                </div>
                <Switch
                  checked={siteSettings.maintenance_mode}
                  onCheckedChange={(checked) => setSiteSettings({...siteSettings, maintenance_mode: checked})}
                />
              </div>

              {siteSettings.maintenance_mode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenance-message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance-message"
                    value={siteSettings.maintenance_message || ""}
                    onChange={(e) => setSiteSettings({...siteSettings, maintenance_message: e.target.value || null})}
                    placeholder="We're currently performing maintenance. Please check back later."
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Advanced Settings
              </CardTitle>
              <CardDescription>Advanced configuration options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="analytics-code">Analytics Code</Label>
                <Textarea
                  id="analytics-code"
                  value={siteSettings.analytics_code || ""}
                  onChange={(e) => setSiteSettings({...siteSettings, analytics_code: e.target.value || null})}
                  placeholder="<!-- Google Analytics or other tracking code -->"
                  rows={4}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-js">Custom JavaScript</Label>
                <Textarea
                  id="custom-js"
                  value={siteSettings.custom_js || ""}
                  onChange={(e) => setSiteSettings({...siteSettings, custom_js: e.target.value || null})}
                  placeholder="// Add your custom JavaScript here"
                  rows={6}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Warning: Only add trusted JavaScript code. Malicious code can compromise your site.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};