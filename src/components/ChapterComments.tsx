import { useState, useEffect } from 'react';
import { formatTimeAgo } from '@/utils/dateFormatting';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AuthModal from './AuthModal';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
}

interface ChapterCommentsProps {
  chapterId: string;
  onCommentPosted?: () => void;
}

const ChapterComments = ({ chapterId, onCommentPosted }: ChapterCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingComment, setPendingComment] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [chapterId]);

  // Set up real-time comments
  useEffect(() => {
    const channel = supabase
      .channel('chapter-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `chapter_id=eq.${chapterId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chapterId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('chapter_id', chapterId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: "Error",
          description: "Failed to load comments.",
          variant: "destructive",
        });
        return;
      }

      // Get user profiles separately
      const userIds = commentsData?.map(c => c.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, email')
        .in('user_id', userIds);

      const formattedComments: Comment[] = commentsData?.map(comment => {
        const profile = profiles?.find(p => p.user_id === comment.user_id);
        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user_id: comment.user_id,
          username: profile?.username || profile?.email?.split('@')[0] || 'Anonymous',
        };
      }) || [];

      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // If user is not logged in, store comment and show auth modal
    if (!user) {
      setPendingComment(newComment.trim());
      setShowAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          user_id: user.id,
          chapter_id: chapterId,
        });

      if (error) {
        throw error;
      }

      setNewComment('');
      await fetchComments(); // Refresh comments
      onCommentPosted?.();
      
      toast({
        title: "Success",
        description: "Comment posted successfully!",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    setPendingComment('');
  };

  // Post pending comment after user logs in
  useEffect(() => {
    if (user && pendingComment) {
      setNewComment(pendingComment);
      setPendingComment('');
      // Auto-submit the comment
      setTimeout(async () => {
        setIsSubmitting(true);
        try {
          const { error } = await supabase
            .from('comments')
            .insert({
              content: pendingComment,
              user_id: user.id,
              chapter_id: chapterId,
            });

          if (!error) {
            setNewComment('');
            await fetchComments();
            onCommentPosted?.();
            toast({
              title: "Success",
              description: "Comment posted successfully!",
            });
          }
        } catch (error) {
          console.error('Error posting pending comment:', error);
        } finally {
          setIsSubmitting(false);
        }
      }, 100);
    }
  }, [user, pendingComment, chapterId, onCommentPosted, toast]);

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        throw error;
      }

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      toast({
        title: "Success",
        description: "Comment deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-manga-red" />
          <h2 className="text-xl font-semibold">Comments ({comments.length})</h2>
        </div>

        {/* Comment Input - Always visible */}
        <Card className="p-4 mb-6 bg-gradient-card border-border/50 transition-all duration-200 hover:shadow-lg">
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder={user ? "Share your thoughts about this chapter..." : "Share your thoughts... (Sign in required to post)"}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none transition-all duration-200 focus:ring-2 focus:ring-manga-red/20"
              maxLength={500}
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {newComment.length}/500 characters
              </span>
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="bg-gradient-accent hover:opacity-90 transition-all duration-200 hover:scale-105 w-full sm:w-auto"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Posting...' : user ? 'Post Comment' : 'Sign in to Post'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Comments List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8 animate-pulse">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            comments.map((comment, index) => (
              <div 
                key={comment.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="p-4 bg-gradient-card border-border/50 transition-all duration-200 hover:shadow-md hover:border-border/70">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-manga-red">
                        {comment.username}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    {user?.id === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors duration-200 ml-2 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </Card>
                {index < comments.length - 1 && (
                  <Separator className="my-3 opacity-50" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthModalClose}
      />
    </>
  );
};

export default ChapterComments;