import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CreativeNavBar from '@/components/CreativeNavBar';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Volume2, 
  Eye,
  Moon,
  Sun,
  Monitor,
  Languages,
  Save,
  Lock,
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';

interface UserPreferences {
  theme: string;
  language: string;
  autoplay: boolean;
  notifications: boolean;
  email_notifications: boolean;
  comment_notifications: boolean;
  reading_direction: string;
  font_size: number;
  dark_mode: string; // 'light', 'dark', 'system'
  privacy_mode: boolean;
  auto_mark_read: boolean;
}

const Settings = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'default',
    language: 'en',
    autoplay: false,
    notifications: true,
    email_notifications: true,
    comment_notifications: true,
    reading_direction: 'ltr',
    font_size: 16,
    dark_mode: 'system',
    privacy_mode: false,
    auto_mark_read: true
  });

  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      // Load from local storage for now since we don't have a preferences table yet
      const stored = localStorage.getItem('user_preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(prev => ({
          ...prev,
          ...parsed
        }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Save to local storage for now
      localStorage.setItem('user_preferences', JSON.stringify(preferences));

      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
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

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const themes = [
    { value: 'default', label: 'Zax Million Default' },
    { value: 'cyberpunk', label: 'Cyberpunk Neon' },
    { value: 'zen', label: 'Zen Minimalist' },
    { value: 'sakura', label: 'Shiranami Sakura' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語 (Japanese)' },
    { value: 'ko', label: '한국어 (Korean)' },
    { value: 'zh', label: '中文 (Chinese)' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
        <CreativeNavBar />
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="space-y-6">
            <SettingsIcon className="h-24 w-24 mx-auto text-muted-foreground/50" />
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>
              <p className="text-muted-foreground">You need to be logged in to access settings</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and reading preferences</p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-card/20 backdrop-blur-sm border border-border/30">
            <TabsTrigger value="appearance" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Palette className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="reading" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Eye className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Reading</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Shield className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="p-6 bg-card/20 border-border/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Appearance</h3>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Theme
                    </Label>
                    <Select value={preferences.theme} onValueChange={(value) => updatePreference('theme', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        {themes.map((theme) => (
                          <SelectItem key={theme.value} value={theme.value}>
                            {theme.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Language
                    </Label>
                    <Select value={preferences.language} onValueChange={(value) => updatePreference('language', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="opacity-30" />

                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Dark Mode
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant={preferences.dark_mode === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('dark_mode', 'light')}
                      className="flex items-center gap-2"
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={preferences.dark_mode === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('dark_mode', 'dark')}
                      className="flex items-center gap-2"
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={preferences.dark_mode === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('dark_mode', 'system')}
                      className="flex items-center gap-2"
                    >
                      <Monitor className="h-4 w-4" />
                      System
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Reading Settings */}
          <TabsContent value="reading" className="space-y-6">
            <Card className="p-6 bg-card/20 border-border/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Reading Preferences</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Font Size: {preferences.font_size}px</Label>
                  <Slider
                    value={[preferences.font_size]}
                    onValueChange={(value) => updatePreference('font_size', value[0])}
                    max={24}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reading Direction</Label>
                  <Select value={preferences.reading_direction} onValueChange={(value) => updatePreference('reading_direction', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reading direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ltr">Left to Right</SelectItem>
                      <SelectItem value="rtl">Right to Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-mark as Read</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically mark chapters as read when finished
                    </p>
                  </div>
                  <Switch
                    checked={preferences.auto_mark_read}
                    onCheckedChange={(checked) => updatePreference('auto_mark_read', checked)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6 bg-card/20 border-border/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Notifications</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new chapters and updates
                    </p>
                  </div>
                  <Switch
                    checked={preferences.notifications}
                    onCheckedChange={(checked) => updatePreference('notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about new chapters
                    </p>
                  </div>
                  <Switch
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comment Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone replies to your comments
                    </p>
                  </div>
                  <Switch
                    checked={preferences.comment_notifications}
                    onCheckedChange={(checked) => updatePreference('comment_notifications', checked)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="p-6 bg-card/20 border-border/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Privacy & Security</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Privacy Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Hide your reading activity from other users
                    </p>
                  </div>
                  <Switch
                    checked={preferences.privacy_mode}
                    onCheckedChange={(checked) => updatePreference('privacy_mode', checked)}
                  />
                </div>

                <Separator className="opacity-30" />

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Data & Privacy</h4>
                  <div className="grid gap-3">
                    <Button variant="outline" className="justify-start">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="justify-start">
                      Download My Data
                    </Button>
                    <Button variant="destructive" className="justify-start">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card className="p-6 bg-card/20 border-border/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Account Information</h3>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={userProfile?.role || 'User'} disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <Input 
                    value={userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'Unknown'} 
                    disabled 
                  />
                </div>

                <Separator className="opacity-30" />

                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Account Actions</h4>
                  <div className="grid gap-3">
                    <Button variant="outline" className="justify-start">
                      Export Reading Data
                    </Button>
                    <Button variant="outline" className="justify-start">
                      Reset Preferences
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button 
            onClick={savePreferences} 
            disabled={loading}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;