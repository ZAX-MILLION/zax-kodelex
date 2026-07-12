import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MarkdownBio } from './MarkdownBio';
import { ProfileImageUpload } from './ProfileImageUpload';
import { 
  User, 
  Save, 
  X, 
  Eye, 
  Globe, 
  Plus, 
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';

interface SocialLink {
  label: string;
  url: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
    external_link: '',
    profile_picture_url: '',
    banner_image_url: ''
  });
  
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      fetchCurrentProfile();
    }
  }, [isOpen, user]);

  const fetchCurrentProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setFormData({
        display_name: data.display_name || '',
        username: data.username || '',
        bio: data.bio || '',
        external_link: (data as any).external_link || '',
        profile_picture_url: data.profile_picture_url || '',
        banner_image_url: data.banner_image_url || ''
      });
      
      // Load social links
      try {
        const links = data.social_links 
          ? (typeof data.social_links === 'object' && !Array.isArray(data.social_links)
              ? Object.entries(data.social_links).map(([label, url]) => ({ label, url: url as string }))
              : [])
          : [];
        setSocialLinks(Array.isArray(links) ? links : []);
      } catch {
        setSocialLinks([]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    setSocialLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ));
  };

  const addSocialLink = () => {
    setSocialLinks(prev => [...prev, { label: '', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpdate = (type: 'avatar' | 'banner') => (url: string) => {
    if (type === 'avatar') {
      setFormData(prev => ({ ...prev, profile_picture_url: url }));
    } else {
      setFormData(prev => ({ ...prev, banner_image_url: url }));
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Convert social links to the format expected by the database
      const socialLinksObj = socialLinks
        .filter(link => link.label && link.url)
        .reduce((acc, link) => ({ ...acc, [link.label]: link.url }), {});

      const updateData = {
        ...formData,
        social_links: socialLinksObj
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      onProfileUpdated?.();
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="Your display name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="@username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="external_link">Website/Link</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="external_link"
                      value={formData.external_link}
                      onChange={(e) => handleInputChange('external_link', e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell others about yourself... 

**Bold text** - Bold formatting
*Italic text* - Italic formatting  
[Link text](https://example.com) - Links
- List items

RTL languages fully supported 🌍"
                    rows={8}
                    className="resize-none font-mono text-sm"
                    style={{ direction: /[\u0600-\u06FF]/.test(formData.bio) ? 'rtl' : 'ltr' }}
                  />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>✨ <strong>Markdown supported:</strong> **bold**, *italic*, [links](url), lists</p>
                    <p>🌍 <strong>RTL languages:</strong> Arabic, Farsi, Hebrew auto-detected</p>
                    <p>📝 <strong>Max length:</strong> 500 characters</p>
                  </div>
                </div>
              </div>

              {/* Bio Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.bio ? (
                    <MarkdownBio 
                      content={formData.bio} 
                      className="text-sm"
                      maxLength={500}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Your bio preview will appear here as you type...
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Picture Upload */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Picture
                </h3>
                <ProfileImageUpload
                  type="avatar"
                  currentUrl={formData.profile_picture_url}
                  onImageUpdate={handleImageUpdate('avatar')}
                />
              </div>

              {/* Banner Upload */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Profile Banner
                </h3>
                <ProfileImageUpload
                  type="banner"
                  currentUrl={formData.banner_image_url}
                  onImageUpdate={handleImageUpdate('banner')}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Social Links
                  </div>
                  <Button size="sm" onClick={addSocialLink}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialLinks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No social links added yet. Click "Add Link" to get started.
                  </p>
                ) : (
                  socialLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Label (e.g., Website, Twitter)"
                        value={link.label}
                        onChange={(e) => handleSocialLinkChange(index, 'label', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSocialLink(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>

    </Dialog>
  );
};