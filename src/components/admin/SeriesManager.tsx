import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Upload, 
  Save, 
  Plus, 
  X, 
  Image,
  Calendar,
  Globe,
  Star,
  Tag,
  BookOpen,
  Edit3,
  Trash2,
  CheckSquare,
  Square,
  Pencil
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CoverUploadModal } from "./CoverUploadModal";
import { MangaEditModal } from "./MangaEditModal";

interface MangaInfo {
  id: string;
  title: string;
  description: string;
  author: string;
  artist: string;
  status: string;
  cover_image_url: string;
  age_rating: string;
  language: string;
  publication_date: string;
  genres: string[];
  tags: string[];
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

const STATUS_OPTIONS = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'hiatus', label: 'On Hiatus' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AGE_RATING_OPTIONS = [
  { value: 'E', label: 'Everyone' },
  { value: 'T', label: 'Teen (13+)' },
  { value: 'M', label: 'Mature (17+)' },
  { value: 'A', label: 'Adult (18+)' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];

const COMMON_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural'
];

interface SeriesListItem {
  id: string;
  title: string;
  author: string;
  status: string;
  created_at: string;
  chapter_count: number;
  cover_image_url?: string;
}

export const SeriesManager = () => {
  const { toast } = useToast();
  const [seriesList, setSeriesList] = useState<SeriesListItem[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [mangaInfo, setMangaInfo] = useState<MangaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newGenre, setNewGenre] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [selectedSeriesForCover, setSelectedSeriesForCover] = useState<SeriesListItem | null>(null);
  
  // Multi-selection and bulk actions
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Quick Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSeriesId, setEditSeriesId] = useState<string | null>(null);

  useEffect(() => {
    loadSeriesList();
  }, []);

