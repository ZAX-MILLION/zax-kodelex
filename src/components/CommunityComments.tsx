import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Star,
  Flame,
  Crown,
  Send
} from 'lucide-react';

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
    level: number;
    badges: string[];
  };
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  isLiked: boolean;
  isPopular: boolean;
}

const CommunityComments = () => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: {
        name: 'MangaLord_47',
        avatar: '🦸',
        level: 15,
        badges: ['VIP', 'Early Reader']
      },
      content: 'This chapter was absolutely incredible! The character development and plot twists keep getting better. Can\'t wait for the next release! 🔥',
      timestamp: '2 hours ago',
      likes: 127,
      replies: 8,
      isLiked: false,
      isPopular: true
    },
    {
      id: '2',
      user: {
        name: 'AnimeGirl_2024',
        avatar: '🌸',
        level: 8,
        badges: ['Active Reader']
      },
      content: 'The artwork in this series is just stunning. Every panel feels like a masterpiece. Really loving the eye-friendly design of this reader too!',
      timestamp: '4 hours ago',
      likes: 89,
      replies: 5,
      isLiked: true,
      isPopular: false
    },
    {
      id: '3',
      user: {
        name: 'CrimsonBlade_Fan',
        avatar: '⚔️',
        level: 22,
        badges: ['Veteran', 'Top Contributor', 'VIP']
      },
      content: 'Been following this series from the beginning and it just keeps delivering! The pacing is perfect and the character interactions feel so genuine.',
      timestamp: '6 hours ago',
      likes: 156,
      replies: 12,
      isLiked: false,
      isPopular: true
    },
    {
      id: '4',
      user: {
        name: 'NightReader_99',
        avatar: '🌙',
        level: 12,
        badges: ['Night Owl', 'Speed Reader']
      },
      content: 'Love how this platform makes late-night reading so comfortable for the eyes. Finally a manga reader that cares about user experience!',
      timestamp: '8 hours ago',
      likes: 73,
      replies: 3,
      isLiked: true,
      isPopular: false
    },
    {
      id: '5',
      user: {
        name: 'DragonLegacy_Master',
        avatar: '🐉',
        level: 18,
        badges: ['Legend', 'Theory Crafter']
      },
      content: 'I have a theory about what\'s going to happen next... without spoilers, I think we\'re in for some major revelations in the upcoming chapters!',
      timestamp: '12 hours ago',
      likes: 94,
      replies: 15,
      isLiked: false,
      isPopular: false
    }
  ]);

  const handleLike = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim() || !user) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: user.email?.split('@')[0] || 'Reader',
        avatar: '👤',
        level: 1,
        badges: ['New Reader']
      },
      content: newComment,
      timestamp: 'just now',
      likes: 0,
      replies: 0,
      isLiked: false,
      isPopular: false
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  return (
    <Card className="bg-card/20 border-border/30 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Community Discussion</h3>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {comments.length} Comments
          </Badge>
        </div>

        {/* Comment Input */}
        {user ? (
          <div className="mb-8 p-4 bg-background/30 rounded-2xl border border-border/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-manga-gold flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Share your thoughts about this manga..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-background/50 border-border/50 focus:bg-background/70 rounded-xl resize-none"
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Be respectful and constructive in your comments
                  </div>
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    size="sm"
                    className="bg-gradient-to-r from-primary to-manga-gold hover:from-primary/90 hover:to-manga-gold/90 rounded-xl"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-muted/20 rounded-2xl border border-border/20 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Join the conversation! Sign in to share your thoughts.</p>
            <Button variant="outline" className="bg-background/50 border-border/50 hover:bg-background/70 rounded-xl">
              Sign In to Comment
            </Button>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              className={`relative p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg ${
                comment.isPopular 
                  ? 'bg-gradient-to-r from-manga-gold/5 to-primary/5 border-manga-gold/20' 
                  : 'bg-background/20 border-border/30 hover:bg-background/30'
              }`}
            >
              {comment.isPopular && (
                <div className="absolute -top-2 left-4">
                  <Badge className="bg-manga-gold/90 text-black border-0 px-3 py-1 text-xs font-medium">
                    <Flame className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-manga-red/20 flex items-center justify-center text-2xl border border-border/30">
                    {comment.user.avatar}
                  </div>
                </div>

                {/* Comment Content */}
                <div className="flex-1 space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-bold text-foreground">{comment.user.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                        Lv.{comment.user.level}
                      </Badge>
                      {comment.user.badges.map((badge, index) => (
                        <Badge 
                          key={badge} 
                          variant="secondary" 
                          className={`text-xs ${
                            badge === 'VIP' ? 'bg-manga-gold/20 text-manga-gold border-manga-gold/30' :
                            badge === 'Veteran' || badge === 'Legend' ? 'bg-manga-red/20 text-manga-red border-manga-red/30' :
                            'bg-manga-blue/20 text-manga-blue border-manga-blue/30'
                          }`}
                        >
                          {badge === 'VIP' && <Crown className="h-3 w-3 mr-1" />}
                          {badge === 'Legend' && <Star className="h-3 w-3 mr-1" />}
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-foreground/90 leading-relaxed">{comment.content}</p>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-4 pt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleLike(comment.id)}
                      className={`h-8 px-3 rounded-xl transition-all duration-200 ${
                        comment.isLiked 
                          ? 'text-manga-red bg-manga-red/10 hover:bg-manga-red/20' 
                          : 'text-muted-foreground hover:text-manga-red hover:bg-manga-red/10'
                      }`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${comment.isLiked ? 'fill-current' : ''}`} />
                      {comment.likes}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 px-3 rounded-xl text-muted-foreground hover:text-manga-blue hover:bg-manga-blue/10"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {comment.replies}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 px-3 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 ml-auto"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline" className="bg-card/30 border-border/50 hover:bg-card/50 rounded-xl">
            Load More Comments
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CommunityComments;