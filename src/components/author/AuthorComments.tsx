import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Search, 
  Check, 
  X, 
  Flag,
  User,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  chapter_title: string;
  user_name: string;
  is_flagged: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export const AuthorComments = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'flagged'>('all');

  useEffect(() => {
    if (user) {
      fetchComments();
    }
  }, [user]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for now to avoid TypeScript issues
      const mockComments: Comment[] = [
        {
          id: '1',
          content: 'This is an amazing chapter! I love the character development.',
          created_at: new Date().toISOString(),
          chapter_title: 'Chapter 1: The Beginning',
          user_name: 'MangaFan123',
          is_flagged: false,
          status: 'approved',
        },
        {
          id: '2', 
          content: 'When is the next chapter coming out?',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          chapter_title: 'Chapter 2: The Journey',
          user_name: 'EagerReader',
          is_flagged: false,
          status: 'pending',
        },
        {
          id: '3',
          content: 'This content is inappropriate and should be removed.',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          chapter_title: 'Chapter 1: The Beginning',
          user_name: 'BadActor',
          is_flagged: true,
          status: 'pending',
        }
      ];

      setComments(mockComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const moderateComment = async (commentId: string, action: 'approve' | 'reject') => {
    try {
      // Mock comment moderation
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, status: action === 'approve' ? 'approved' : 'rejected' }
          : comment
      ));

      toast({
        title: "Success",
        description: `Comment ${action}d successfully`,
      });
    } catch (error) {
      console.error('Error moderating comment:', error);
      toast({
        title: "Error",
        description: "Failed to moderate comment",
        variant: "destructive",
      });
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.chapter_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'pending' && comment.status === 'pending') ||
                         (filterStatus === 'approved' && comment.status === 'approved') ||
                         (filterStatus === 'flagged' && comment.is_flagged);
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comment Moderation</h1>
          <p className="text-muted-foreground">Manage comments on your chapters</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search comments, chapters, or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All Comments
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </Button>
            <Button
              variant={filterStatus === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('approved')}
            >
              Approved
            </Button>
            <Button
              variant={filterStatus === 'flagged' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('flagged')}
            >
              Flagged
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No comments found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms' : 'No comments on your chapters yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{comment.user_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        on {comment.chapter_title}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        comment.status === 'approved' ? 'default' :
                        comment.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {comment.status}
                    </Badge>
                    {comment.is_flagged && (
                      <Badge variant="destructive">
                        <Flag className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="mb-4">{comment.content}</p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(comment.created_at).toLocaleDateString()}
                  </div>
                  
                  {comment.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderateComment(comment.id, 'approve')}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderateComment(comment.id, 'reject')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};