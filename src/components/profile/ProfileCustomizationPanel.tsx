import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProfile, UserProfile, ProfileTheme } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  Palette,
  Star,
  Coins,
  Camera,
  Edit,
  Save,
  X,
  Sparkles,
  Crown,
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';

interface ProfileCustomizationPanelProps {
  userId: string;
  onClose?: () => void;
}

export const ProfileCustomizationPanel: React.FC<ProfileCustomizationPanelProps> = ({
  userId,
  onClose
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [themes, setThemes] = useState<ProfileTheme[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  
  const { getProfile, updateProfile, uploadProfileImage, getAvailableThemes, equipBadge } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    
    // Load profile
    const profileData = await getProfile(userId);
    setProfile(profileData);
    setSocialLinks(profileData?.social_links || {});
    
    // Load themes
    const themesData = await getAvailableThemes();
    setThemes(themesData);
    
    // Load user badges
    const { data: badgesData } = await supabase
      .from('user_badge_assignments')
      .select(`
        *,
        user_badges (*)
      `)
      .eq('user_id', userId);
    
    setUserBadges(badgesData || []);
    
    // Load coin balance
    const { data: walletData } = await supabase
      .from('coin_wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    setCoinBalance(walletData?.balance || 0);
    setLoading(false);
  };

  const handleProfileUpdate = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    
    const success = await updateProfile({ ...updates, user_id: userId });
    if (success) {
      setProfile({ ...profile, ...updates });
    }
  };

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    const url = await uploadProfileImage(file, type, userId);
    if (url && profile) {
      const column = type === 'avatar' ? 'profile_picture_url' : 'banner_image_url';
      setProfile({ ...profile, [column]: url });
    }
  };

  const handleThemeChange = async (themeId: string) => {
    const theme = themes.find(t => t.theme_id === themeId);
    if (!theme) return;
    
    // Check if user has enough coins for premium theme
    if (theme.is_premium && coinBalance < theme.coin_cost) {
      toast({
        title: "Insufficient coins",
        description: `You need ${theme.coin_cost} coins to unlock this theme.`,
        variant: "destructive",
      });
      return;
    }
    
    // If premium theme, deduct coins
    if (theme.is_premium) {
      const { error } = await supabase.rpc('process_coin_transaction', {
        user_id_param: userId,
        amount_param: theme.coin_cost,
        type_param: 'spend',
        context_param: 'theme_unlock',
        description_param: `Unlocked ${theme.theme_name} theme`
      });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to purchase theme.",
          variant: "destructive",
        });
        return;
      }
      
      setCoinBalance(prev => prev - theme.coin_cost);
    }
    
    await handleProfileUpdate({ theme_preference: themeId });
  };

  const handleBadgeToggle = async (badgeId: string, equipped: boolean) => {
    const success = await equipBadge(userId, badgeId, equipped);
    if (success) {
      setUserBadges(prev => 
        prev.map(badge => 
          badge.badge_id === badgeId 
            ? { ...badge, is_equipped: equipped }
            : badge
        )
      );
    }
  };

  const handleAddSocialLink = () => {
    if (newSocialPlatform && newSocialUrl) {
      const updatedLinks = { ...socialLinks, [newSocialPlatform]: newSocialUrl };
      setSocialLinks(updatedLinks);
      handleProfileUpdate({ social_links: updatedLinks });
      setNewSocialPlatform('');
      setNewSocialUrl('');
    }
  };

  const handleRemoveSocialLink = (platform: string) => {
    const updatedLinks = { ...socialLinks };
    delete updatedLinks[platform];
    setSocialLinks(updatedLinks);
    handleProfileUpdate({ social_links: updatedLinks });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-yellow-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'uncommon':
        return 'from-green-400 to-green-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile Customization</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">{coinBalance} coins</span>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Pictures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Profile Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.profile_picture_url} />
                  <AvatarFallback>
                    {(profile.display_name || profile.username || 'U')[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar-upload">Profile Picture</Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'avatar');
                    }}
                  />
                </div>
              </div>

              {/* Banner */}
              <div className="space-y-2">
                <Label htmlFor="banner-upload">Banner Image</Label>
                <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg overflow-hidden relative">
                  {profile.banner_image_url && (
                    <img 
                      src={profile.banner_image_url} 
                      alt="Banner" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                </div>
                <Input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'banner');
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={profile.display_name || ''}
                  onChange={(e) => handleProfileUpdate({ display_name: e.target.value })}
                  placeholder="Your display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => handleProfileUpdate({ bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={profile.is_profile_public}
                  onCheckedChange={(checked) => handleProfileUpdate({ is_profile_public: checked })}
                />
                <Label>Make profile public</Label>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExternalLink className="h-5 w-5 mr-2" />
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Links */}
              {Object.entries(socialLinks).map(([platform, url]) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Input value={platform} disabled className="flex-1" />
                  <Input value={url} disabled className="flex-2" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveSocialLink(platform)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Add New Link */}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Platform"
                  value={newSocialPlatform}
                  onChange={(e) => setNewSocialPlatform(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="URL"
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  className="flex-2"
                />
                <Button onClick={handleAddSocialLink}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="themes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Profile Themes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.theme_id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                      profile.theme_preference === theme.theme_id 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border'
                    }`}
                    onClick={() => handleThemeChange(theme.theme_id)}
                  >
                    {/* Theme Preview */}
                    <div 
                      className="h-20 rounded mb-3"
                      style={{
                        background: theme.css_variables.bg || '#ffffff',
                        color: theme.css_variables.text || '#000000'
                      }}
                    >
                      <div className="p-2 text-xs">
                        Preview
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{theme.theme_name}</h3>
                        {theme.is_premium && (
                          <div className="flex items-center space-x-1 text-yellow-500">
                            <Coins className="h-4 w-4" />
                            <span className="text-sm">{theme.coin_cost}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {theme.theme_description}
                      </p>
                      
                      {profile.theme_preference === theme.theme_id && (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Badge Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userBadges.map((assignment) => {
                  const badge = assignment.user_badges;
                  return (
                    <div
                      key={assignment.id}
                      className={`p-4 rounded-lg border-2 bg-gradient-to-br ${getRarityColor(badge.badge_rarity)} text-white relative`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{badge.badge_name}</h3>
                        <Switch
                          checked={assignment.is_equipped}
                          onCheckedChange={(checked) => 
                            handleBadgeToggle(badge.badge_id, checked)
                          }
                        />
                      </div>
                      
                      <p className="text-sm opacity-90 mb-2">
                        {badge.badge_description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize">{badge.badge_rarity}</span>
                        {badge.is_premium && <Crown className="h-4 w-4" />}
                        {badge.is_animated && <Sparkles className="h-4 w-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Premium Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Enable Premium Effects</h3>
                  <p className="text-sm text-muted-foreground">
                    Add animated borders and glow effects to your profile
                  </p>
                </div>
                <Switch
                  checked={profile.premium_effects_enabled}
                  onCheckedChange={(checked) => 
                    handleProfileUpdate({ premium_effects_enabled: checked })
                  }
                />
              </div>

              {/* Effect Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Animated Avatar Border</h4>
                  <div className="relative w-16 h-16 mx-auto">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={profile.profile_picture_url} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    {profile.premium_effects_enabled && (
                      <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-spin-slow" />
                    )}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Profile Glow</h4>
                  <div 
                    className={`w-full h-16 rounded ${
                      profile.premium_effects_enabled 
                        ? 'bg-gradient-to-r from-yellow-400/20 to-purple-400/20 animate-pulse' 
                        : 'bg-muted'
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
