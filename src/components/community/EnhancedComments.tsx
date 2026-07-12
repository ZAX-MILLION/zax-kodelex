import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Heart, 
  Reply, 
  Edit, 
  Trash2, 
  Flag, 
  Pin,
  User,
  Calendar,
  MoreVertical,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReportModal } from './ReportModal';

interface Comment {
  id: string;
  content: string;
  markdown_content?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  chapter_id: string;
  parent_id?: string;
  is_edited: boolean;
  edit_deadline?: string;
  like_count: number;
  is_pinned: boolean;
  is_flagged: boolean;
  status: 'active' | 'hidden' | 'deleted' | 'pending_review';
  user_profile?: {
    username?: string;
    role: string;
  };
  user_liked?: boolean;
  replies?: Comment[];
}

interface EnhancedCommentsProps {
  chapterId: string;
}

export const EnhancedComments = ({ chapterId }: EnhancedCommentsProps) => {
  const { user, userProfile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: string; id: string } | null>(null);

  useEffect(() => {
    fetchComments();
  }, [chapterId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      
      // Fetch comments with user profiles
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (username, role)
        `)
        .eq('chapter_id', chapterId)
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Check which comments the user has liked
      let userLikes: string[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id);
        
        userLikes = likesData?.map(like => like.comment_id) || [];
      }

      // Organize comments into threaded structure
      const commentsWithLikes = data?.map(comment => ({
        ...comment,
        user_profile: comment.profiles,
        user_liked: userLikes.includes(comment.id),
      })) || [];

      const threaded = organizeThreadedComments(commentsWithLikes);
      setComments(threaded);
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

  const organizeThreadedComments = (comments: any[]): Comment[] => {
    const commentMap = new Map();
    const rootComments: Comment[] = [];

    // First pass: create map and identify root comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
      if (!comment.parent_id) {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    // Second pass: organize replies
    comments.forEach(comment => {
      if (comment.parent_id && commentMap.has(comment.parent_id)) {
        commentMap.get(comment.parent_id).replies.push(commentMap.get(comment.id));
      }
    });

    return rootComments.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  };

  const handleSubmitComment = async (parentId?: string) => {
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment,
          markdown_content: newComment, // For now, same as content
          user_id: user.id,
          chapter_id: chapterId,
          parent_id: parentId || null,
        });

      if (error) throw error;

      setNewComment('');
      setReplyingTo(null);
      fetchComments();

      toast({
        title: "Success",
        description: "Comment posted successfully",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            user_id: user.id,
            comment_id: commentId,
          });

        if (error) throw error;
      }

      fetchComments();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({
          content: editContent,
          markdown_content: editContent,
          is_edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId);

      if (error) throw error;

      setEditingComment(null);
      setEditContent('');
      fetchComments();

      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    } catch (error) {
      console.error('Error editing comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'deleted', content: '[deleted]' })
        .eq('id', commentId);

      if (error) throw error;

      fetchComments();
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const canEditComment = (comment: Comment) => {
    if (!user || comment.user_id !== user.id) return false;
    if (comment.edit_deadline) {
      return new Date() < new Date(comment.edit_deadline);
    }
    return false;
  };

  const openReportModal = (type: string, id: string) => {
    setReportTarget({ type, id });
    setReportModalOpen(true);
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const isAuthor = comment.user_profile?.role === 'author';
    const isAdmin = comment.user_profile?.role === 'admin';
    const isModerator = comment.user_profile?.role === 'moderator';
    const isOwn = user?.id === comment.user_id;

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
        <Card className={`mb-4 ${comment.is_pinned ? 'border-primary' : ''} ${comment.is_flagged ? 'border-orange-500' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {comment.user_profile?.username || 'Anonymous'}
                    </span>
                    {isAdmin && (
                      <Badge variant="destructive" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {isModerator && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Mod
                      </Badge>
                    )}
                    {isAuthor && (
                      <Badge variant="default" className="text-xs">
                        Author
                      </Badge>
                    )}
                    {comment.is_pinned && (
                      <Badge variant="outline" className="text-xs">
                        <Pin className="h-3 w-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(comment.created_at).toLocaleDateString()}
                    {comment.is_edited && <span>(edited)</span>}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEditComment(comment) && (
                    <DropdownMenuItem 
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {isOwn && (
                    <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                  {!isOwn && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => openReportModal('comment', comment.id)}
                        className="text-red-600"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Edit your comment..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleEditComment(comment.id)}
                    disabled={!editContent.trim()}
                  >
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-3 whitespace-pre-wrap">{comment.content}</p>
                
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeComment(comment.id, comment.user_liked || false)}
                    className={comment.user_liked ? 'text-red-500' : ''}
                    disabled={!user}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${comment.user_liked ? 'fill-current' : ''}`} />
                    {comment.like_count}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    disabled={!user}
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                </div>
              </>
            )}

            {replyingTo === comment.id && (
              <div className="mt-4 space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleSubmitComment(comment.id)}
                    disabled={!newComment.trim()}
                  >
                    Post Reply
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setReplyingTo(null);
                      setNewComment('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-4">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this chapter..."
                rows={3}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Markdown supported
                </span>
                <Button 
                  onClick={() => handleSubmitComment()}
                  disabled={!newComment.trim()}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Please log in to post comments
            </p>
          )}
        </CardContent>
      </Card>

      {comments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your thoughts about this chapter!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment))}
        </div>
      )}

      {reportModalOpen && reportTarget && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setReportTarget(null);
          }}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
        />
      )}
    </div>
  );
};