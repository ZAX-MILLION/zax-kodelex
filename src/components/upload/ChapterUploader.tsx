import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, X, Plus, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ChapterData {
  title: string;
  number: number;
  content?: string; // For novels
  pages?: string[]; // For manga
  summary?: string;
  notes?: string;
}

interface ChapterUploaderProps {
  seriesType: 'manga' | 'novel';
  seriesId: string;
  onUpload: (chapter: ChapterData) => void;
  loading?: boolean;
}

export const ChapterUploader: React.FC<ChapterUploaderProps> = ({
  seriesType,
  seriesId,
  onUpload,
  loading = false
}) => {
  const [chapterData, setChapterData] = useState<ChapterData>({
    title: '',
    number: 1,
    content: '',
    pages: [],
    summary: '',
    notes: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedPages, setUploadedPages] = useState<string[]>([]);

  const uploadMangaPages = async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `chapters/${seriesId}/${Date.now()}-page-${i + 1}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('manga-pages')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('manga-pages')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      setUploadedPages([...uploadedPages, ...uploadedUrls]);
      setChapterData(prev => ({
        ...prev,
        pages: [...(prev.pages || []), ...uploadedUrls]
      }));

    } catch (error: any) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files: File[]) => {
      if (seriesType === 'manga') {
        uploadMangaPages(files);
      }
    },
    accept: seriesType === 'manga' ? {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    } : undefined,
    disabled: uploading || seriesType === 'novel',
    multiple: seriesType === 'manga'
  });

  const removePage = (index: number) => {
    const newPages = [...(chapterData.pages || [])];
    newPages.splice(index, 1);
    setChapterData(prev => ({ ...prev, pages: newPages }));
    
    const newUploadedPages = [...uploadedPages];
    newUploadedPages.splice(index, 1);
    setUploadedPages(newUploadedPages);
  };

  const handleSubmit = () => {
    if (seriesType === 'novel' && !chapterData.content?.trim()) {
      alert('Please add chapter content');
      return;
    }
    
    if (seriesType === 'manga' && (!chapterData.pages || chapterData.pages.length === 0)) {
      alert('Please upload at least one page');
      return;
    }

    if (!chapterData.title.trim()) {
      alert('Please add a chapter title');
      return;
    }

    onUpload(chapterData);
  };

  return (
    <div className="space-y-6">
      {/* Chapter Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Chapter Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-title">Chapter Title *</Label>
              <Input
                id="chapter-title"
                placeholder="Enter chapter title"
                value={chapterData.title}
                onChange={(e) => setChapterData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter-number">Chapter Number *</Label>
              <Input
                id="chapter-number"
                type="number"
                min="1"
                value={chapterData.number}
                onChange={(e) => setChapterData(prev => ({ ...prev, number: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter-summary">Chapter Summary</Label>
            <Textarea
              id="chapter-summary"
              placeholder="Brief summary of this chapter (optional)"
              value={chapterData.summary}
              onChange={(e) => setChapterData(prev => ({ ...prev, summary: e.target.value }))}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Upload - Different for Manga vs Novel */}
      {seriesType === 'manga' ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload Manga Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              } ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Image className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {isDragActive ? 'Drop pages here' : 'Upload Manga Pages'}
                  </h3>
                  <p className="text-muted-foreground">
                    Drag & drop multiple images or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, WEBP images in reading order
                  </p>
                </div>
                <Button variant="outline" disabled={uploading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Select Pages'}
                </Button>
              </div>
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Uploading pages...</span>
                  <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Uploaded Pages Preview */}
            {chapterData.pages && chapterData.pages.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Uploaded Pages ({chapterData.pages.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {chapterData.pages.map((pageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={pageUrl}
                        alt={`Page ${index + 1}`}
                        className="w-full aspect-[3/4] object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removePage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Chapter Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="chapter-content">Chapter Text *</Label>
              <Textarea
                id="chapter-content"
                placeholder="Write your chapter content here..."
                value={chapterData.content}
                onChange={(e) => setChapterData(prev => ({ ...prev, content: e.target.value }))}
                rows={20}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Tip: You can use basic markdown formatting (bold, italic, etc.)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Author Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Author Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any notes for readers about this chapter..."
            value={chapterData.notes}
            onChange={(e) => setChapterData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={loading || uploading}
          size="lg"
        >
          {loading ? 'Publishing...' : 'Publish Chapter'}
        </Button>
      </div>
    </div>
  );
};