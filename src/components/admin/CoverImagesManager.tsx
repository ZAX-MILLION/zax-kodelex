import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Grid3X3, 
  List, 
  Eye, 
  Edit, 
  Trash2, 
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LazyImage from "@/components/LazyImage";

interface CoverImage {
  id: string;
  series_id: string;
  series_title: string;
  cover_url: string;
  thumbnail_url?: string;
  og_image_url?: string;
  file_size: number;
  dimensions: { width: number; height: number };
  status: 'active' | 'broken' | 'missing';
  last_checked: string;
  upload_date: string;
  genre: string;
  author: string;
  view_count: number;
}

export const CoverImagesManager = () => {
  const { toast } = useToast();
  const [covers, setCovers] = useState<CoverImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCover, setSelectedCover] = useState<CoverImage | null>(null);

  useEffect(() => {
    loadCoverImages();
  }, []);

  const loadCoverImages = async () => {
    try {
      setLoading(true);
      // Mock data since cover management tables might not exist
      const mockCovers: CoverImage[] = [
        {
          id: '1',
          series_id: 'series-1',
          series_title: 'Dragon Slayer Chronicles',
          cover_url: '/src/assets/manga-covers/dragon-slayer-chronicles.jpg',
          thumbnail_url: '/src/assets/manga-covers/dragon-slayer-chronicles-thumb.jpg',
          og_image_url: '/src/assets/manga-covers/dragon-slayer-chronicles-og.jpg',
          file_size: 156000,
          dimensions: { width: 800, height: 1200 },
          status: 'active',
          last_checked: new Date().toISOString(),
          upload_date: new Date(Date.now() - 86400000).toISOString(),
          genre: 'Action',
          author: 'Author Name',
          view_count: 12450
        },
        {
          id: '2',
          series_id: 'series-2',
          series_title: 'Mystic Academy',
          cover_url: '/src/assets/manga-covers/mystic-academy-cover.jpg',
          file_size: 203000,
          dimensions: { width: 600, height: 900 },
          status: 'broken',
          last_checked: new Date(Date.now() - 3600000).toISOString(),
          upload_date: new Date(Date.now() - 172800000).toISOString(),
          genre: 'Fantasy',
          author: 'Another Author',
          view_count: 8932
        },
        {
          id: '3',
          series_id: 'series-3',
          series_title: 'Crimson Blade',
          cover_url: '/src/assets/manga-covers/crimson-blade-cover.jpg',
          thumbnail_url: '/src/assets/manga-covers/crimson-blade-cover-thumb.jpg',
          file_size: 178000,
          dimensions: { width: 750, height: 1125 },
          status: 'active',
          last_checked: new Date(Date.now() - 1800000).toISOString(),
          upload_date: new Date(Date.now() - 259200000).toISOString(),
          genre: 'Action',
          author: 'Third Author',
          view_count: 15780
        }
      ];
      setCovers(mockCovers);
    } catch (error) {
      console.error('Error loading cover images:', error);
      toast({
        title: "Error loading covers",
        description: "Failed to load cover images.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCoverStatus = async (coverId: string) => {
    try {
      // Mock status check
      setCovers(prev => prev.map(cover => 
        cover.id === coverId 
          ? { ...cover, status: 'active' as const, last_checked: new Date().toISOString() }
          : cover
      ));
      
      toast({
        title: "Status checked",
        description: "Cover status has been verified.",
      });
    } catch (error) {
      console.error('Error checking cover status:', error);
      toast({
        title: "Error checking status",
        description: "Failed to verify cover status.",
        variant: "destructive",
      });
    }
  };

  const regenerateVariants = async (coverId: string) => {
    try {
      // Mock regeneration
      setCovers(prev => prev.map(cover => 
        cover.id === coverId 
          ? { 
              ...cover, 
              thumbnail_url: cover.cover_url.replace('.jpg', '-thumb.jpg'),
              og_image_url: cover.cover_url.replace('.jpg', '-og.jpg'),
              last_checked: new Date().toISOString()
            }
          : cover
      ));
      
      toast({
        title: "Variants regenerated",
        description: "Thumbnail and OG image variants have been created.",
      });
    } catch (error) {
      console.error('Error regenerating variants:', error);
      toast({
        title: "Error regenerating variants",
        description: "Failed to regenerate image variants.",
        variant: "destructive",
      });
    }
  };

  const deleteCover = async (coverId: string) => {
    if (!confirm("Are you sure you want to delete this cover? This action cannot be undone.")) {
      return;
    }

    try {
      setCovers(prev => prev.filter(cover => cover.id !== coverId));
      toast({
        title: "Cover deleted",
        description: "Cover image has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting cover:', error);
      toast({
        title: "Error deleting cover",
        description: "Failed to delete cover image.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: CoverImage['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Active</Badge>;
      case 'broken':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Broken</Badge>;
      case 'missing':
        return <Badge variant="outline" className="gap-1"><AlertTriangle className="h-3 w-3" />Missing</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredCovers = covers.filter(cover => {
    const matchesSearch = cover.series_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cover.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cover.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cover.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <h3 className="text-lg font-semibold">Cover Images Manager</h3>
          <p className="text-sm text-muted-foreground">
            {covers.filter(c => c.status === 'broken').length} issues found • {covers.length} total covers
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Bulk Upload
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Check All
          </Button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search covers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="broken">Broken</SelectItem>
              <SelectItem value="missing">Missing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-1 border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filteredCovers.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No cover images found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? "Try adjusting your search" : "No covers have been uploaded yet"}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredCovers.map((cover) => (
            <Card key={cover.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[3/4] bg-muted">
                  <LazyImage
                    src={cover.cover_url}
                    alt={cover.series_title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(cover.status)}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => setSelectedCover(cover)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Cover Details - {cover.series_title}</DialogTitle>
                          <DialogDescription>
                            Manage cover image and variants
                          </DialogDescription>
                        </DialogHeader>
                        {selectedCover && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                                <LazyImage
                                  src={selectedCover.cover_url}
                                  alt={selectedCover.series_title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                {selectedCover.thumbnail_url && (
                                  <div>
                                    <p className="text-xs font-medium mb-1">Thumbnail</p>
                                    <div className="aspect-[3/4] bg-muted rounded overflow-hidden">
                                      <LazyImage
                                        src={selectedCover.thumbnail_url}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </div>
                                )}
                                {selectedCover.og_image_url && (
                                  <div>
                                    <p className="text-xs font-medium mb-1">OG Image</p>
                                    <div className="aspect-[16/9] bg-muted rounded overflow-hidden">
                                      <LazyImage
                                        src={selectedCover.og_image_url}
                                        alt="OG Image"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Series</p>
                                  <p className="text-sm text-muted-foreground">{selectedCover.series_title}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Author</p>
                                  <p className="text-sm text-muted-foreground">{selectedCover.author}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Genre</p>
                                  <p className="text-sm text-muted-foreground">{selectedCover.genre}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Views</p>
                                  <p className="text-sm text-muted-foreground">{selectedCover.view_count.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Dimensions</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedCover.dimensions.width} × {selectedCover.dimensions.height}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">File Size</p>
                                  <p className="text-sm text-muted-foreground">{formatFileSize(selectedCover.file_size)}</p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Button 
                                  className="w-full" 
                                  onClick={() => regenerateVariants(selectedCover.id)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Regenerate Variants
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={() => checkCoverStatus(selectedCover.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Check Status
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Replace Cover
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  className="w-full"
                                  onClick={() => deleteCover(selectedCover.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Cover
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="secondary" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm truncate">{cover.series_title}</h4>
                  <p className="text-xs text-muted-foreground">{cover.author}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">{cover.genre}</Badge>
                    <span className="text-xs text-muted-foreground">{formatFileSize(cover.file_size)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCovers.map((cover) => (
            <Card key={cover.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                    <LazyImage
                      src={cover.cover_url}
                      alt={cover.series_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{cover.series_title}</h4>
                        <p className="text-sm text-muted-foreground">{cover.author} • {cover.genre}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{cover.dimensions.width} × {cover.dimensions.height}</span>
                          <span>{formatFileSize(cover.file_size)}</span>
                          <span>{cover.view_count.toLocaleString()} views</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(cover.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => checkCoverStatus(cover.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};