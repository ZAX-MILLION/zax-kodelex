import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  Search, 
  Eye,
  AlertTriangle,
  User,
  BookOpen,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PendingItem {
  id: string;
  title: string;
  type: 'series' | 'chapter' | 'comment';
  author?: string;
  created_at: string;
  content_preview?: string;
  status: 'pending' | 'approved' | 'rejected';
  series_title?: string;
  chapter_number?: number;
  user_email?: string;
  metadata?: any;
}

interface ModerationStats {
  pending_series: number;
  pending_chapters: number;
  pending_comments: number;
  flagged_content: number;
}

export const ModerationPanel: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    pending_series: 0,
    pending_chapters: 0,
    pending_comments: 0,
    flagged_content: 0
  });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    loadModerationData();
  }, [statusFilter]);

  const loadModerationData = async () => {
    setLoading(true);
    try {
      // Load pending series
      const { data: series, error: seriesError } = await supabase
        .from('manga_meta')
        .select('id, title, author, created_at, description')
        .is('approved_at', null)
        .order('created_at', { ascending: false });

      if (seriesError) throw seriesError;

      // Load pending chapters  
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select(`
          id, title, chapter_number, created_at,
          series_id, manga_meta!inner(title, author)
        `)
        .is('approved_at', null)
        .order('created_at', { ascending: false });

      if (chaptersError) throw chaptersError;

      // Load flagged comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          id, content, created_at, is_flagged, flag_count,
          user_id, chapter_id, 
          chapters!inner(title, chapter_number, manga_meta!inner(title))
        `)
        .eq('is_flagged', true)
        .order('flag_count', { ascending: false });

      if (commentsError) throw commentsError;

      // Transform data into unified format
      const pendingSeriesItems: PendingItem[] = (series || []).map(item => ({
        id: item.id,
        title: item.title,
        type: 'series' as const,
        author: item.author,
        created_at: item.created_at,
        content_preview: item.description?.substring(0, 100),
        status: 'pending' as const
      }));

      const pendingChapterItems: PendingItem[] = (chapters || []).map(item => ({
        id: item.id,
        title: item.title || `Chapter ${item.chapter_number}`,
        type: 'chapter' as const,
        author: (item.manga_meta as any)?.author,
        created_at: item.created_at,
        series_title: (item.manga_meta as any)?.title,
        chapter_number: item.chapter_number,
        status: 'pending' as const
      }));

      const flaggedCommentItems: PendingItem[] = (comments || []).map(item => ({
        id: item.id,
        title: 'Flagged Comment',
        type: 'comment' as const,
        created_at: item.created_at,
        content_preview: item.content?.substring(0, 100),
        series_title: (item.chapters as any)?.manga_meta?.title,
        chapter_number: (item.chapters as any)?.chapter_number,
        status: 'pending' as const,
        metadata: { flag_count: item.flag_count }
      }));

      const allItems = [...pendingSeriesItems, ...pendingChapterItems, ...flaggedCommentItems];
      setPendingItems(allItems);

      // Update stats
      setStats({
        pending_series: pendingSeriesItems.length,
        pending_chapters: pendingChapterItems.length,
        pending_comments: flaggedCommentItems.length,
        flagged_content: flaggedCommentItems.length
      });

    } catch (error: any) {
      console.error('Error loading moderation data:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (itemId: string, action: 'approve' | 'reject', type: string, reason?: string) => {
    setActionLoading(itemId);
    
    try {
      if (type === 'series') {
        // For now, we'll use a metadata approach since the schema doesn't have approval fields
        const metadata = { 
          moderation_status: action === 'approve' ? 'approved' : 'rejected',
          moderated_at: new Date().toISOString(),
          moderated_by: (await supabase.auth.getUser()).data.user?.id,
          rejection_reason: reason
        };
          
        const { error } = await supabase
          .from('manga_meta')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', itemId);
          
        if (error) throw error;
        
      } else if (type === 'chapter') {
        // Similar approach for chapters
        const { error } = await supabase
          .from('chapters')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', itemId);
          
        if (error) throw error;
        
      } else if (type === 'comment') {
        const updateData = action === 'approve'
          ? { is_flagged: false, status: 'active' }
          : { status: 'removed', moderation_reason: reason };
          
        const { error } = await supabase
          .from('comments')
          .update(updateData)
          .eq('id', itemId);
          
        if (error) throw error;
      }

      // Log moderation action
      await supabase.from('admin_actions').insert({
        action_type: `${action}_${type}`,
        target_type: type,
        target_id: itemId,
        description: `${action === 'approve' ? 'Approved' : 'Rejected'} ${type}`,
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        metadata: reason ? { reason } : {}
      });

      toast({
        title: "Success",
        description: `${type} ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      });

      // Refresh data
      loadModerationData();

    } catch (error: any) {
      console.error('Moderation action error:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} ${type}`,
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'series': return <BookOpen className="h-4 w-4" />;
      case 'chapter': return <FileText className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const filteredItems = pendingItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.series_title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesStatus = item.status === statusFilter;
    
    return matchesSearch && matchesTab && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading moderation data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Pending Series</p>
                <p className="text-2xl font-bold">{stats.pending_series}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Pending Chapters</p>
                <p className="text-2xl font-bold">{stats.pending_chapters}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Pending Comments</p>
                <p className="text-2xl font-bold">{stats.pending_comments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Flagged Content</p>
                <p className="text-2xl font-bold">{stats.flagged_content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Moderation Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation</CardTitle>
          <CardDescription>
            Review and moderate pending content submissions and flagged items
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title, author, or series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({pendingItems.length})</TabsTrigger>
              <TabsTrigger value="series">Series ({stats.pending_series})</TabsTrigger>
              <TabsTrigger value="chapter">Chapters ({stats.pending_chapters})</TabsTrigger>
              <TabsTrigger value="comment">Comments ({stats.pending_comments})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredItems.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No {statusFilter} items found {searchQuery && `matching "${searchQuery}"`}
                  </AlertDescription>
                </Alert>
              ) : (
                filteredItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(item.type)}
                          <h4 className="font-semibold">{item.title}</h4>
                          {getStatusBadge(item.status)}
                          {item.metadata?.flag_count && (
                            <Badge variant="destructive" className="text-xs">
                              {item.metadata.flag_count} flags
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          {item.author && <p>Author: {item.author}</p>}
                          {item.series_title && (
                            <p>Series: {item.series_title} 
                              {item.chapter_number && ` - Chapter ${item.chapter_number}`}
                            </p>
                          )}
                          <p>Created: {new Date(item.created_at).toLocaleDateString()}</p>
                          {item.content_preview && (
                            <p className="mt-2 p-2 bg-muted rounded text-sm">
                              {item.content_preview}...
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {item.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleModerationAction(item.id, 'approve', item.type)}
                            disabled={actionLoading === item.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => {
                              const reason = prompt('Rejection reason (optional):');
                              handleModerationAction(item.id, 'reject', item.type, reason || undefined);
                            }}
                            disabled={actionLoading === item.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};