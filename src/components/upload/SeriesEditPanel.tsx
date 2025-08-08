import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeriesMetadataForm } from './SeriesMetadataForm';
import { ImageUploader } from './ImageUploader';
import { ChapterUploader } from './ChapterUploader';
import { Edit, Plus, Eye, Trash2, BookOpen, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Series {
  id: string;
  title: string;
  description: string;
  author: string;
  artist?: string;
  type: 'manga' | 'novel';
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  cover_image_url?: string;
  genres: string[];
  tags: string[];
  alt_names?: string[];
  mature_content: boolean;
  created_at: string;
  author_id: string;
}

interface Chapter {
  id: string;
  title: string;
  number: number;
  content?: string;
  pages?: string[];
  status: 'draft' | 'published';
  created_at: string;
}

interface SeriesEditPanelProps {
  seriesId?: string;
  onClose?: () => void;
}

export const SeriesEditPanel: React.FC<SeriesEditPanelProps> = ({
  seriesId,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [series, setSeries] = useState<Series | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (seriesId) {
      loadSeries();
      loadChapters();
    }
  }, [seriesId]);

  const loadSeries = async () => {
    if (!seriesId) return;
    
    setLoading(true);
    try {
      // Mock data until proper series table is created
      setSeries({
        id: seriesId,
        title: 'Sample Series',
        description: 'A sample series for testing the edit panel.',
        author: 'Author Name',
        type: 'manga' as const,
        status: 'ongoing' as const,
        cover_image_url: '/placeholder.svg',
        genres: ['Action', 'Adventure'],
        tags: ['Fantasy', 'Magic'],
        alt_names: ['Alternative Title 1', 'Alt Name 2'],
        mature_content: false,
        created_at: new Date().toISOString(),
        author_id: user?.id || 'unknown'
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load series data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async () => {
    if (!seriesId) return;

    try {
      // Mock chapters data until proper database structure exists
      const mockChapters: Chapter[] = [
        {
          id: '1',
          title: 'Chapter 1: The Beginning',
          number: 1,
          content: 'Sample chapter content...',
          pages: ['page1.jpg', 'page2.jpg', 'page3.jpg'],
          status: 'published',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Chapter 2: The Journey',
          number: 2,
          content: 'More sample content...',
          pages: ['page4.jpg', 'page5.jpg'],
          status: 'published', 
          created_at: new Date().toISOString()
        }
      ];
      
      setChapters(mockChapters);
    } catch (error: any) {
      console.error('Error loading chapters:', error);
      setChapters([]);
    }
  };

  const updateSeries = async (formData: any) => {
    if (!seriesId) return;

    setSaving(true);
    try {
      // Mock update until proper series table exists
      setSeries(prev => prev ? { ...prev, ...formData } : null);
      
      toast({
        title: "Success",
        description: "Series updated successfully (mock)"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update series",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateCoverImage = async (imageUrl: string) => {
    if (!seriesId) return;

    try {
      // Mock update until proper series table exists
      setSeries(prev => prev ? { ...prev, cover_image_url: imageUrl } : null);
      toast({
        title: "Success",
        description: "Cover image updated (mock)"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update cover image",
        variant: "destructive"
      });
    }
  };

  const createChapter = async (chapterData: any) => {
    if (!seriesId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('chapters')
        .insert({
          ...chapterData,
          series_id: seriesId,
          author_id: user?.id,
          status: 'published'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chapter published successfully"
      });
      
      loadChapters();
      setActiveTab('chapters');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create chapter",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chapter deleted"
      });
      
      loadChapters();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete chapter",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading series data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!series && seriesId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Series not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {series && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{series.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={series.type === 'manga' ? 'default' : 'secondary'}>
                  {series.type}
                </Badge>
                <Badge variant="outline">{series.status}</Badge>
                {series.mature_content && (
                  <Badge variant="destructive">18+</Badge>
                )}
              </div>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="info">Series Info</TabsTrigger>
          <TabsTrigger value="cover">Cover Image</TabsTrigger>
          <TabsTrigger value="chapters">Chapters ({chapters.length})</TabsTrigger>
          <TabsTrigger value="new-chapter">
            <Plus className="h-4 w-4 mr-1" />
            New Chapter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          {series && (
            <SeriesMetadataForm
              initialData={{
                title: series.title,
                description: series.description,
                author: series.author,
                artist: series.artist,
                type: series.type,
                status: series.status,
                genres: series.genres,
                tags: series.tags,
                alt_names: series.alt_names || [],
                mature_content: series.mature_content
              }}
              onSubmit={updateSeries}
              loading={saving}
            />
          )}
        </TabsContent>

        <TabsContent value="cover" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader
                currentImage={series?.cover_image_url}
                onUpload={updateCoverImage}
                bucket="series-covers"
                folder="covers"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chapters" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Chapters</CardTitle>
            </CardHeader>
            <CardContent>
              {chapters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No chapters yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('new-chapter')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Chapter
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          Chapter {chapter.number}: {chapter.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Created: {new Date(chapter.created_at).toLocaleDateString()}</span>
                          <Badge variant={chapter.status === 'published' ? 'default' : 'secondary'}>
                            {chapter.status}
                          </Badge>
                          {series?.type === 'manga' && chapter.pages && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {chapter.pages.length} pages
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteChapter(chapter.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-chapter" className="mt-6">
          {series && (
            <ChapterUploader
              seriesType={series.type}
              seriesId={series.id}
              onUpload={createChapter}
              loading={saving}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};