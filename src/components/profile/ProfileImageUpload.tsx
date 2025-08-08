import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Camera, X, Crop } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileImageUploadProps {
  type: 'avatar' | 'banner';
  currentUrl?: string;
  onImageUpdate: (url: string) => void;
  className?: string;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  type,
  currentUrl,
  onImageUpdate,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for avatar, 10MB for banner
  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  const recommendations = {
    avatar: {
      size: '200x200px',
      aspectRatio: '1:1 (Square)',
      maxSize: '5MB'
    },
    banner: {
      size: '1200x300px',
      aspectRatio: '4:1 (Wide)',
      maxSize: '10MB'
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload images.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Please upload an image smaller than ${recommendations[type].maxSize}.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      if (!data.publicUrl) throw new Error('Failed to get public URL');

      // Update profile in database
      const updateField = type === 'avatar' ? 'profile_picture_url' : 'banner_image_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: data.publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onImageUpdate(data.publicUrl);
      
      toast({
        title: "Success",
        description: `${type === 'avatar' ? 'Profile picture' : 'Banner'} updated successfully!`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearImage = async () => {
    if (!user) return;

    try {
      setUploading(true);
      
      const updateField = type === 'avatar' ? 'profile_picture_url' : 'banner_image_url';
      const { error } = await supabase
        .from('profiles')
        .update({ [updateField]: null })
        .eq('user_id', user.id);

      if (error) throw error;

      onImageUpdate('');
      
      toast({
        title: "Success",
        description: `${type === 'avatar' ? 'Profile picture' : 'Banner'} removed successfully!`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="space-y-4">
            {type === 'avatar' ? (
              <div className="flex justify-center">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage src={currentUrl} />
                  <AvatarFallback className="text-2xl">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="w-full h-32 rounded-lg border-2 border-border overflow-hidden bg-muted">
                {currentUrl ? (
                  <img 
                    src={currentUrl} 
                    alt="Profile banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Camera className="h-8 w-8" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop an image here, or click to select
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={triggerFileSelect}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={triggerFileSelect}
              disabled={uploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : `Upload ${type === 'avatar' ? 'Avatar' : 'Banner'}`}
            </Button>
            {currentUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearImage}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Recommendations */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Recommended:</strong> {recommendations[type].size}</p>
            <p><strong>Aspect Ratio:</strong> {recommendations[type].aspectRatio}</p>
            <p><strong>Max Size:</strong> {recommendations[type].maxSize}</p>
            <p><strong>Formats:</strong> JPEG, PNG, WebP</p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};