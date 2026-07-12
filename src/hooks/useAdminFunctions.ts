import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChapterUpload {
  title: string;
  chapter_number: number;
  pages: File[];
}

export const useAdminFunctions = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadChapter = async (chapterData: ChapterUpload) => {
    setIsUploading(true);
    try {
      // First, upload images to storage
      const pageUrls: string[] = [];
      
      for (let i = 0; i < chapterData.pages.length; i++) {
        const file = chapterData.pages[i];
        const fileName = `chapter-${chapterData.chapter_number}-page-${i + 1}-${Date.now()}.${file.name.split('.').pop()}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chapter-pages')
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Failed to upload page ${i + 1}: ${uploadError.message}`);
        }

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('chapter-pages')
          .getPublicUrl(uploadData.path);

        pageUrls.push(publicUrl);
      }

      // Create chapter record in database
      const { error: dbError } = await supabase
        .from('chapters')
        .insert({
          title: chapterData.title || `Chapter ${chapterData.chapter_number}`,
          chapter_number: chapterData.chapter_number,
          pages: pageUrls,
          page_count: pageUrls.length,
          sort_order: chapterData.chapter_number,
          release_date: new Date().toISOString(),
        });

      if (dbError) {
        throw new Error(`Failed to create chapter: ${dbError.message}`);
      }

      toast({
        title: "Success",
        description: `Chapter ${chapterData.chapter_number} uploaded successfully!`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Chapter upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsUploading(false);
    }
  };

  const deleteChapter = async (chapterId: string) => {
    try {
      // Get chapter data first to find associated files
      const { data: chapter, error: fetchError } = await supabase
        .from('chapters')
        .select('pages')
        .eq('id', chapterId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch chapter: ${fetchError.message}`);
      }

      // Delete files from storage
      if (chapter.pages && Array.isArray(chapter.pages)) {
        for (const pageUrl of chapter.pages) {
          try {
            // Only process if pageUrl is a string
            if (typeof pageUrl === 'string') {
              // Extract file path from URL
              const url = new URL(pageUrl);
              const pathParts = url.pathname.split('/');
              const fileName = pathParts[pathParts.length - 1];
              
              await supabase.storage
                .from('chapter-pages')
                .remove([fileName]);
            }
          } catch (fileError) {
            console.warn('Failed to delete file:', pageUrl, fileError);
          }
        }
      }

      // Delete chapter from database
      const { error: deleteError } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (deleteError) {
        throw new Error(`Failed to delete chapter: ${deleteError.message}`);
      }

      toast({
        title: "Success",
        description: "Chapter deleted successfully!",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Chapter deletion error:', error);
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const updateChapter = async (chapterId: string, updates: Partial<any>) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .update(updates)
        .eq('id', chapterId);

      if (error) {
        throw new Error(`Failed to update chapter: ${error.message}`);
      }

      toast({
        title: "Success",
        description: "Chapter updated successfully!",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Chapter update error:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  return {
    uploadChapter,
    deleteChapter,
    updateChapter,
    isUploading,
  };
};