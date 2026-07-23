import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  addDemoSeriesComment,
  addDemoSeriesCommentReply,
  getDemoSeriesComments,
  sortDemoSeriesComments,
  toggleDemoCommentReaction,
  type DemoCommentSort,
  type DemoSeriesComment,
} from '@/features/demo/data/demoSeriesComments';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChapterListVariant } from '@/features/series/seriesChapterTypes';

interface DemoSeriesCommentsPanelProps {
  seriesId: string;
  seriesTitle: string;
  /** Adapts presentation to match the active series-details layout identity. */
  variant?: ChapterListVariant;
}

const PANEL_STYLES: Record<ChapterListVariant, string> = {
  editorial: 'divide-y divide-border/15 rounded-none border-0 border-t border-border/20 bg-transparent p-0',
  cinematic: 'rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md sm:p-6',
  catalogue: 'rounded-md border border-border/20 bg-card/50 p-3',
  compact: 'rounded-md border border-border/10 bg-transparent p-2',
};

const COMMENT_CARD_STYLES: Record<ChapterListVariant, string> = {
  editorial: 'border-0 border-b border-border/15 bg-transparent px-0 py-3 last:border-b-0 rounded-none backdrop-blur-none',
  cinematic: 'rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm',
  catalogue: 'rounded-md border border-border/15 bg-card/60 p-3',
  compact: 'rounded-none border-0 border-b border-border/10 bg-transparent p-2 py-1.5 last:border-b-0',
};

export function DemoSeriesCommentsPanel({
  seriesId,
  seriesTitle,
  variant = 'catalogue',
}: DemoSeriesCommentsPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<DemoSeriesComment[]>([]);
  const [sort, setSort] = useState<DemoCommentSort>('newest');
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const loadComments = useCallback(() => {
    try {
      setError(null);
      const data = getDemoSeriesComments(seriesId);
      setComments(sortDemoSeriesComments(data, sort));
    } catch {
      setError('Could not load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [seriesId, sort]);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(loadComments, 120);
    return () => window.clearTimeout(timer);
  }, [loadComments]);

  const submit = () => {
    if (!content.trim()) return;
    const comment = addDemoSeriesComment(seriesId, 'You', content);
    setComments((prev) => sortDemoSeriesComments([comment, ...prev], sort));
    setContent('');
    toast({
      title: 'Comment posted',
      description: `Added to ${seriesTitle} (session only).`,
    });
  };

  const submitReply = (commentId: string) => {
    if (!replyContent.trim()) return;
    const reply = addDemoSeriesCommentReply(commentId, 'You', replyContent);
    if (reply) {
      loadComments();
      setReplyTo(null);
      setReplyContent('');
      toast({ title: 'Reply posted', description: 'Session only.' });
    }
  };

  const react = (targetId: string) => {
    toggleDemoCommentReaction(targetId);
    loadComments();
  };

  const sorted = sortDemoSeriesComments(comments, sort);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="comments-section-heading" className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <MessageCircle className="h-5 w-5" />
          Comments
          <span className="text-base font-normal text-muted-foreground">({sorted.length})</span>
        </h2>
        <div className="flex gap-2" role="group" aria-label="Sort comments">
          {(['newest', 'top'] as const).map((mode) => (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant={sort === mode ? 'default' : 'outline'}
              className="min-h-9 capitalize"
              onClick={() => setSort(mode)}
            >
              {mode === 'newest' ? 'Newest' : 'Top'}
            </Button>
          ))}
        </div>
      </div>

      <div className={PANEL_STYLES[variant]}>
        <label htmlFor="series-comment" className="mb-2 flex items-center gap-2 text-sm font-medium">
          Join the discussion
        </label>
        <Textarea
          id="series-comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts (demo session only)…"
          rows={variant === 'compact' ? 2 : 3}
          className={variant === 'cinematic' ? 'bg-black/30' : undefined}
        />
        <Button size={variant === 'compact' ? 'sm' : 'default'} className="mt-2.5 h-9 w-auto px-4" onClick={submit} disabled={!content.trim()}>
          Post comment
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading comments…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm" role="alert">
          {error}
          <Button variant="outline" size="sm" className="mt-2 min-h-9" onClick={loadComments}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && sorted.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No comments yet — be the first to share your thoughts.
        </p>
      )}

      <div className={cn(variant === 'editorial' || variant === 'compact' ? '' : 'space-y-3')}>
        {!loading &&
          !error &&
          sorted.map((comment) => (
            <article key={comment.id} className={COMMENT_CARD_STYLES[variant]}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 px-2 text-xs"
                  onClick={() => react(comment.id)}
                  aria-label={`Like comment by ${comment.author}`}
                >
                  <Heart className="h-3 w-3" />
                  {comment.like_count}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                >
                  Reply
                </Button>
              </div>

              {comment.replies && comment.replies.length > 0 && (
                <ul className="mt-3 space-y-2 border-l-2 border-border/30 pl-3">
                  {comment.replies.map((reply) => (
                    <li key={reply.id} className="text-sm">
                      <span className="font-medium">{reply.author}</span>
                      <span className="mx-1 text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{reply.content}</span>
                      <button
                        type="button"
                        className={cn(
                          'ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground'
                        )}
                        onClick={() => react(reply.id)}
                      >
                        <Heart className="h-3 w-3" />
                        {reply.like_count}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {replyTo === comment.id && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply…"
                    rows={2}
                    aria-label={`Reply to ${comment.author}`}
                  />
                  <Button
                    size="sm"
                    className="min-h-9"
                    onClick={() => submitReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    Post reply
                  </Button>
                </div>
              )}
            </article>
          ))}
      </div>
    </div>
  );
}
