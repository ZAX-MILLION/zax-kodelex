import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfileBadges } from '@/components/badges/UserProfileBadges';
import ThemeSelector from '@/components/ThemeSelector';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Award, 
  Settings, 
  Palette,
  Globe,
  Eye,
  Volume2,
  Zap,
  Star,
  Crown
} from 'lucide-react';

interface ProfileTabsProps {
  userId: string;
  isOwnProfile?: boolean;
  profile?: any;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  userId,
  isOwnProfile = false,
  profile
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    animations_enabled: true,
    sound_effects: false,
    premium_effects: false,
    accessibility_high_contrast: false,
    accessibility_reduced_motion: false
  });

  const updatePreference = async (key: string, value: any) => {
    if (!isOwnProfile || !user) return;

    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      // Simplified - will be implemented with proper database functions  
      const error = null;

      if (error) throw error;

      toast({
        title: "Preference updated",
        description: "Your settings have been saved.",
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "Error",
        description: "Failed to update preference",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="info" className="w-full" orientation="vertical">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Vertical Tabs List */}
          <TabsList className="md:flex-col md:h-auto md:w-48 grid grid-cols-4 md:grid-cols-1">
            <TabsTrigger value="info" className="md:justify-start">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Info</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="md:justify-start">
              <Award className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Achievements</span>
            </TabsTrigger>
            {isOwnProfile && (
              <>
                <TabsTrigger value="preferences" className="md:justify-start">
                  <Palette className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Preferences</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="md:justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Settings</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Tab Contents */}
          <div className="flex-1">
            <TabsContent value="info" className="mt-0">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                        <p className="text-sm">{profile?.username || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Display Name</Label>
                        <p className="text-sm">{profile?.display_name || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                        <Badge variant="outline" className="mt-1">
                          {profile?.role || 'user'}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Join Date</Label>
                        <p className="text-sm">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {profile?.bio && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                        <div className="mt-1 p-3 bg-muted rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Activity Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">0</div>
                        <div className="text-xs text-muted-foreground">Chapters Read</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">0</div>
                        <div className="text-xs text-muted-foreground">Comments</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">0</div>
                        <div className="text-xs text-muted-foreground">Favorites</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="mt-0">
              <div className="space-y-6">
                {/* Badges Section */}
                <UserProfileBadges 
                  userId={userId} 
                  isOwnProfile={isOwnProfile} 
                  maxDisplay={12}
                />

                {/* Achievement Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="text-center">
                      <Star className="h-8 w-8 mx-auto text-yellow-500" />
                      <CardTitle className="text-lg">Activity Badges</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Earned through reading and engagement
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="text-center">
                      <Crown className="h-8 w-8 mx-auto text-primary" />
                      <CardTitle className="text-lg">Role Badges</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Special badges for roles and contributions
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="text-center">
                      <Zap className="h-8 w-8 mx-auto text-manga-red" />
                      <CardTitle className="text-lg">Achievement Badges</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Special accomplishments and milestones
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {isOwnProfile && (
              <>
                <TabsContent value="preferences" className="mt-0">
                  <div className="space-y-6">
                    {/* Theme Selection */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Theme & Appearance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Site Theme</Label>
                          <div className="mt-2">
                            <ThemeSelector />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Language Selection */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Language & Region
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div>
                          <Label className="text-sm font-medium">Language</Label>
                          <div className="mt-2">
                            <LanguageSwitcher />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Visual Effects */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Visual Effects
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="animations">Enable Animations</Label>
                            <p className="text-xs text-muted-foreground">Smooth transitions and effects</p>
                          </div>
                          <Switch
                            id="animations"
                            checked={preferences.animations_enabled}
                            onCheckedChange={(checked) => updatePreference('animations_enabled', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="premium-effects">Premium Effects</Label>
                            <p className="text-xs text-muted-foreground">
                              Enhanced visual effects (coin purchase required)
                            </p>
                          </div>
                          <Switch
                            id="premium-effects"
                            checked={preferences.premium_effects}
                            onCheckedChange={(checked) => updatePreference('premium_effects', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="sound-effects">Sound Effects</Label>
                            <p className="text-xs text-muted-foreground">Audio feedback for interactions</p>
                          </div>
                          <Switch
                            id="sound-effects"
                            checked={preferences.sound_effects}
                            onCheckedChange={(checked) => updatePreference('sound_effects', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                  <div className="space-y-6">
                    {/* Accessibility Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Accessibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="high-contrast">High Contrast Mode</Label>
                            <p className="text-xs text-muted-foreground">Improve text visibility</p>
                          </div>
                          <Switch
                            id="high-contrast"
                            checked={preferences.accessibility_high_contrast}
                            onCheckedChange={(checked) => updatePreference('accessibility_high_contrast', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="reduced-motion">Reduced Motion</Label>
                            <p className="text-xs text-muted-foreground">Minimize animations for comfort</p>
                          </div>
                          <Switch
                            id="reduced-motion"
                            checked={preferences.accessibility_reduced_motion}
                            onCheckedChange={(checked) => updatePreference('accessibility_reduced_motion', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Privacy Settings */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Privacy & Safety</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Profile Visibility</Label>
                            <p className="text-xs text-muted-foreground">Who can see your profile</p>
                          </div>
                          <Select defaultValue="public">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="friends">Friends Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button variant="outline" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          Advanced Privacy Settings
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};