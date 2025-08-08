import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, Check } from 'lucide-react';
import { ChildTheme } from '@/hooks/useChildTheme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface ThemeScreenshotsProps {
  theme: ChildTheme;
  onScreenshotUpdate?: (url: string) => void;
}

// Enhancement 8: Preview screenshots and layout mockups
export const ThemeScreenshots: React.FC<ThemeScreenshotsProps> = ({ 
  theme, 
  onScreenshotUpdate 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(theme.preview_image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const captureScreenshot = async () => {
    try {
      setIsCapturing(true);
      
      // Find the preview container or main content area
      const targetElement = document.querySelector('[data-theme-preview]') || 
                           document.querySelector('main') || 
                           document.body;

      if (!targetElement) {
        throw new Error('No suitable element found for screenshot');
      }

      const canvas = await html2canvas(targetElement as HTMLElement, {
        width: 1200,
        height: 800,
        scale: 0.75,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.8);
      });

      await uploadScreenshot(blob, `${theme.name}-screenshot-${Date.now()}.png`);
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      toast({
        title: "Screenshot Failed",
        description: "Failed to capture theme screenshot.",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadScreenshot(file, file.name);
    }
  };

  const uploadScreenshot = async (file: File | Blob, fileName: string) => {
    try {
      setIsUploading(true);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('theme-screenshots')
        .upload(`${theme.id}/${fileName}`, file, {
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('theme-screenshots')
        .getPublicUrl(data.path);

      // Update theme record
      const { error: updateError } = await supabase
        .from('child_themes')
        .update({ preview_image_url: publicUrl })
        .eq('id', theme.id);

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      onScreenshotUpdate?.(publicUrl);

      toast({
        title: "Screenshot Updated",
        description: "Theme preview image has been updated successfully."
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload screenshot.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeScreenshot = async () => {
    try {
      const { error } = await supabase
        .from('child_themes')
        .update({ preview_image_url: null })
        .eq('id', theme.id);

      if (error) throw error;

      setPreviewUrl(null);
      onScreenshotUpdate?.(null as any);

      toast({
        title: "Screenshot Removed",
        description: "Theme preview image has been removed."
      });
    } catch (error) {
      console.error('Remove failed:', error);
      toast({
        title: "Remove Failed",
        description: "Failed to remove screenshot.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Theme Preview</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={captureScreenshot}
            disabled={isCapturing}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            {isCapturing ? 'Capturing...' : 'Auto Capture'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="relative">
        {previewUrl ? (
          <div className="relative group">
            <img
              src={previewUrl}
              alt={`${theme.display_name} preview`}
              className="w-full h-48 object-cover rounded-lg border"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={removeScreenshot}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
            <Badge className="absolute top-2 right-2">
              <Check className="h-3 w-3 mr-1" />
              Preview Set
            </Badge>
          </div>
        ) : (
          <div className="w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Camera className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No preview image</p>
              <p className="text-xs">Capture or upload a screenshot</p>
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="mt-2 text-sm text-muted-foreground">
          Uploading screenshot...
        </div>
      )}
    </Card>
  );
};