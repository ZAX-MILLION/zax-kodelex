import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Calendar, 
  Eye, 
  Edit, 
  Trash2, 
  Upload,
  Coins,
  Lock,
  Unlock,
  GripVertical,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SavedChapter {
  id: string;
  title: string;
  series_id: string;
  series_title: string;
  chapter_number: number;
  description?: string;
  coin_price: number;
  is_free: boolean;
  page_count: number;
  status: 'draft' | 'ready' | 'scheduled';
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
}

export const SavedChaptersQueue = () => {
  const { toast } = useToast();
  const [chapters, setChapters] = useState<SavedChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChapter, setEditingChapter] = useState<SavedChapter | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadSavedChapters();
  }, []);

  const loadSavedChapters = async () => {
    try {
      setLoading(true);
      // Mock data since the table might not exist
      const mockChapters: SavedChapter[] = [
        {
          id: '1',
          title: 'The Final Battle Begins',
          series_id: 'series-1',
          series_title: 'Dragon Slayer Chronicles',
          chapter_number: 45,
          description: 'Epic confrontation chapter',
          coin_price: 5,
          is_free: false,
          page_count: 22,
          status: 'ready',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Mysterious Discovery',
          series_id: 'series-2',
          series_title: 'Mystic Academy',
          chapter_number: 23,
          coin_price: 0,
          is_free: true,
          page_count: 18,
          status: 'draft',
          scheduled_for: new Date(Date.now() + 86400000).toISOString(),
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setChapters(mockChapters);
    } catch (error) {
      console.error('Error loading saved chapters:', error);
      toast({
        title: "Error loading chapters",
        description: "Failed to load saved chapters.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const publishChapter = async (chapterId: string) => {
    try {
      // Mock publish functionality
      setChapters(prev => prev.filter(c => c.id !== chapterId));
      toast({
        title: "Chapter published",
        description: "Chapter has been published successfully.",
      });
    } catch (error) {
      console.error('Error publishing chapter:', error);
      toast({
        title: "Error publishing chapter",
        description: "Failed to publish chapter.",
        variant: "destructive",
      });
    }
  };

  const scheduleChapter = async (chapterId: string, scheduledDate: string) => {
    try {
      setChapters(prev => prev.map(c => 
        c.id === chapterId 
          ? { ...c, status: 'scheduled' as const, scheduled_for: scheduledDate }
          : c
      ));
      toast({
        title: "Chapter scheduled",
        description: "Chapter has been scheduled for release.",
      });
    } catch (error) {
      console.error('Error scheduling chapter:', error);
      toast({
        title: "Error scheduling chapter",
        description: "Failed to schedule chapter.",
        variant: "destructive",
      });
    }
  };

  const deleteChapter = async (chapterId: string) => {
    if (!confirm("Are you sure you want to delete this chapter? This action cannot be undone.")) {
      return;
    }

    try {
      setChapters(prev => prev.filter(c => c.id !== chapterId));
      toast({
        title: "Chapter deleted",
        description: "Chapter has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast({
        title: "Error deleting chapter",
        description: "Failed to delete chapter.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (chapter: SavedChapter) => {
    switch (chapter.status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'ready':
        return <Badge variant="default">Ready</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Saved Chapters Queue</h3>
          <p className="text-sm text-muted-foreground">
            {chapters.length} chapters ready for publishing
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Chapter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Chapter</DialogTitle>
              <DialogDescription>
                Upload and configure a new chapter for the queue
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="series">Series</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select series" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="series-1">Dragon Slayer Chronicles</SelectItem>
                      <SelectItem value="series-2">Mystic Academy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="chapter-number">Chapter Number</Label>
                  <Input type="number" placeholder="1" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Chapter Title</Label>
                <Input placeholder="Enter chapter title" />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea placeholder="Brief chapter description" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coin-price">Coin Price</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch id="is-free" />
                  <Label htmlFor="is-free">Free Chapter</Label>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Drag and drop chapter images here, or click to upload
                </p>
                <Button variant="outline" className="mt-2">
                  Select Files
                </Button>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateModalOpen(false)}>
                  Save to Queue
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {chapters.length === 0 ? (
        <Card className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No saved chapters</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding chapters to your publishing queue
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Chapter
          </Button>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>Series</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chapters.map((chapter) => (
                <TableRow key={chapter.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">Ch. {chapter.chapter_number}: {chapter.title}</p>
                      {chapter.description && (
                        <p className="text-sm text-muted-foreground">{chapter.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{chapter.series_title}</p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(chapter)}
                    {chapter.scheduled_for && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(chapter.scheduled_for), 'MMM d, h:mm a')}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {chapter.is_free ? (
                        <Badge variant="outline" className="gap-1">
                          <Unlock className="h-3 w-3" />
                          Free
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Coins className="h-3 w-3" />
                          {chapter.coin_price}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{chapter.page_count} pages</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{format(new Date(chapter.created_at), 'MMM d')}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => publishChapter(chapter.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Publish
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteChapter(chapter.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};