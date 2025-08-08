import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Save, 
  X, 
  Trash2, 
  Upload, 
  GripVertical, 
  Edit3,
  Image as ImageIcon 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChapterPage {
  id: string;
  url: string;
  order: number;
}

interface ChapterData {
  id: string;
  chapterNumber: number;
  title: string;
  pages: ChapterPage[];
  thumbnailUrl?: string;
  releaseDate: string;
}

interface ChapterEditorProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: ChapterData | null;
  onSave: (chapter: ChapterData) => void;
}

const ChapterEditor = ({ isOpen, onClose, chapter, onSave }: ChapterEditorProps) => {
  const [editedChapter, setEditedChapter] = useState<ChapterData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (chapter) {
      setEditedChapter({
        ...chapter,
        pages: chapter.pages.map((page, index) => ({
          id: `page-${index}`,
          url: typeof page === 'string' ? page : page.url,
          order: index,
        })),
      });
    }
  }, [chapter]);

  if (!editedChapter) return null;

  const handleSave = () => {
    if (!editedChapter) return;
    
    const updatedChapter = {
      ...editedChapter,
      pages: editedChapter.pages.map(page => page.url),
    };
    
    onSave(updatedChapter as any);
    toast({
      title: "Success",
      description: "Chapter updated successfully!",
    });
    onClose();
  };

  const handlePageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Mock upload - replace with real Supabase storage upload
      const newPages: ChapterPage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Create a temporary URL for preview
        const tempUrl = URL.createObjectURL(file);
        
        newPages.push({
          id: `new-page-${Date.now()}-${i}`,
          url: tempUrl,
          order: editedChapter.pages.length + i,
        });
      }
      
      setEditedChapter(prev => ({
        ...prev!,
        pages: [...prev!.pages, ...newPages],
      }));
      
      toast({
        title: "Success",
        description: `${files.length} page(s) uploaded successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload pages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePage = (pageId: string) => {
    setEditedChapter(prev => ({
      ...prev!,
      pages: prev!.pages.filter(page => page.id !== pageId),
    }));
    
    toast({
      title: "Success",
      description: "Page deleted successfully!",
    });
  };

  const handleReplacePage = async (pageId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Mock replace - replace with real Supabase storage upload
      const tempUrl = URL.createObjectURL(file);
      
      setEditedChapter(prev => ({
        ...prev!,
        pages: prev!.pages.map(page =>
          page.id === pageId ? { ...page, url: tempUrl } : page
        ),
      }));
      
      toast({
        title: "Success",
        description: "Page replaced successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to replace page. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const pages = Array.from(editedChapter.pages);
    const [reorderedPage] = pages.splice(result.source.index, 1);
    pages.splice(result.destination.index, 0, reorderedPage);

    // Update order numbers
    const updatedPages = pages.map((page, index) => ({
      ...page,
      order: index,
    }));

    setEditedChapter(prev => ({
      ...prev!,
      pages: updatedPages,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-manga-red flex items-center gap-2">
            <Edit3 className="h-6 w-6" />
            Edit Chapter {editedChapter.chapterNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chapter Details */}
          <Card className="p-4 bg-gradient-card border-border/30">
            <h3 className="text-lg font-semibold mb-4">Chapter Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chapter-number">Chapter Number</Label>
                <Input
                  id="chapter-number"
                  type="number"
                  value={editedChapter.chapterNumber}
                  onChange={(e) => setEditedChapter(prev => ({
                    ...prev!,
                    chapterNumber: parseInt(e.target.value) || 0,
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chapter-title">Chapter Title</Label>
                <Input
                  id="chapter-title"
                  value={editedChapter.title}
                  onChange={(e) => setEditedChapter(prev => ({
                    ...prev!,
                    title: e.target.value,
                  }))}
                  placeholder="Enter chapter title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="release-date">Release Date</Label>
                <Input
                  id="release-date"
                  type="date"
                  value={editedChapter.releaseDate.split('T')[0]}
                  onChange={(e) => setEditedChapter(prev => ({
                    ...prev!,
                    releaseDate: e.target.value,
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="thumbnail-url">Thumbnail URL</Label>
                <Input
                  id="thumbnail-url"
                  value={editedChapter.thumbnailUrl || ''}
                  onChange={(e) => setEditedChapter(prev => ({
                    ...prev!,
                    thumbnailUrl: e.target.value,
                  }))}
                  placeholder="Enter thumbnail URL"
                />
              </div>
            </div>
          </Card>

          {/* Page Management */}
          <Card className="p-4 bg-gradient-card border-border/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Pages ({editedChapter.pages.length})</h3>
              <div className="flex gap-2">
                <Label htmlFor="page-upload" className="cursor-pointer">
                  <Button asChild disabled={isUploading}>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Add Pages'}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="page-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {editedChapter.pages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pages uploaded yet. Add some pages to get started.</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="pages">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                      {editedChapter.pages.map((page, index) => (
                        <Draggable key={page.id} draggableId={page.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`relative group ${
                                snapshot.isDragging ? 'opacity-75' : ''
                              }`}
                            >
                              <Card className="overflow-hidden bg-gradient-card border-border/30">
                                <div className="relative aspect-[3/4]">
                                  <img
                                    src={page.url}
                                    alt={`Page ${index + 1}`}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                  />
                                  
                                  {/* Drag Handle */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="absolute top-2 left-2 p-1 bg-black/50 rounded cursor-grab"
                                  >
                                    <GripVertical className="h-4 w-4 text-white" />
                                  </div>
                                  
                                  {/* Page Number */}
                                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-white text-xs">
                                    {index + 1}
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Label htmlFor={`replace-${page.id}`} className="flex-1">
                                      <Button asChild size="sm" variant="secondary" className="w-full">
                                        <span>Replace</span>
                                      </Button>
                                    </Label>
                                    <Input
                                      id={`replace-${page.id}`}
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleReplacePage(page.id, e)}
                                      className="hidden"
                                    />
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeletePage(page.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-border/30">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-accent hover:opacity-90">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterEditor;