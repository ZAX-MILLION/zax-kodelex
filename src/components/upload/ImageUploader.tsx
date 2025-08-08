import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Image, X, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  bucket?: string;
  folder?: string;
  maxSize?: number;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  currentImage,
  bucket = 'series-covers',
  folder = 'covers',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setProgress(100);
      setPreview(publicUrl);
      onUpload(publicUrl);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    
    uploadFile(file);
  }, [maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const removeImage = () => {
    setPreview(null);
    setError(null);
    onUpload('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {preview ? (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative group">
              <img
                src={preview}
                alt="Cover preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  disabled={uploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Upload className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                    <div className="text-sm mb-2">Uploading...</div>
                    <Progress value={progress} className="w-32" />
                  </div>
                </div>
              )}
              {progress === 100 && !uploading && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={`border-2 border-dashed transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}>
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={`text-center cursor-pointer ${uploading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Image className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Upload Cover Image</h3>
                  <p className="text-muted-foreground">
                    {isDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PNG, JPG, WEBP up to {maxSize / (1024 * 1024)}MB
                  </p>
                </div>
                <Button variant="outline" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Select Image'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};