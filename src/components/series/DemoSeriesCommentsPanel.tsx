import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  addDemoSeriesComment,
  getDemoSeriesComments,
} from '@/features/demo/data/demoSeriesComments';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle } from 'lucide-react';

interface DemoSeriesCommentsPanelProps {
  seriesId: string;
  seriesTitle: string;
}

export function DemoSeriesCommentsPanel({ seriesId, seriesTitle }: DemoSeriesCommentsPanelProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState(() => getDemoSeriesComments(seriesId));
  const [content, setContent] = useState('');

  const submit = () => {
    if (!content.trim()) return;
    const comment = addDemoSeriesComment(seriesId, 'You', content);
    setComments((prev) => [comment, ...prev]);
    setContent('');
    toast({
      title: 'Comment posted',
      description: `Added to ${seriesTitle} (session only).`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/25 bg-card/50 p-4">
        <label htmlFor="series-comment" className="mb-2 flex items-center gap-2 text-sm font-medium">
          <MessageCircle className="h-4 w-4" />
          Join the discussion
        </label>
        <Textarea
          id="series-comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts (demo session only)…"
          rows={3}
        />
        <Button className="mt-3 min-h-11" onClick={submit}>
          Post comment
        </Button>
      </div>

      <div className="space-y-3">
        {comments.map((comment) => (
          <article
            key={comment.id}
            className="rounded-xl border border-border/20 bg-card/60 p-4 backdrop-blur-sm"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{comment.author}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{comment.content}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3" />
              {comment.like_count}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
