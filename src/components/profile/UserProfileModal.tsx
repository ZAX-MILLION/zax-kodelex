import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Globe, 
  MessageSquare, 
  Settings, 
  User,
  Shield,
  Edit3,
  ExternalLink,
  Flag,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';
import { MarkdownBio } from './MarkdownBio';

interface ProfileData {
  user_id: string;
  username: string | null;
  display_name: string | null;
  email: string;
  bio: string | null;
  profile_picture_url: string | null;
  banner_image_url: string | null;
  external_link: string | null;
  social_links: any;
  role: string;
  created_at: string;
  join_date: string | null;
  is_profile_public: boolean | null;
}

interface UserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  isOpen,
  onClose,
  isOwnProfile = false,
  onEditProfile
}) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserProfile();
    }
  }, [userId, isOpen]);

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile({
        ...data,
        external_link: (data as any).external_link || null
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'author': return <Edit3 className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'author': return 'default';
      default: return 'secondary';
    }
  };


  const getSocialLinks = () => {
    if (!profile?.social_links) return [];
    try {
      const links = typeof profile.social_links === 'string' 
        ? JSON.parse(profile.social_links) 
        : profile.social_links;
      
      if (typeof links === 'object' && !Array.isArray(links)) {
        return Object.entries(links).map(([label, url]) => ({ label, url }));
      }
      return Array.isArray(links) ? links : [];
    } catch {
      return [];
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Banner */}
            <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg overflow-hidden">
              {profile.banner_image_url && (
                <img 
                  src={profile.banner_image_url} 
                  alt="Profile banner"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Profile Header */}
            <div className="relative -mt-16 px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={profile.profile_picture_url || ''} />
                  <AvatarFallback className="text-2xl">
                    {profile.display_name?.[0]?.toUpperCase() || 
                     profile.username?.[0]?.toUpperCase() || 
                     profile.email[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h2 className="text-2xl font-bold">
                      {profile.display_name || profile.username || profile.email.split('@')[0]}
                    </h2>
                    <Badge variant={getRoleBadgeColor(profile.role)}>
                      {getRoleIcon(profile.role)}
                      <span className="ml-1 capitalize">{profile.role}</span>
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {format(new Date(profile.join_date || profile.created_at), 'MMMM yyyy')}
                    </div>
                    {profile.username && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        @{profile.username}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Button onClick={onEditProfile} size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserX className="h-4 w-4 mr-2" />
                        Block
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Profile Content */}
            <div className="px-6 space-y-6">
              {/* Bio */}
              {profile.bio && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">About</h3>
                    <MarkdownBio 
                      content={profile.bio} 
                      className="text-sm"
                    />
                  </CardContent>
                </Card>
              )}

              {/* External Link */}
              {profile.external_link && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">Website</h3>
                    <a
                      href={profile.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      {profile.external_link}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardContent>
                </Card>
              )}

              {/* Social Links */}
              {getSocialLinks().length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">Links</h3>
                    <div className="space-y-2">
                      {getSocialLinks().map((link: any, index: number) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          {link.label || link.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats Preview */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Activity</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold">0</div>
                      <div className="text-xs text-muted-foreground">Chapters Read</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">0</div>
                      <div className="text-xs text-muted-foreground">Comments</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">0</div>
                      <div className="text-xs text-muted-foreground">Bookmarks</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};