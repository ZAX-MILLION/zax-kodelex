import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Upload, X, Calendar, Coins, Lock, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useDropzone } from 'react-dropzone';

interface ChapterData {
  title: string;
  chapter_number: number;
  series_id: string;
  release_date: string;
  is_locked: boolean;
  coin_cost: number;
  premium_only: boolean;
  early_access_hours: number;
  pages: File[];
  content?: string; // For novel text content
  summary?: string;
  notes?: string;
  seo_title?: string;
  seo_description?: string;
}

interface EnhancedChapterUploaderProps {
  seriesId: string;
  seriesType: 'manga' | 'novel';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EnhancedChapterUploader: React.FC<EnhancedChapterUploaderProps> = ({
  seriesId,
  seriesType,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  
  const [chapterData, setChapterData] = useState<ChapterData>({
    title: '',
    chapter_number: 1,
    series_id: seriesId,
    release_date: new Date().toISOString().split('T')[0],
    is_locked: false,
    coin_cost: 0,
    premium_only: false,
    early_access_hours: 0,
    pages: [],
    content: '',
    summary: '',
    notes: '',
    seo_title: '',
    seo_description: ''
  });

  // Check for duplicate chapter numbers
  const checkDuplicateChapter = useCallback(async (chapterNumber: number) => {
    if (!chapterNumber || chapterNumber <= 0) return;
    
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('id, title')
        .eq('series_id', seriesId)
        .eq('chapter_number', chapterNumber)
        .maybeSingle();

      if (error) {
        console.error('Error checking duplicate:', error);
        return;
      }

      if (data) {
        setDuplicateWarning(`Chapter ${chapterNumber} already exists: "${data.title}"`);
      } else {
        setDuplicateWarning(null);
      }
    } catch (error) {
      console.error('Error checking duplicate:', error);
    }
  }, [seriesId]);

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const isValidImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidImage) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a valid image file`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    setChapterData(prev => ({
      ...prev,
      pages: [...prev.pages, ...validFiles]
    }));
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true,
    disabled: seriesType === 'novel'
  });

  const removeFile = (index: number) => {
    setChapterData(prev => ({
      ...prev,
      pages: prev.pages.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: keyof ChapterData, value: any) => {
    setChapterData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'chapter_number') {
      checkDuplicateChapter(value);
    }
  };

  const uploadChapter = async () => {
    if (!userProfile) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload chapters",
        variant: "destructive"
      });
      return;
    }

    // Validation
    if (!chapterData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a chapter title",
        variant: "destructive"
      });
      return;
    }

    if (seriesType === 'manga' && chapterData.pages.length === 0) {
      toast({
        title: "Pages Required",
        description: "Please upload at least one page for manga chapters",
        variant: "destructive"
      });
      return;
    }

    if (seriesType === 'novel' && !chapterData.content?.trim()) {
      toast({
        title: "Content Required",
        description: "Please add content for novel chapters",
        variant: "destructive"
      });
      return;
    }

    if (duplicateWarning) {
      toast({
        title: "Duplicate Chapter",
        description: duplicateWarning,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      let pageUrls: string[] = [];
      
      // Upload images for manga
      if (seriesType === 'manga' && chapterData.pages.length > 0) {
        for (let i = 0; i < chapterData.pages.length; i++) {
          const file = chapterData.pages[i];
          const fileName = `chapter-${chapterData.chapter_number}-page-${i + 1}-${Date.now()}.${file.name.split('.').pop()}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('chapter-pages')
            .upload(fileName, file);

