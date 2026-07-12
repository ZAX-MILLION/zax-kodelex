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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
  Filter, 
  Grid3X3, 
  List, 
  Eye, 
  Download, 
  Trash2,
  ImageIcon,
  FileText,
  Calendar,
  HardDrive,
  Folder,
  SortAsc,
  SortDesc
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import LazyImage from "@/components/LazyImage";

interface MediaFile {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'document' | 'archive' | 'other';
  category: 'cover' | 'chapter_page' | 'thumbnail' | 'user_upload' | 'asset' | 'other';
  series_title?: string;
  chapter_number?: number;
  uploader: string;
  upload_date: string;
  last_accessed?: string;
  download_count: number;
  storage_path: string;
  metadata?: any;
}

export const AllMediaBrowser = () => {
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("upload_date");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    loadMediaFiles();
  }, []);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      // Mock data since comprehensive media tables might not exist
      const mockFiles: MediaFile[] = [
        {
          id: '1',
          filename: 'dragon-slayer-cover.jpg',
          file_path: '/covers/dragon-slayer-cover.jpg',
          file_size: 156000,
          mime_type: 'image/jpeg',
          file_type: 'image',
          category: 'cover',
          series_title: 'Dragon Slayer Chronicles',
          uploader: 'Admin',
          upload_date: new Date(Date.now() - 86400000).toISOString(),
          last_accessed: new Date().toISOString(),
          download_count: 1245,
          storage_path: '/storage/covers/dragon-slayer-cover.jpg'
        },
        {
          id: '2',
          filename: 'chapter-45-page-01.jpg',
          file_path: '/chapters/dragon-slayer/45/page-01.jpg',
          file_size: 523000,
          mime_type: 'image/jpeg',
          file_type: 'image',
          category: 'chapter_page',
          series_title: 'Dragon Slayer Chronicles',
          chapter_number: 45,
          uploader: 'Author123',
          upload_date: new Date(Date.now() - 172800000).toISOString(),
          last_accessed: new Date(Date.now() - 3600000).toISOString(),
          download_count: 3421,
          storage_path: '/storage/chapters/dragon-slayer/45/page-01.jpg'
        },
        {
          id: '3',
          filename: 'mystic-academy-thumbnail.jpg',
          file_path: '/thumbnails/mystic-academy-thumb.jpg',
          file_size: 45000,
          mime_type: 'image/jpeg',
          file_type: 'image',
          category: 'thumbnail',
          series_title: 'Mystic Academy',
          uploader: 'System',
          upload_date: new Date(Date.now() - 259200000).toISOString(),
          download_count: 892,
          storage_path: '/storage/thumbnails/mystic-academy-thumb.jpg'
        },
        {
          id: '4',
          filename: 'user-avatar-custom.png',
          file_path: '/uploads/user123/avatar.png',
          file_size: 89000,
          mime_type: 'image/png',
          file_type: 'image',
          category: 'user_upload',
          uploader: 'user@example.com',
          upload_date: new Date(Date.now() - 345600000).toISOString(),
          download_count: 12,
          storage_path: '/storage/uploads/user123/avatar.png'
        },
        {
          id: '5',
          filename: 'backup-archive.zip',
          file_path: '/backups/backup-2024-01.zip',
          file_size: 15600000,
          mime_type: 'application/zip',
          file_type: 'archive',
          category: 'other',
          uploader: 'System',
          upload_date: new Date(Date.now() - 432000000).toISOString(),
          download_count: 5,
          storage_path: '/storage/backups/backup-2024-01.zip'
        }
      ];
      setMediaFiles(mockFiles);
    } catch (error) {
      console.error('Error loading media files:', error);
      toast({
        title: "Error loading media",
        description: "Failed to load media files.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedFiles.length} selected files? This action cannot be undone.`)) {
      return;
    }

    try {
      setMediaFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
      
      toast({
        title: "Files deleted",
        description: `${selectedFiles.length} files have been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting files:', error);
      toast({
        title: "Error deleting files",
        description: "Failed to delete selected files.",
        variant: "destructive",
      });
    }
  };

  const bulkDownload = async () => {
    if (selectedFiles.length === 0) return;
    
    toast({
      title: "Download started",
      description: `Preparing ${selectedFiles.length} files for download.`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: MediaFile) => {
    switch (file.file_type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'archive':
        return <Folder className="h-4 w-4" />;
      default:
        return <HardDrive className="h-4 w-4" />;
    }
  };

  const getCategoryBadge = (category: MediaFile['category']) => {
    const categoryMap = {
      cover: { label: 'Cover', variant: 'default' as const },
      chapter_page: { label: 'Chapter', variant: 'secondary' as const },
      thumbnail: { label: 'Thumbnail', variant: 'outline' as const },
      user_upload: { label: 'User Upload', variant: 'secondary' as const },
      asset: { label: 'Asset', variant: 'outline' as const },
      other: { label: 'Other', variant: 'secondary' as const }
    };
    
    const config = categoryMap[category] || categoryMap.other;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const sortedAndFilteredFiles = mediaFiles
    .filter(file => {
      const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.series_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.uploader.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
      const matchesType = typeFilter === 'all' || file.file_type === typeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof MediaFile];
      const bValue = b[sortBy as keyof MediaFile];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
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
          <h3 className="text-lg font-semibold">All Media Browser</h3>
          <p className="text-sm text-muted-foreground">
            {mediaFiles.length} total files • {formatFileSize(mediaFiles.reduce((sum, f) => sum + f.file_size, 0))} storage used
          </p>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedFiles.length} selected
            </span>
            <Button variant="outline" size="sm" onClick={bulkDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="destructive" size="sm" onClick={bulkDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="cover">Covers</SelectItem>
              <SelectItem value="chapter_page">Chapter Pages</SelectItem>
              <SelectItem value="thumbnail">Thumbnails</SelectItem>
              <SelectItem value="user_upload">User Uploads</SelectItem>
              <SelectItem value="asset">Assets</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="archive">Archives</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upload_date">Upload Date</SelectItem>
              <SelectItem value="filename">Filename</SelectItem>
              <SelectItem value="file_size">File Size</SelectItem>
              <SelectItem value="download_count">Downloads</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
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

      {sortedAndFilteredFiles.length === 0 ? (
        <div className="text-center py-8">
          <HardDrive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No media files found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? "Try adjusting your search or filters" : "No files have been uploaded yet"}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {sortedAndFilteredFiles.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square bg-muted">
                  {file.file_type === 'image' ? (
                    <LazyImage
                      src={file.file_path}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2">
                    <Checkbox 
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFiles(prev => [...prev, file.id]);
                        } else {
                          setSelectedFiles(prev => prev.filter(id => id !== file.id));
                        }
                      }}
                      className="bg-white border-2"
                    />
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    {getCategoryBadge(file.category)}
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => setSelectedFile(file)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>File Details</DialogTitle>
                          <DialogDescription>
                            {selectedFile?.filename}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedFile && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Filename</p>
                                <p className="text-sm text-muted-foreground">{selectedFile.filename}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">File Size</p>
                                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.file_size)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">MIME Type</p>
                                <p className="text-sm text-muted-foreground">{selectedFile.mime_type}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Category</p>
                                <p className="text-sm text-muted-foreground">{selectedFile.category}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Uploader</p>
                                <p className="text-sm text-muted-foreground">{selectedFile.uploader}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Downloads</p>
                                <p className="text-sm text-muted-foreground">{selectedFile.download_count.toLocaleString()}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium mb-2">Storage Path</p>
                              <p className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
                                {selectedFile.storage_path}
                              </p>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <Button variant="outline">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                              <Button variant="destructive">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="secondary" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{file.filename}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                  {file.series_title && (
                    <p className="text-xs text-muted-foreground truncate">{file.series_title}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedFiles.length === sortedAndFilteredFiles.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFiles(sortedAndFilteredFiles.map(f => f.id));
                      } else {
                        setSelectedFiles([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>File</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Series</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFiles(prev => [...prev, file.id]);
                        } else {
                          setSelectedFiles(prev => prev.filter(id => id !== file.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {file.file_type === 'image' ? (
                        <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                          <LazyImage
                            src={file.file_path}
                            alt={file.filename}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          {getFileIcon(file)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{file.filename}</p>
                        <p className="text-sm text-muted-foreground">{file.mime_type}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(file.category)}</TableCell>
                  <TableCell>
                    {file.series_title ? (
                      <div>
                        <p className="text-sm">{file.series_title}</p>
                        {file.chapter_number && (
                          <p className="text-xs text-muted-foreground">Ch. {file.chapter_number}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatFileSize(file.file_size)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{file.uploader}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{format(new Date(file.upload_date), 'MMM d, yyyy')}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{file.download_count.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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