  const loadSeriesList = async () => {
    try {
      setLoading(true);
      // Get all series with chapter counts and cover images
      const { data: seriesData, error: seriesError } = await supabase
        .from('manga_meta')
        .select('id, title, author, status, created_at, cover_image_url')
        .order('created_at', { ascending: false });

      if (seriesError) throw seriesError;

      // Get chapter counts for each series
      const { data: chapterCounts, error: chapterError } = await supabase
        .from('chapters')
        .select('series_id')
        .in('series_id', seriesData?.map(s => s.id) || []);

      if (chapterError) console.warn('Error loading chapter counts:', chapterError);

      const seriesWithCounts: SeriesListItem[] = seriesData?.map(series => {
        const chapterCount = chapterCounts?.filter(c => c.series_id === series.id).length || 0;
        return {
          ...series,
          chapter_count: chapterCount
        };
      }) || [];

      setSeriesList(seriesWithCounts);
    } catch (err) {
      console.error('Error loading series list:', err);
      toast({
        title: "Error",
        description: "Failed to load series list",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMangaInfo = async (seriesId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('manga_meta')
        .select('*')
        .eq('id', seriesId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setMangaInfo({
          ...data,
          genres: data.genres || [],
          tags: data.tags || [],
          publication_date: data.publication_date || '',
        });
      } else {
        // Create default manga info if none exists
        setMangaInfo({
          id: '',
          title: '',
          description: '',
          author: '',
          artist: '',
          status: 'ongoing',
          cover_image_url: '',
          age_rating: 'T',
          language: 'en',
          publication_date: '',
          genres: [],
          tags: [],
          meta_title: '',
          meta_description: '',
          meta_keywords: '',
        });
      }
    } catch (error) {
      console.error('Error loading manga info:', error);
      toast({
        title: "Error loading series info",
        description: "Failed to load series information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!mangaInfo) return;

    try {
      setSaving(true);
      
      const dataToSave = {
        title: mangaInfo.title,
        description: mangaInfo.description,
        author: mangaInfo.author,
        artist: mangaInfo.artist,
        status: mangaInfo.status as 'ongoing' | 'completed' | 'hiatus' | 'cancelled',
        cover_image_url: mangaInfo.cover_image_url,
        age_rating: mangaInfo.age_rating,
        language: mangaInfo.language,
        publication_date: mangaInfo.publication_date || null,
        genres: mangaInfo.genres,
        tags: mangaInfo.tags,
        meta_title: mangaInfo.meta_title,
        meta_description: mangaInfo.meta_description,
        meta_keywords: mangaInfo.meta_keywords,
      };

      if (mangaInfo.id) {
        const { error } = await supabase
          .from('manga_meta')
          .update(dataToSave)
          .eq('id', mangaInfo.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('manga_meta')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        setMangaInfo(prev => prev ? { ...prev, id: data.id } : null);
      }

      toast({
        title: "Manga saved successfully!",
        description: "Your manga information has been updated.",
      });
    } catch (error) {
      console.error('Error saving manga info:', error);
      toast({
        title: "Error saving manga",
        description: "Failed to save manga information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addGenre = () => {
    if (newGenre && mangaInfo && !mangaInfo.genres.includes(newGenre)) {
      setMangaInfo(prev => prev ? {
        ...prev,
        genres: [...prev.genres, newGenre]
      } : null);
      setNewGenre("");
    }
  };

  const removeGenre = (genre: string) => {
    if (mangaInfo) {
      setMangaInfo(prev => prev ? {
        ...prev,
        genres: prev.genres.filter(g => g !== genre)
      } : null);
    }
  };

  const addTag = () => {
    if (newTag && mangaInfo && !mangaInfo.tags.includes(newTag)) {
      setMangaInfo(prev => prev ? {
        ...prev,
        tags: [...prev.tags, newTag]
      } : null);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    if (mangaInfo) {
      setMangaInfo(prev => prev ? {
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      } : null);
    }
  };

  const handleCoverUpdated = (newCoverUrl: string) => {
    if (selectedSeriesForCover && mangaInfo) {
      setMangaInfo(prev => prev ? { ...prev, cover_image_url: newCoverUrl } : null);
    }
    // Also update the series list
    setSeriesList(prev => prev.map(series => 
      series.id === selectedSeriesForCover?.id 
        ? { ...series, cover_image_url: newCoverUrl }
        : series
    ));
    setShowCoverModal(false);
    setSelectedSeriesForCover(null);
  };

  // Multi-selection functions
  const toggleSeriesSelection = (seriesId: string) => {
    setSelectedSeriesIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesId)) {
        newSet.delete(seriesId);
      } else {
        newSet.add(seriesId);
      }
      return newSet;
    });
  };

  const selectAllSeries = () => {
    setSelectedSeriesIds(new Set(seriesList.map(s => s.id)));
  };

  const clearSelection = () => {
    setSelectedSeriesIds(new Set());
  };

  // Delete functions
  const deleteSeries = async (seriesId: string) => {
    try {
      setIsDeleting(true);
      
      // First delete all chapters for this series
      const { error: chaptersError } = await supabase
        .from('chapters')
        .delete()
        .eq('series_id', seriesId);

      if (chaptersError) {
        console.warn('Error deleting chapters:', chaptersError);
      }

      // Then delete the series
      const { error: seriesError } = await supabase
        .from('manga_meta')
        .delete()
        .eq('id', seriesId);

      if (seriesError) throw seriesError;

      // Update local state
      setSeriesList(prev => prev.filter(s => s.id !== seriesId));
      setSelectedSeriesIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(seriesId);
        return newSet;
      });

      toast({
        title: "Series deleted",
        description: "Series and all its chapters have been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting series:', error);
      toast({
        title: "Error",
        description: "Failed to delete series",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const bulkDeleteSeries = async () => {
    try {
      setIsDeleting(true);
      const idsToDelete = Array.from(selectedSeriesIds);
      
      // Delete all chapters for selected series
      const { error: chaptersError } = await supabase
        .from('chapters')
        .delete()
        .in('series_id', idsToDelete);

      if (chaptersError) {
        console.warn('Error deleting chapters:', chaptersError);
      }

      // Delete the series
      const { error: seriesError } = await supabase
        .from('manga_meta')
        .delete()
        .in('id', idsToDelete);

      if (seriesError) throw seriesError;

      // Update local state
      setSeriesList(prev => prev.filter(s => !selectedSeriesIds.has(s.id)));
      setSelectedSeriesIds(new Set());

      toast({
        title: "Series deleted",
        description: `${idsToDelete.length} series and their chapters have been deleted successfully`,
      });
    } catch (error) {
      console.error('Error bulk deleting series:', error);
      toast({
        title: "Error",
        description: "Failed to delete series",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickDelete = (seriesId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSeriesToDelete(seriesId);
    setShowDeleteDialog(true);
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Series Manager</h2>
          <p className="text-muted-foreground">Manage all manga series and their information</p>
        </div>
        <Button 
          onClick={() => {
            setShowCreateNew(true);
            setSelectedSeries(null);
            setMangaInfo({
              id: '',
              title: '',
              description: '',
              author: '',
              artist: '',
              status: 'ongoing',
              cover_image_url: '',
              age_rating: 'T',
              language: 'en',
              publication_date: '',
              genres: [],
              tags: [],
              meta_title: '',
              meta_description: '',
              meta_keywords: '',
            });
          }} 
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Series
        </Button>
      </div>

      {/* Series List */}
      {!selectedSeries && !showCreateNew && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Series ({seriesList.length})</CardTitle>
                <CardDescription>Select a series to edit or create a new one</CardDescription>
              </div>
              
              {/* Bulk Actions */}
              <div className="flex items-center gap-2">
                {selectedSeriesIds.size > 0 && (
                  <>
                    <Badge variant="secondary" className="px-3 py-1">
                      {selectedSeriesIds.size} selected
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear
                    </Button>
                  </>
                )}
                
                {seriesList.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectedSeriesIds.size === seriesList.length ? clearSelection : selectAllSeries}
                    className="gap-2"
                  >
                    {selectedSeriesIds.size === seriesList.length ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <CheckSquare className="h-4 w-4" />
                    )}
                    {selectedSeriesIds.size === seriesList.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {seriesList.map((series) => (
                <div
                  key={series.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                    selectedSeriesIds.has(series.id) ? 'bg-muted/50 border-primary' : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  <Checkbox
                    checked={selectedSeriesIds.has(series.id)}
                    onCheckedChange={() => toggleSeriesSelection(series.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {/* Cover Thumbnail */}
                  <div 
                    className="relative group cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSeriesForCover(series);
                      setShowCoverModal(true);
                    }}
                  >
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {series.cover_image_url ? (
                        <img
                          src={series.cover_image_url}
                          alt={`${series.title} cover`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Edit3 className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Series Info */}
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setSelectedSeries(series.id);
                      loadMangaInfo(series.id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{series.title}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditSeriesId(series.id);
                              setEditModalOpen(true);
                            }}
                            aria-label={`Edit ${series.title}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">by {series.author}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={series.status === 'ongoing' ? 'default' : 'secondary'}>
                            {series.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {series.chapter_count} chapters
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(series.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {/* Quick Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleQuickDelete(series.id, e)}
                          disabled={isDeleting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {seriesList.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No series found. Create your first series to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Series Editor */}
      {(selectedSeries || showCreateNew) && mangaInfo && (
        <>
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedSeries(null);
                setShowCreateNew(false);
                setMangaInfo(null);
              }}
              className="gap-2"
            >
              ← Back to Series List
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details about your manga</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Manga Title</Label>
                  <Input
                    id="title"
                    value={mangaInfo.title}
                    onChange={(e) => setMangaInfo(prev => prev ? { ...prev, title: e.target.value } : null)}
                    placeholder="Enter series title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={mangaInfo.status}
                    onValueChange={(value) => setMangaInfo(prev => prev ? { ...prev, status: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select
                    value={(mangaInfo as any).content_type || 'none'}
                    onValueChange={(value) => setMangaInfo(prev => prev ? { ...prev, content_type: value === 'none' ? null : value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="manga">Manga</SelectItem>
                      <SelectItem value="manhwa">Manhwa</SelectItem>
                      <SelectItem value="manhua">Manhua</SelectItem>
                      <SelectItem value="novel">Novel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={mangaInfo.author}
                    onChange={(e) => setMangaInfo(prev => prev ? { ...prev, author: e.target.value } : null)}
                    placeholder="Author name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist</Label>
                  <Input
                    id="artist"
                    value={mangaInfo.artist}
                    onChange={(e) => setMangaInfo(prev => prev ? { ...prev, artist: e.target.value } : null)}
                    placeholder="Artist name..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={mangaInfo.description}
                  onChange={(e) => setMangaInfo(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Enter series description..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Publication & Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Publication Settings</CardTitle>
              <CardDescription>Age rating, language, and publication information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age_rating">Age Rating</Label>
                  <Select
                    value={mangaInfo.age_rating}
                    onValueChange={(value) => setMangaInfo(prev => prev ? { ...prev, age_rating: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_RATING_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={mangaInfo.language}
                    onValueChange={(value) => setMangaInfo(prev => prev ? { ...prev, language: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publication_date">Publication Date</Label>
                  <Input
                    id="publication_date"
                    type="date"
                    value={mangaInfo.publication_date}
                    onChange={(e) => setMangaInfo(prev => prev ? { ...prev, publication_date: e.target.value } : null)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Search engine optimization settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={mangaInfo.meta_title}
                  onChange={(e) => setMangaInfo(prev => prev ? { ...prev, meta_title: e.target.value } : null)}
                  placeholder="SEO-optimized title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={mangaInfo.meta_description}
                  onChange={(e) => setMangaInfo(prev => prev ? { ...prev, meta_description: e.target.value } : null)}
                  placeholder="SEO description (150-160 characters)..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input
                  id="meta_keywords"
                  value={mangaInfo.meta_keywords}
                  onChange={(e) => setMangaInfo(prev => prev ? { ...prev, meta_keywords: e.target.value } : null)}
                  placeholder="keyword1, keyword2, keyword3..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
              <CardDescription>Upload and manage the series cover</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mangaInfo.cover_image_url ? (
                  <div className="relative">
                    <img
                      src={mangaInfo.cover_image_url}
                      alt="Series cover"
                      loading="lazy"
                      className="w-full aspect-[3/4] object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => setMangaInfo(prev => prev ? { ...prev, cover_image_url: '' } : null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">No cover image</p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2"
                  onClick={() => {
                    setSelectedSeriesForCover({
                      id: mangaInfo.id,
                      title: mangaInfo.title,
                      author: mangaInfo.author,
                      status: mangaInfo.status,
                      created_at: new Date().toISOString(),
                      chapter_count: 0,
                      cover_image_url: mangaInfo.cover_image_url
                    });
                    setShowCoverModal(true);
                  }}
                >
                  <Upload className="h-4 w-4" />
                  {mangaInfo.cover_image_url ? 'Update Cover' : 'Upload Cover'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Genres */}
          <Card>
            <CardHeader>
              <CardTitle>Genres</CardTitle>
              <CardDescription>Categorize your series</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {mangaInfo.genres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="gap-1">
                    {genre}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeGenre(genre)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Select value={newGenre} onValueChange={setNewGenre}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select genre..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_GENRES.filter(g => !mangaInfo.genres.includes(g)).map(genre => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={addGenre} disabled={!newGenre}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add custom tags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {mangaInfo.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button size="sm" onClick={addTag} disabled={!newTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </>
      )}

      {/* Delete Confirmation Dialogs */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Series</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this series? This action will also delete all chapters
              associated with this series and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (seriesToDelete) {
                  deleteSeries(seriesToDelete);
                  setSeriesToDelete(null);
                  setShowDeleteDialog(false);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Series'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Series</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedSeriesIds.size} series? This action will also delete all chapters
              associated with these series and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                bulkDeleteSeries();
                setBulkDeleteDialog(false);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : `Delete ${selectedSeriesIds.size} Series`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cover Upload Modal */}
      {showCoverModal && selectedSeriesForCover && (
        <CoverUploadModal
          isOpen={showCoverModal}
          onClose={() => {
            setShowCoverModal(false);
            setSelectedSeriesForCover(null);
          }}
          seriesId={selectedSeriesForCover.id}
          seriesTitle={selectedSeriesForCover.title}
          currentCover={selectedSeriesForCover.cover_image_url}
          onCoverUpdated={handleCoverUpdated}
        />
      )}

      {/* Quick Edit Modal (✎) */}
      <MangaEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        seriesId={editSeriesId}
        seriesTitle={seriesList.find(s => s.id === editSeriesId)?.title}
      />
    </div>
  );
};