          if (uploadError) {
            throw new Error(`Failed to upload page ${i + 1}: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('chapter-pages')
            .getPublicUrl(uploadData.path);

          pageUrls.push(publicUrl);
        }
      }

      // Create chapter record
      const chapterInsert = {
        title: chapterData.title,
        chapter_number: chapterData.chapter_number,
        series_id: chapterData.series_id,
        release_date: new Date(chapterData.release_date).toISOString(),
        is_locked: chapterData.is_locked,
        pages: seriesType === 'manga' ? pageUrls : [chapterData.content || ''],
        page_count: seriesType === 'manga' ? pageUrls.length : 1,
        sort_order: chapterData.chapter_number,
        seo_title: chapterData.seo_title || chapterData.title,
        seo_description: chapterData.seo_description || chapterData.summary,
        thumbnail_url: pageUrls[0] || null
      };

      const { data: chapter, error: chapterError } = await supabase
        .from('chapters')
        .insert(chapterInsert)
        .select()
        .single();

      if (chapterError) {
        throw new Error(`Failed to create chapter: ${chapterError.message}`);
      }

      // Create pricing if needed
      if (chapterData.coin_cost > 0 || chapterData.premium_only || chapterData.early_access_hours > 0) {
        const { error: pricingError } = await supabase
          .from('chapter_prices')
          .insert({
            chapter_id: chapter.id,
            coin_cost: chapterData.coin_cost,
            premium_only: chapterData.premium_only,
            early_access_hours: chapterData.early_access_hours
          });

        if (pricingError) {
          console.error('Pricing error (non-critical):', pricingError);
        }
      }

      toast({
        title: "Success!",
        description: `Chapter ${chapterData.chapter_number} uploaded successfully!`
      });

      // Reset form
      setChapterData({
        title: '',
        chapter_number: chapterData.chapter_number + 1,
        series_id: seriesId,
        release_date: new Date().toISOString().split('T')[0],
        is_locked: false,
        coin_cost: 0,
        premium_only: false,
        early_access_hours: 0,
        pages: [],
        content: '',
        summary: '',
        notes: '',
        seo_title: '',
        seo_description: ''
      });

      onSuccess?.();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload New {seriesType === 'manga' ? 'Manga' : 'Novel'} Chapter
        </CardTitle>
        <CardDescription>
          {seriesType === 'manga' 
            ? 'Upload images for manga pages and configure chapter settings'
            : 'Write novel content and configure chapter settings'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Chapter Title *</Label>
            <Input
              id="title"
              value={chapterData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter chapter title"
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter_number">Chapter Number *</Label>
            <Input
              id="chapter_number"
              type="number"
              min="1"
              value={chapterData.chapter_number}
              onChange={(e) => handleInputChange('chapter_number', parseInt(e.target.value) || 1)}
              disabled={isUploading}
            />
            {duplicateWarning && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{duplicateWarning}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Content Upload */}
        {seriesType === 'manga' ? (
          <div className="space-y-4">
            <Label>Chapter Pages *</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
              } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop images here' : 'Drag & drop images or click to browse'}
              </p>
              <p className="text-sm text-muted-foreground">
                Support: JPEG, PNG, WebP, GIF (max 10MB each)
              </p>
            </div>

            {chapterData.pages.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Pages ({chapterData.pages.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {chapterData.pages.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Page ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Badge variant="secondary" className="absolute bottom-1 left-1 text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="content">Chapter Content *</Label>
            <Textarea
              id="content"
              value={chapterData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your novel chapter content here..."
              rows={12}
              disabled={isUploading}
            />
          </div>
        )}

        {/* Monetization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Monetization Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Lock Chapter</Label>
                <p className="text-sm text-muted-foreground">Require payment or premium to access</p>
              </div>
              <Switch
                checked={chapterData.is_locked}
                onCheckedChange={(checked) => handleInputChange('is_locked', checked)}
                disabled={isUploading}
              />
            </div>

            {chapterData.is_locked && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="coin_cost">Coin Cost</Label>
                  <Input
                    id="coin_cost"
                    type="number"
                    min="0"
                    value={chapterData.coin_cost}
                    onChange={(e) => handleInputChange('coin_cost', parseInt(e.target.value) || 0)}
                    disabled={isUploading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Premium Only</Label>
                    <p className="text-xs text-muted-foreground">Only premium subscribers</p>
                  </div>
                  <Switch
                    checked={chapterData.premium_only}
                    onCheckedChange={(checked) => handleInputChange('premium_only', checked)}
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="early_access">Early Access (hours)</Label>
                  <Input
                    id="early_access"
                    type="number"
                    min="0"
                    value={chapterData.early_access_hours}
                    onChange={(e) => handleInputChange('early_access_hours', parseInt(e.target.value) || 0)}
                    disabled={isUploading}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="release_date">Release Date</Label>
            <Input
              id="release_date"
              type="date"
              value={chapterData.release_date}
              onChange={(e) => handleInputChange('release_date', e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary (Optional)</Label>
            <Textarea
              id="summary"
              value={chapterData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Chapter summary or description"
              rows={3}
              disabled={isUploading}
            />
          </div>
        </div>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seo_title">SEO Title</Label>
              <Input
                id="seo_title"
                value={chapterData.seo_title}
                onChange={(e) => handleInputChange('seo_title', e.target.value)}
                placeholder="Leave empty to use chapter title"
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo_description">SEO Description</Label>
              <Textarea
                id="seo_description"
                value={chapterData.seo_description}
                onChange={(e) => handleInputChange('seo_description', e.target.value)}
                placeholder="Leave empty to use summary"
                rows={2}
                disabled={isUploading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={uploadChapter}
            disabled={isUploading || !chapterData.title.trim() || duplicateWarning !== null}
            className="flex-1"
          >
            {isUploading ? 'Uploading...' : 'Upload Chapter'}
          </Button>
          
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};