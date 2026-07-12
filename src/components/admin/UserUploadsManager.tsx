import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Users,
  Calendar,
  Download,
  Tag,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UserUpload {
  id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  upload_type: 'profile_avatar' | 'comment_image' | 'custom_cover' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  uploader_email: string;
  uploader_id: string;
  upload_date: string;
  moderation_notes?: string;
  tags: string[];
  file_url: string;
}

export const UserUploadsManager = () => {
  const { toast } = useToast();
  const [uploads, setUploads] = useState<UserUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUploads, setSelectedUploads] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedUpload, setSelectedUpload] = useState<UserUpload | null>(null);

  useEffect(() => {
    loadUserUploads();
  }, []);

  const loadUserUploads = async () => {
    try {
      setLoading(true);
      // Mock data since user upload tables might not exist
      const mockUploads: UserUpload[] = [
        {
          id: '1',
          filename: 'custom_avatar.jpg',
          file_size: 156000,
          mime_type: 'image/jpeg',
          upload_type: 'profile_avatar',
          status: 'pending',
          uploader_email: 'user@example.com',
          uploader_id: 'user-1',
          upload_date: new Date().toISOString(),
          tags: ['avatar', 'profile'],
          file_url: '/uploads/user-1/custom_avatar.jpg'
        },
        {
          id: '2',
          filename: 'comment_screenshot.png',
          file_size: 523000,
          mime_type: 'image/png',
          upload_type: 'comment_image',
          status: 'approved',
          uploader_email: 'reader@example.com',
          uploader_id: 'user-2',
          upload_date: new Date(Date.now() - 86400000).toISOString(),
          tags: ['comment', 'discussion'],
          file_url: '/uploads/user-2/comment_screenshot.png'
        },
        {
          id: '3',
          filename: 'fan_cover_design.jpg',
          file_size: 891000,
          mime_type: 'image/jpeg',
          upload_type: 'custom_cover',
          status: 'rejected',
          uploader_email: 'artist@example.com',
          uploader_id: 'user-3',
          upload_date: new Date(Date.now() - 172800000).toISOString(),
          moderation_notes: 'Copyright concerns - contains unauthorized artwork',
          tags: ['fan-art', 'cover', 'rejected'],
          file_url: '/uploads/user-3/fan_cover_design.jpg'
        }
      ];
      setUploads(mockUploads);
    } catch (error) {
      console.error('Error loading user uploads:', error);
      toast({
        title: "Error loading uploads",
        description: "Failed to load user uploads.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const moderateUpload = async (uploadId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, status, moderation_notes: notes }
          : upload
      ));
      
      toast({
        title: `Upload ${action}d`,
        description: `Upload has been ${action}d successfully.`,
      });
    } catch (error) {
      console.error(`Error ${action}ing upload:`, error);
      toast({
        title: `Error ${action}ing upload`,
        description: `Failed to ${action} upload.`,
        variant: "destructive",
      });
    }
  };

  const bulkModerate = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedUploads.length === 0) return;
    
    if (!confirm(`Are you sure you want to ${action} ${selectedUploads.length} selected uploads?`)) {
      return;
    }

    try {
      if (action === 'delete') {
        setUploads(prev => prev.filter(upload => !selectedUploads.includes(upload.id)));
      } else {
        const status = action === 'approve' ? 'approved' : 'rejected';
        setUploads(prev => prev.map(upload => 
          selectedUploads.includes(upload.id) 
            ? { ...upload, status }
            : upload
        ));
      }
      
      setSelectedUploads([]);
      toast({
        title: `Bulk ${action} completed`,
        description: `${selectedUploads.length} uploads have been ${action}d.`,
      });
    } catch (error) {
      console.error(`Error with bulk ${action}:`, error);
      toast({
        title: `Error with bulk ${action}`,
        description: `Failed to ${action} selected uploads.`,
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

  const getStatusBadge = (status: UserUpload['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: UserUpload['upload_type']) => {
    const typeMap = {
      profile_avatar: { label: 'Avatar', variant: 'secondary' as const },
      comment_image: { label: 'Comment', variant: 'outline' as const },
      custom_cover: { label: 'Cover', variant: 'default' as const },
      other: { label: 'Other', variant: 'secondary' as const }
    };
    
    const config = typeMap[type] || typeMap.other;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredUploads = uploads.filter(upload => {
    const matchesSearch = upload.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upload.uploader_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || upload.status === statusFilter;
    const matchesType = typeFilter === 'all' || upload.upload_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
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
          <h3 className="text-lg font-semibold">User Uploads Manager</h3>
          <p className="text-sm text-muted-foreground">
            {uploads.filter(u => u.status === 'pending').length} pending moderation
          </p>
        </div>
        
        {selectedUploads.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedUploads.length} selected
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => bulkModerate('approve')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => bulkModerate('reject')}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => bulkModerate('delete')}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search uploads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="profile_avatar">Avatars</SelectItem>
            <SelectItem value="comment_image">Comments</SelectItem>
            <SelectItem value="custom_cover">Covers</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredUploads.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No user uploads found</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? "Try adjusting your search" : "No uploads have been submitted yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedUploads.length === filteredUploads.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUploads(filteredUploads.map(u => u.id));
                      } else {
                        setSelectedUploads([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>File</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUploads.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedUploads.includes(upload.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUploads(prev => [...prev, upload.id]);
                        } else {
                          setSelectedUploads(prev => prev.filter(id => id !== upload.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{upload.filename}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {upload.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(upload.upload_type)}</TableCell>
                  <TableCell>
                    {getStatusBadge(upload.status)}
                    {upload.moderation_notes && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-muted-foreground">Has notes</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{upload.uploader_email}</p>
                      <p className="text-muted-foreground">ID: {upload.uploader_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{format(new Date(upload.upload_date), 'MMM d, yyyy')}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatFileSize(upload.file_size)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedUpload(upload)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Upload Details</DialogTitle>
                            <DialogDescription>
                              Review and moderate this user upload
                            </DialogDescription>
                          </DialogHeader>
                          {selectedUpload && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Filename</p>
                                  <p className="text-sm text-muted-foreground">{selectedUpload.filename}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">File Size</p>
                                  <p className="text-sm text-muted-foreground">{formatFileSize(selectedUpload.file_size)}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Upload Type</p>
                                  <p className="text-sm text-muted-foreground">{selectedUpload.upload_type}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Status</p>
                                  <p className="text-sm text-muted-foreground">{selectedUpload.status}</p>
                                </div>
                              </div>
                              
                              {selectedUpload.moderation_notes && (
                                <div>
                                  <p className="text-sm font-medium mb-2">Moderation Notes</p>
                                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                    {selectedUpload.moderation_notes}
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex justify-end gap-2">
                                {selectedUpload.status === 'pending' && (
                                  <>
                                    <Button 
                                      variant="outline"
                                      onClick={() => moderateUpload(selectedUpload.id, 'reject', 'Rejected during review')}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                    <Button 
                                      onClick={() => moderateUpload(selectedUpload.id, 'approve')}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
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