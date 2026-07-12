import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Calendar,
  Save,
  Loader2,
  Move,
  Replace,
  Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  sort_order: number;
  is_locked: boolean;
  page_count: number;
  pages?: any;
  release_date: string;
  seo_title?: string;
  seo_description?: string;
}

interface ChapterEditorProps {
  chapter: Chapter | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ChapterEditor = ({ chapter, isOpen, onClose, onSave }: ChapterEditorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    chapter_number: 1,
    sort_order: 1,
    is_locked: false,
    release_date: new Date().toISOString().split('T')[0],
    seo_title: '',
    seo_description: ''
  });
  const [chapterImages, setChapterImages] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (chapter) {
      setFormData({
        title: chapter.title || '',
        chapter_number: chapter.chapter_number || 1,
        sort_order: chapter.sort_order || 1,
        is_locked: chapter.is_locked || false,
        release_date: chapter.release_date ? new Date(chapter.release_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        seo_title: chapter.seo_title || '',
        seo_description: chapter.seo_description || ''
      });

      // Parse existing pages
      if (chapter.pages) {
        try {
          const pages = typeof chapter.pages === 'string' ? JSON.parse(chapter.pages) : chapter.pages;
          setChapterImages(Array.isArray(pages) ? pages : []);
        } catch (error) {
          console.error('Error parsing chapter pages:', error);
          setChapterImages([]);
        }
      } else {
        setChapterImages([]);
      }
    } else {
      // Reset for new chapter
      setFormData({
        title: '',
        chapter_number: 1,
        sort_order: 1,
        is_locked: false,
        release_date: new Date().toISOString().split('T')[0],
        seo_title: '',
        seo_description: ''
      });
      setChapterImages([]);
    }
  }, [chapter]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        // For demo purposes, create object URLs
        // In production, you'd upload to Supabase Storage
        const objectUrl = URL.createObjectURL(file);
        uploadedUrls.push(objectUrl);
      }

      setChapterImages(prev => [...prev, ...uploadedUrls]);
      
      toast({
        title: "Images uploaded",
        description: `${uploadedUrls.length} image(s) added to chapter`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setChapterImages(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Image removed",
      description: "Image has been removed from the chapter",
    });
  };

  const replaceImage = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // For demo purposes, create object URL
      const objectUrl = URL.createObjectURL(file);
      
      setChapterImages(prev => prev.map((img, i) => i === index ? objectUrl : img));
      
      toast({
        title: "Image replaced",
        description: "Image has been replaced successfully",
      });
    } catch (error) {
      console.error('Error replacing image:', error);
      toast({
        title: "Replace failed",
        description: "Failed to replace image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= chapterImages.length) return;
    
    setChapterImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation error",
        description: "Chapter title is required",
        variant: "destructive",
      });
      return;
    }

    if (chapterImages.length === 0) {
      toast({
        title: "Validation error", 
        description: "At least one image is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const chapterData = {
        ...formData,
        pages: JSON.stringify(chapterImages),
        page_count: chapterImages.length,
        updated_at: new Date().toISOString()
      };

      if (chapter) {
        // Update existing chapter
        const { error } = await supabase
          .from('chapters')
          .update(chapterData)
          .eq('id', chapter.id);

        if (error) throw error;

        toast({
          title: "Chapter updated",
          description: "Chapter has been updated successfully",
        });
      } else {
        // Create new chapter
        const { error } = await supabase
          .from('chapters')
          .insert({
            ...chapterData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Chapter created",
          description: "New chapter has been created successfully",
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast({
        title: "Save failed",
        description: "Failed to save chapter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (previewMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Preview: {formData.title}</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPreviewMode(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Close Preview
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[70vh] space-y-4">
            {chapterImages.map((image, index) => (
              <div key={index} className="flex justify-center">
                <img
                  src={image}
                  alt={`Page ${index + 1}`}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{chapter ? 'Edit Chapter' : 'Create New Chapter'}</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPreviewMode(true)} disabled={chapterImages.length === 0}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {chapter ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[70vh]">
          {/* Chapter Details Form */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Chapter Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter chapter title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="chapter_number">Chapter #</Label>
                    <Input
                      id="chapter_number"
                      type="number"
                      min="1"
                      value={formData.chapter_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, chapter_number: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      min="1"
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="release_date">Release Date</Label>
                  <Input
                    id="release_date"
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, release_date: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_locked"
                    checked={formData.is_locked}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_locked: checked }))}
                  />
                  <Label htmlFor="is_locked">Lock Chapter</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="SEO optimized title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="SEO description for search engines"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image Management */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Chapter Images ({chapterImages.length})</h3>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Images
                </Button>
              </div>
            </div>

            {chapterImages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No images added yet</p>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={uploadingImage}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First Image
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {chapterImages.map((image, index) => (
                  <Card key={index} className="relative group">
                    <CardContent className="p-2">
                      <div className="relative">
                        <img
                          src={image}
                          alt={`Page ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => moveImage(index, index - 1)}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              <Move className="h-3 w-3" />
                            </Button>
                            
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => replaceImage(index, e)}
                              className="hidden"
                              id={`replace-${index}`}
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => document.getElementById(`replace-${index}`)?.click()}
                              className="h-8 w-8 p-0"
                            >
                              <Replace className="h-3 w-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <Badge className="absolute top-2 left-2 bg-background/80 text-foreground">
                          {index + 1}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};