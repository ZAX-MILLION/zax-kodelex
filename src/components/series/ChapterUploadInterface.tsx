import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileArchive, 
  Image, 
  CheckCircle, 
  X, 
  Plus,
  AlertCircle 
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSimpleRole } from '@/hooks/useSimpleRole';

interface ChapterUploadInterfaceProps {
  seriesId: string;
  seriesTitle: string;
  onChapterUploaded: (chapterId: string) => void;
}

interface UploadFile {
  file: File;
  preview: string;
  id: string;
}

export const ChapterUploadInterface: React.FC<ChapterUploadInterfaceProps> = ({
  seriesId,
  seriesTitle,
  onChapterUploaded
}) => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const { hasPermission } = useSimpleRole();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
  const [chapterInfo, setChapterInfo] = useState({
    title: '',
    chapterNumber: '',
    isLocked: false
  });

  // Check if user has upload permission
  const canUpload = hasPermission('upload') || userProfile?.role === 'admin' || userProfile?.role === 'uploader' || userProfile?.role === 'author';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!canUpload) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to upload chapters",
        variant: "destructive"
      });
      return;
    }

    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7)
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, [canUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/zip': ['.zip']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB per file
  });

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  const uploadChapter = async () => {
    if (!canUpload || !chapterInfo.title || !chapterInfo.chapterNumber || selectedFiles.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select files",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Check if chapter number already exists
      const { data: existingChapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('series_id', seriesId)
        .eq('chapter_number', parseInt(chapterInfo.chapterNumber))
        .maybeSingle();

      if (existingChapter) {
        throw new Error(`Chapter ${chapterInfo.chapterNumber} already exists for this series`);
      }

      // Upload files to storage
      const uploadedPages: string[] = [];
      const totalFiles = selectedFiles.length;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.file.name.split('.').pop();
        const fileName = `${seriesId}/ch${chapterInfo.chapterNumber}/page${i + 1}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chapter-pages')
          .upload(fileName, file.file, {
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chapter-pages')
          .getPublicUrl(fileName);

        uploadedPages.push(publicUrl);
        setUploadProgress(((i + 1) / totalFiles) * 80); // 80% for upload
      }

      // Create chapter record
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .insert({
          series_id: seriesId,
          title: chapterInfo.title,
          chapter_number: parseInt(chapterInfo.chapterNumber),
          pages: uploadedPages,
          page_count: uploadedPages.length,
          is_locked: chapterInfo.isLocked,
          sort_order: parseInt(chapterInfo.chapterNumber)
        })
        .select()
        .single();

      if (chapterError) throw chapterError;

      setUploadProgress(100);

      toast({
        title: "Chapter uploaded successfully!",
        description: `Chapter ${chapterInfo.chapterNumber} has been added to ${seriesTitle}`,
      });

      // Reset form
      setChapterInfo({ title: '', chapterNumber: '', isLocked: false });
      setSelectedFiles([]);
      onChapterUploaded(chapterData.id);

    } catch (error: any) {
      console.error('Error uploading chapter:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload chapter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (!canUpload) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Upload Permission Required</h3>
          <p className="text-muted-foreground">
            You need upload permissions to add chapters to this series.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload New Chapter
        </CardTitle>
        <CardDescription>
          Add a new chapter to "{seriesTitle}". Support for individual images and ZIP archives.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chapter Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="chapter-title">Chapter Title</Label>
            <Input
              id="chapter-title"
              value={chapterInfo.title}
              onChange={(e) => setChapterInfo(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter chapter title..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chapter-number">Chapter Number</Label>
            <Input
              id="chapter-number"
              type="number"
              value={chapterInfo.chapterNumber}
              onChange={(e) => setChapterInfo(prev => ({ ...prev, chapterNumber: e.target.value }))}
              placeholder="1"
              min="1"
            />
          </div>
        </div>

        {/* File Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-3">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop files here' : 'Click or drag to upload chapter pages'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP images up to 50MB each, or ZIP archive
              </p>
            </div>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
                  setSelectedFiles([]);
                }}
              >
                Clear All
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {selectedFiles.map((file, index) => (
                <div key={file.id} className="relative group">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                    {file.file.type.startsWith('image/') ? (
                      <img
                        src={file.preview}
                        alt={`Page ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileArchive className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-center mt-1 truncate">
                    Page {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading chapter...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Button */}
        <Button 
          onClick={uploadChapter}
          disabled={uploading || !chapterInfo.title || !chapterInfo.chapterNumber || selectedFiles.length === 0}
          className="w-full gap-2"
        >
          {uploading ? (
            <>
              <Upload className="h-4 w-4 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Upload Chapter
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};