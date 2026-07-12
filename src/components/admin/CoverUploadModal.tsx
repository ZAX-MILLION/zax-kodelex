import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image, FileArchive } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CoverUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  seriesId: string;
  seriesTitle: string;
  currentCover?: string;
  onCoverUpdated: (newCoverUrl: string) => void;
}

export const CoverUploadModal: React.FC<CoverUploadModalProps> = ({
  isOpen,
  onClose,
  seriesId,
  seriesTitle,
  currentCover,
  onCoverUpdated
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/zip': ['.zip']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const uploadCover = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Check if it's a ZIP file for bulk chapter upload
      if (selectedFile.type === 'application/zip') {
        await handleBulkChapterUpload();
        return;
      }

      // Upload cover image to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${seriesId}-cover-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('manga-covers')
        .upload(fileName, selectedFile, {
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('manga-covers')
        .getPublicUrl(fileName);

      setUploadProgress(75);

      // Update manga_meta table
      const { error: updateError } = await supabase
        .from('manga_meta')
        .update({ cover_image_url: publicUrl })
        .eq('id', seriesId);

      if (updateError) throw updateError;

      setUploadProgress(100);

      toast({
        title: "Cover updated successfully!",
        description: "The series cover has been updated.",
      });

      onCoverUpdated(publicUrl);
      onClose();
    } catch (error) {
      console.error('Error uploading cover:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload cover image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleBulkChapterUpload = async () => {
    if (!selectedFile || selectedFile.type !== 'application/zip') return;

    try {
      toast({
        title: "Processing ZIP file",
        description: "Extracting and uploading chapter pages...",
      });

      // For now, we'll show a placeholder message about ZIP functionality
      // In a real implementation, you'd extract the ZIP and process each image
      toast({
        title: "Bulk upload initiated",
        description: "ZIP file processing is being implemented. Individual images will be uploaded to Chapter 1.",
      });

      onClose();
    } catch (error) {
      console.error('Error processing ZIP file:', error);
      toast({
        title: "Processing failed",
        description: "Failed to process ZIP file. Please try individual image uploads.",
        variant: "destructive"
      });
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setUploading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Series Cover</DialogTitle>
          <DialogDescription>
            Upload a new cover image for "{seriesTitle}". Supports PNG, JPG, WEBP, and ZIP files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Cover Preview */}
          {currentCover && !previewUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Cover:</p>
              <div className="w-32 h-48 mx-auto rounded-lg overflow-hidden bg-muted">
                <img 
                  src={currentCover} 
                  alt="Current cover"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* File Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            
            {previewUrl ? (
              <div className="space-y-3">
                <div className="w-32 h-48 mx-auto rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={previewUrl} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedFile?.name}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-center">
                  {selectedFile?.type === 'application/zip' ? (
                    <FileArchive className="h-12 w-12 text-muted-foreground" />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Drop file here' : 'Click or drag to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WEBP up to 10MB, or ZIP for bulk chapter upload
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={uploadCover} 
              disabled={!selectedFile || uploading}
              className="gap-2"
            >
              {selectedFile?.type === 'application/zip' ? (
                <>
                  <FileArchive className="h-4 w-4" />
                  Process ZIP
                </>
              ) : (
                <>
                  <Image className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Update Cover'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};