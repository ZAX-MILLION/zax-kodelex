import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Lock, 
  Unlock, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  Upload,
  MoreHorizontal,
  GripVertical,
  Calendar,
  Image,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ChapterEditor } from "./ChapterEditor";

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  sort_order: number;
  is_locked: boolean;
  page_count: number;
  view_count: number;
  download_count: number;
  thumbnail_url?: string;
  release_date: string;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
  series_id?: string;
}

interface Series {
  id: string;
  title: string;
}

interface ChapterStats {
  totalViews: number;
  totalDownloads: number;
  averageViews: number;
}

interface ChapterManagerProps { initialSeriesId?: string }
export const ChapterManager = ({ initialSeriesId }: ChapterManagerProps) => {
  const { toast } = useToast();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(initialSeriesId || "all");
  const [stats, setStats] = useState<ChapterStats>({
    totalViews: 0,
    totalDownloads: 0,
    averageViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChapterEditor, setShowChapterEditor] = useState(false);

  useEffect(() => {
    loadSeries();
    loadChapters();
  }, []);

  // Keep list filtered to provided series in embedded contexts
  useEffect(() => {
    if (initialSeriesId) {
      setSelectedSeriesId(initialSeriesId);
    }
  }, [initialSeriesId]);

  const loadSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('manga_meta')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setAllSeries(data || []);
    } catch (error) {
      console.error('Error loading series:', error);
    }
  };

  const loadChapters = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('chapters')
        .select('*')
        .order('sort_order', { ascending: true });

      // Filter by series if selected
      if (selectedSeriesId !== "all") {
        query = query.eq('series_id', selectedSeriesId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setChapters(data);
        
        // Calculate stats
        const totalViews = data.reduce((sum, ch) => sum + (ch.view_count || 0), 0);
        const totalDownloads = data.reduce((sum, ch) => sum + (ch.download_count || 0), 0);
        const averageViews = data.length > 0 ? Math.round(totalViews / data.length) : 0;
        
        setStats({
          totalViews,
          totalDownloads,
          averageViews,
        });
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      toast({
        title: "Error loading chapters",
        description: "Failed to load chapter data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleChapterLock = async (chapterId: string, currentLockState: boolean) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .update({ is_locked: !currentLockState })
        .eq('id', chapterId);

      if (error) throw error;

      setChapters(prev => prev.map(ch => 
        ch.id === chapterId ? { ...ch, is_locked: !currentLockState } : ch
      ));

      toast({
        title: currentLockState ? "Chapter unlocked" : "Chapter locked",
        description: `Chapter has been ${currentLockState ? 'unlocked' : 'locked'} successfully.`,
      });
    } catch (error) {
      console.error('Error toggling chapter lock:', error);
      toast({
        title: "Error updating chapter",
        description: "Failed to update chapter lock status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteChapter = async (chapterId: string) => {
    if (!confirm("Are you sure you want to delete this chapter? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;

      setChapters(prev => prev.filter(ch => ch.id !== chapterId));
      
      toast({
        title: "Chapter deleted",
        description: "Chapter has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast({
        title: "Error deleting chapter",
        description: "Failed to delete chapter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateChapterOrder = async (chapterId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('chapters')
        .update({ sort_order: newOrder })
        .eq('id', chapterId);

      if (error) throw error;

      loadChapters(); // Reload to get updated order
    } catch (error) {
      console.error('Error updating chapter order:', error);
      toast({
        title: "Error updating order",
        description: "Failed to update chapter order. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reload chapters when series selection changes
  useEffect(() => {
    if (allSeries.length > 0) {
      loadChapters();
    }
  }, [selectedSeriesId]);

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.chapter_number.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chapter Manager</h2>
          <p className="text-muted-foreground">Manage your manga chapters and their settings</p>
        </div>
        <Button 
          className="gap-2"
          onClick={() => {
            setEditingChapter(null);
            setShowChapterEditor(true);
          }}
        >
          <Upload className="h-4 w-4" />
          Upload New Chapter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Chapters</p>
                <p className="text-2xl font-bold">{chapters.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                <p className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Views</p>
                <p className="text-2xl font-bold">{stats.averageViews}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Chapter List</CardTitle>
          <CardDescription>Manage and organize your chapters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            {!initialSeriesId && (
              <Select value={selectedSeriesId} onValueChange={setSelectedSeriesId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filter by series" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Series</SelectItem>
                  {allSeries.map((series) => (
                    <SelectItem key={series.id} value={series.id}>
                      {series.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={initialSeriesId ? "w-full sm:max-w-sm" : "max-w-sm"}
            />
          </div>

          {/* Chapters Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Chapter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Release Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChapters.map((chapter) => (
                  <TableRow key={chapter.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <span className="font-medium">{chapter.chapter_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {chapter.thumbnail_url ? (
                          <img
                            src={chapter.thumbnail_url}
                            alt="Chapter thumbnail"
                            loading="lazy"
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <Image className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{chapter.title}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {chapter.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={chapter.is_locked ? "destructive" : "default"}>
                          {chapter.is_locked ? "Locked" : "Public"}
                        </Badge>
                        <Switch
                          checked={!chapter.is_locked}
                          onCheckedChange={() => toggleChapterLock(chapter.id, chapter.is_locked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{chapter.page_count} pages</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>{chapter.view_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {format(new Date(chapter.release_date), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingChapter(chapter);
                            setShowChapterEditor(true);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedChapter(chapter)}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Stats
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => toggleChapterLock(chapter.id, chapter.is_locked)}
                          >
                            {chapter.is_locked ? (
                              <>
                                <Unlock className="h-4 w-4 mr-2" />
                                Unlock
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Lock
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteChapter(chapter.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredChapters.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No chapters found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Try adjusting your search" : "Upload your first chapter to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chapter Stats Modal */}
      <Dialog open={!!selectedChapter} onOpenChange={() => setSelectedChapter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chapter Statistics</DialogTitle>
            <DialogDescription>
              Detailed analytics for Chapter {selectedChapter?.chapter_number}: {selectedChapter?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedChapter && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{selectedChapter.view_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{selectedChapter.download_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Release Date:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(selectedChapter.release_date), 'PPP')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Page Count:</span>
                  <span className="text-sm font-medium">{selectedChapter.page_count} pages</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={selectedChapter.is_locked ? "destructive" : "default"}>
                    {selectedChapter.is_locked ? "Locked" : "Public"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chapter Editor Modal */}
      <ChapterEditor
        chapter={editingChapter}
        isOpen={showChapterEditor}
        onClose={() => {
          setShowChapterEditor(false);
          setEditingChapter(null);
        }}
        onSave={() => {
          loadChapters();
          setShowChapterEditor(false);
          setEditingChapter(null);
        }}
      />
    </div>
  );
};