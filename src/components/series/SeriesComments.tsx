import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Flag, 
  Pin, 
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  series_id: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  like_count: number;
  is_pinned: boolean;
  is_flagged: boolean;
  status: string;
  user_profile?: {
    username: string;
    email: string;
    role: string;
  };
  replies?: Comment[];
  user_has_liked?: boolean;
}

interface SeriesCommentsProps {
  seriesId: string;
  seriesTitle: string;
}

export const SeriesComments: React.FC<SeriesCommentsProps> = ({ seriesId, seriesTitle }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    getCurrentUser();
  }, [seriesId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      // Fetch top-level comments 
      const { data: commentsData, error } = await supabase
        .from('series_comments')
        .select('*')
        .eq('series_id', seriesId)
        .is('parent_id', null)
        .eq('status', 'active')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get all user IDs to fetch profiles
      const userIds = (commentsData || []).map(c => c.user_id);
      
      // Fetch user profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, email, role')
        .in('user_id', userIds);

      // Create a profiles map for quick lookup
      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Fetch replies and build final comments structure
      const commentsWithReplies = await Promise.all(
        (commentsData || []).map(async (comment) => {
          // Fetch replies
          const { data: repliesData } = await supabase
            .from('series_comments')
            .select('*')
            .eq('parent_id', comment.id)
            .eq('status', 'active')
            .order('created_at', { ascending: true });

          // Get reply user profiles
          const replyUserIds = (repliesData || []).map(r => r.user_id);
          if (replyUserIds.length > 0) {
            const { data: replyProfilesData } = await supabase
              .from('profiles')
              .select('user_id, username, email, role')
              .in('user_id', replyUserIds);

            (replyProfilesData || []).forEach(profile => {
              profilesMap[profile.user_id] = profile;
            });
          }

          // Check if user has liked this comment
          let userHasLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from('series_comment_likes')
              .select('id')
              .eq('comment_id', comment.id)
              .eq('user_id', user.id)
              .single();
            
            userHasLiked = !!likeData;
          }

          return {
            ...comment,
            user_profile: profilesMap[comment.user_id] || {
              username: null,
              email: 'unknown@example.com',
              role: 'member'
            },
            replies: (repliesData || []).map(reply => ({
              ...reply,
              user_profile: profilesMap[reply.user_id] || {
                username: null,
                email: 'unknown@example.com',
                role: 'member'
              }
            })),
            user_has_liked: userHasLiked
          };
        })
      );

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) {
      toast({
        title: "Error",
        description: "Please sign in to comment",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('series_comments')
        .insert({
          content: newComment.trim(),
          user_id: user.id,
          series_id: seriesId
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      
      toast({
        title: "Success",
        description: "Comment posted successfully"
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || !user) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('series_comments')
        .insert({
          content: replyText.trim(),
          user_id: user.id,
          series_id: seriesId,
          parent_id: parentId
        });

      if (error) throw error;

      setReplyText('');
      setReplyingTo(null);
      await fetchComments();
      
      toast({
        title: "Success",
        description: "Reply posted successfully"
      });
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to like comments",
        variant: "destructive"
      });
      return;
    }

    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      if (comment.user_has_liked) {
        // Unlike
        const { error } = await supabase
          .from('series_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('series_comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
        
        if (error) throw error;
      }

      await fetchComments();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`space-y-3 ${isReply ? 'ml-8 border-l-2 border-border pl-4' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://avatar.vercel.sh/${comment.user_profile?.username || comment.user_profile?.email}`} />
          <AvatarFallback>
            {comment.user_profile?.username?.[0] || comment.user_profile?.email?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">
              {comment.user_profile?.username || comment.user_profile?.email?.split('@')[0] || 'Anonymous'}
            </span>
            {comment.user_profile?.role === 'admin' && (
              <Badge variant="destructive" className="text-xs">Admin</Badge>
            )}
            {comment.is_pinned && (
              <Badge variant="secondary" className="text-xs">
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-sm leading-relaxed">{comment.content}</p>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeComment(comment.id)}
              className={`h-6 px-2 ${comment.user_has_liked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-3 w-3 mr-1 ${comment.user_has_liked ? 'fill-current' : ''}`} />
              {comment.like_count}
            </Button>
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="h-6 px-2"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Flag className="h-3 w-3" />
            </Button>
          </div>
          
          {replyingTo === comment.id && (
            <div className="space-y-2 mt-3">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px] resize-none"
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyText.trim() || submitting}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Discussion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-12 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        {user ? (
          <div className="space-y-3">
            <Textarea
              placeholder={`Share your thoughts about ${seriesTitle}...`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
              >
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </div>
        ) : (
          <Card className="p-4 text-center">
            <p className="text-muted-foreground">Please sign in to join the discussion</p>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>
      </CardContent>
    </Card>
  );
};