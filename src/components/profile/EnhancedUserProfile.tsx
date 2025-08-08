import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import LazyImage from '@/components/LazyImage';
import { useProfile, UserProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  MessageCircle,
  UserPlus,
  Flag,
  Shield,
  Calendar,
  ExternalLink,
  Eye,
  Sparkles,
  Crown,
  Star,
  User,
  Camera,
  Edit,
  Settings,
  StickyNote
} from 'lucide-react';

interface EnhancedUserProfileProps {
  userId: string;
  trigger: React.ReactNode;
  onClose?: () => void;
}

export const EnhancedUserProfile: React.FC<EnhancedUserProfileProps> = ({
  userId,
  trigger,
  onClose
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const { getProfile, addUserNote, loading } = useProfile();
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        setIsAdmin(profileData?.role === 'admin');
      }
    };
    
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (open && userId) {
      loadProfile();
    }
  }, [open, userId]);

  const loadProfile = async () => {
    const profileData = await getProfile(userId);
    setProfile(profileData);
  };

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    
    const success = await addUserNote(userId, note, isAdmin ? 'admin' : 'user');
    if (success) {
      setNote('');
    }
  };

  const handleMessage = () => {
    // Implement messaging functionality
    toast({
      title: "Feature coming soon",
      description: "Direct messaging will be available soon.",
    });
  };

  const handleReport = () => {
    // Implement reporting functionality
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe.",
    });
  };

  const getBadgeIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <Crown className="h-4 w-4" />;
      case 'epic':
        return <Sparkles className="h-4 w-4" />;
      case 'rare':
        return <Star className="h-4 w-4" />;
      default:
        return null;
    }
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

  if (!profile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const joinDate = new Date(profile.join_date || profile.created_at).toLocaleDateString();
  const socialLinks = profile.social_links || {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="relative">
          {/* Banner Image */}
          <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 relative overflow-hidden">
            {profile.banner_image_url ? (
              <LazyImage
                src={profile.banner_image_url}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/30 to-secondary/30" />
            )}
            
            {/* Premium Effects Overlay */}
            {profile.premium_effects_enabled && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-purple-400/10 animate-pulse" />
            )}
          </div>

          {/* Profile Header */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end space-x-4 -mt-16">
              {/* Avatar */}
              <div className={`relative ${profile.premium_effects_enabled ? 'animate-pulse' : ''}`}>
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage 
                    src={profile.profile_picture_url} 
                    alt={profile.display_name || profile.username || 'User'} 
                  />
                  <AvatarFallback className="text-2xl">
                    {(profile.display_name || profile.username || 'U')[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Premium border effect */}
                {profile.premium_effects_enabled && (
                  <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-spin-slow opacity-60" />
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 mt-16 space-y-2">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold">
                    {profile.display_name || profile.username || 'Unknown User'}
                  </h2>
                  
                  {/* Role Badge */}
                  <Badge variant={profile.role === 'admin' ? 'destructive' : 'secondary'}>
                    {profile.role}
                  </Badge>
                  
                  {profile.is_banned && (
                    <Badge variant="destructive">
                      <Shield className="h-3 w-3 mr-1" />
                      Banned
                    </Badge>
                  )}
                </div>

                {isAdmin && (
                  <p className="text-sm text-muted-foreground">
                    Email: {profile.email}
                  </p>
                )}

                <div className="flex items-center text-sm text-muted-foreground space-x-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {joinDate}
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    Profile visits tracked
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 mt-16">
                {!isOwnProfile && (
                  <>
                    <Button onClick={handleMessage} size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleReport}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </Button>
                  </>
                )}
                
                {isOwnProfile && (
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[60vh] px-6">
            <div className="space-y-6">
              {/* Badges */}
              {profile.badges && profile.badges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 mr-2" />
                      Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {profile.badges
                        .filter(badge => badge.is_equipped)
                        .map((badge) => (
                          <div
                            key={badge.badge_id}
                            className={`p-3 rounded-lg border-2 bg-gradient-to-br ${getRarityColor(badge.badge_rarity || 'common')} text-white relative overflow-hidden group`}
                          >
                            <div className="flex items-center space-x-2">
                              {getBadgeIcon(badge.badge_rarity || 'common')}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {badge.badge_name}
                                </p>
                                <p className="text-xs opacity-80 truncate">
                                  {badge.badge_description}
                                </p>
                              </div>
                            </div>
                            
                            {badge.is_animated && (
                              <div className="absolute inset-0 bg-white/10 animate-pulse" />
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bio */}
              {profile.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{profile.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Social Links */}
              {Object.keys(socialLinks).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(socialLinks).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {platform}: {url}
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin/User Notes */}
              {(isOwnProfile || isAdmin) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <StickyNote className="h-5 w-5 mr-2" />
                      {isAdmin ? 'Admin Notes' : 'Personal Notes'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder={isAdmin ? "Add an admin note..." : "Add a personal note..."}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button onClick={handleSaveNote} disabled={!note.trim()}>
                      Save Note
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};