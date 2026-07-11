import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

interface UploadMetadata {
  title: string;
  language: string;
  tags: string[];
  synopsis: string;
  chapterNumber?: number;
  uploadContext: string;
}

export const useUploadSystem = () => {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const calculateFileHash = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      // Simple hash based on file properties for client-side deduplication
      const hash = `${file.name}_${file.size}_${file.lastModified}`;
      resolve(btoa(hash).replace(/[+/=]/g, ''));
    });
  }, []);

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/zip'];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Unsupported file type. Use JPG, PNG, WebP, or ZIP' };
    }

    return { isValid: true };
  }, []);

  const validateMetadata = useCallback((metadata: UploadMetadata): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!metadata.title.trim()) {
      errors.push('Title is required');
    }

    if (!metadata.language.trim()) {
      errors.push('Language is required');
    }

    if (!metadata.synopsis.trim()) {
      errors.push('Synopsis is required');
    }

    if (metadata.uploadContext === 'chapter_page' && !metadata.chapterNumber) {
      errors.push('Chapter number is required for chapter pages');
    }

    // Check for placeholder text
    const placeholderTerms = ['lorem', 'ipsum', 'placeholder', 'sample', 'test', 'example', 'dummy'];
    const textToCheck = `${metadata.title} ${metadata.synopsis}`.toLowerCase();
    
    if (placeholderTerms.some(term => textToCheck.includes(term))) {
      errors.push('Please remove placeholder text and use real content');
    }

    return { isValid: errors.length === 0, errors };
  }, []);

  const uploadFile = async (file: File, metadata: UploadMetadata): Promise<string | null> => {
    const fileId = Math.random().toString(36).substring(7);
    const fileName = `${metadata.uploadContext}-${Date.now()}-${file.name}`;
    
    try {
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chapter-pages') // Use existing bucket for now
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chapter-pages')
        .getPublicUrl(uploadData.path);

      // Calculate hash for deduplication
      const hash = await calculateFileHash(file);

      // Store metadata in upload_metadata table
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const uploaderId = authUser?.id ?? null;

      const { error: metadataError } = await supabase
        .from('upload_metadata')
        .insert({
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type.split('/')[0], // 'image', 'application', etc.
          mime_type: file.type,
          uploader_id: uploaderId,
          upload_context: metadata.uploadContext,
          hash_value: hash,
          metadata: {
            title: metadata.title,
            language: metadata.language,
            tags: metadata.tags,
            synopsis: metadata.synopsis,
            chapterNumber: metadata.chapterNumber,
            originalFileName: file.name
          }
        });

      if (metadataError) {
        console.error('Error storing metadata:', metadataError);
        // Don't fail the upload for metadata errors, just log
      }

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const addFiles = useCallback((files: File[]) => {
    const newUploads: UploadFile[] = files.map(file => {
      const validation = validateFile(file);
      return {
        file,
        id: Math.random().toString(36).substring(7),
        progress: 0,
        status: validation.isValid ? 'pending' : 'error',
        error: validation.error
      };
    });

    setUploads(prev => [...prev, ...newUploads]);
  }, [validateFile]);

  const removeFile = useCallback((id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  }, []);

  const uploadAll = async (metadata: UploadMetadata) => {
    const metadataValidation = validateMetadata(metadata);
    if (!metadataValidation.isValid) {
      toast({
        title: "Validation Error",
        description: metadataValidation.errors.join(', '),
        variant: "destructive",
      });
      return false;
    }

    const validUploads = uploads.filter(upload => upload.status === 'pending');
    if (validUploads.length === 0) {
      toast({
        title: "No Files",
        description: "Please add valid files to upload",
        variant: "destructive",
      });
      return false;
    }

    setIsUploading(true);

    try {
      for (const upload of validUploads) {
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'uploading', progress: 0 } : u
        ));

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploads(prev => prev.map(u => 
            u.id === upload.id && u.progress < 90 
              ? { ...u, progress: u.progress + 10 }
              : u
          ));
        }, 200);

        try {
          const url = await uploadFile(upload.file, metadata);
          clearInterval(progressInterval);

          setUploads(prev => prev.map(u => 
            u.id === upload.id 
              ? { ...u, status: 'completed', progress: 100, url }
              : u
          ));
        } catch (error: any) {
          clearInterval(progressInterval);
          setUploads(prev => prev.map(u => 
            u.id === upload.id 
              ? { ...u, status: 'error', error: error.message }
              : u
          ));
        }
      }

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${validUploads.length} files`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
  }, []);

  const clearAll = useCallback(() => {
    setUploads([]);
  }, []);

  return {
    uploads,
    isUploading,
    addFiles,
    removeFile,
    uploadAll,
    clearCompleted,
    clearAll,
    validateMetadata
  };
};