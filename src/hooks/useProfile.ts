import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  user_id: string;
  email: string;
  username?: string;
  display_name?: string;
  bio?: string;
  profile_picture_url?: string;
  banner_image_url?: string;
  theme_preference?: string;
  social_links?: Record<string, string>;
  premium_effects_enabled?: boolean;
  join_date?: string;
  is_profile_public?: boolean;
  role: string;
  is_banned: boolean;
  created_at: string;
  badges?: UserBadge[];
}

export interface UserBadge {
  badge_id: string;
  badge_name: string;
  badge_description?: string;
  badge_icon_url?: string;
  badge_color?: string;
  badge_rarity?: string;
  is_premium?: boolean;
  is_animated?: boolean;
  is_equipped?: boolean;
  display_order?: number;
}

export interface ProfileTheme {
  theme_id: string;
  theme_name: string;
  theme_description?: string;
  css_variables: Record<string, string>;
  is_premium: boolean;
  coin_cost: number;
  preview_image_url?: string;
}

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_user_profile_data', {
        target_user_id: userId
      });

      if (error) throw error;
      
      // Record profile visit
      await supabase.rpc('record_profile_visit', {
        target_user_id: userId
      });

      return data as unknown as UserProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('user_id', updates.user_id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfileImage = async (file: File, type: 'avatar' | 'banner', userId: string) => {
    try {
      setLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      const column = type === 'avatar' ? 'profile_picture_url' : 'banner_image_url';
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [column]: data.publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      toast({
        title: "Image uploaded",
        description: `Your ${type} has been updated successfully.`,
      });

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: `Failed to upload ${type}.`,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableThemes = async (): Promise<ProfileTheme[]> => {
    try {
      const { data, error } = await supabase
        .from('profile_themes')
        .select('*')
        .eq('is_active', true)
        .order('is_premium', { ascending: true })
        .order('coin_cost', { ascending: true });

      if (error) throw error;
      return (data || []).map(theme => ({
        ...theme,
        css_variables: theme.css_variables as Record<string, string>
      }));
    } catch (error) {
      console.error('Error fetching themes:', error);
      return [];
    }
  };

  const equipBadge = async (userId: string, badgeId: string, equipped: boolean) => {
    try {
      const { error } = await supabase
        .from('user_badge_assignments')
        .update({ is_equipped: equipped })
        .eq('user_id', userId)
        .eq('badge_id', badgeId);

      if (error) throw error;

      toast({
        title: equipped ? "Badge equipped" : "Badge unequipped",
        description: `Badge has been ${equipped ? 'equipped' : 'unequipped'} successfully.`,
      });

      return true;
    } catch (error) {
      console.error('Error updating badge:', error);
      return false;
    }
  };

  const addUserNote = async (targetUserId: string, content: string, noteType: string = 'user') => {
    try {
      const { error } = await supabase
        .from('user_notes')
        .insert({
          target_user_id: targetUserId,
          note_author_id: (await supabase.auth.getUser()).data.user?.id,
          note_content: content,
          note_type: noteType
        });

      if (error) throw error;
      
      toast({
        title: "Note added",
        description: "Your note has been saved.",
      });

      return true;
    } catch (error) {
      console.error('Error adding note:', error);
      return false;
    }
  };

  return {
    loading,
    getProfile,
    updateProfile,
    uploadProfileImage,
    getAvailableThemes,
    equipBadge,
    addUserNote
  };
};