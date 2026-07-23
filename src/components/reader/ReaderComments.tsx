import { useId, useState } from 'react';
import { MessageCircle, Pin, ThumbsUp, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useDemoChapterComments } from '@/features/demo/useDemoChapterComments';
import { appConfig } from '@/config/env';
import { isRealAuthEnabled } from '@/features/demo/demoAuthPolicy';

interface ReaderCommentsProps {
  chapterKey: string;
  chapterId?: string;
  /** inline = end-of-chapter block; drawer = compact panel body */
  variant?: 'inline' | 'drawer';
  onRequestClose?: () => void;
  onJumpToInline?: () => void;
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export function ReaderComments({
  chapterKey,
  variant = 'inline',
  onRequestClose,
  onJumpToInline,
}: ReaderCommentsProps) {
  const headingId = useId();
  const {
    enabled,
    roots,
    repliesOf,
    sort,
    setSort,
    count,
    addComment,
    toggleLike,
    isLiked,
  } = useDemoChapterComments(chapterKey);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const canPostDemo = enabled && (appConfig.isDemo || appConfig.features.roleLab);
  const needsRealLogin = !canPostDemo && isRealAuthEnabled();
  const isDrawer = variant === 'drawer';

  const submit = () => {
    const result = addComment(draft, replyTo);
    setStatus(result.message);
    if (result.ok) {
      setDraft('');
      setReplyTo(null);
    }
  };

  return (
    <section
      id={isDrawer ? undefined : 'reader-comments'}
      aria-labelledby={headingId}
      className={
        isDrawer
          ? 'flex min-h-0 flex-1 flex-col'
          : 'mx-auto w-full max-w-2xl px-4 py-10 border-t border-border/40'
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
        <h2 id={headingId} className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" aria-hidden />
          {count} {count === 1 ? 'Comment' : 'Comments'}
        </h2>
        <div className="flex gap-2" role="group" aria-label="Comment sort">
          <Button
            size="sm"
            variant={sort === 'top' ? 'default' : 'outline'}
            className="min-h-11"
            aria-pressed={sort === 'top'}
            onClick={() => setSort('top')}
          >
            Top
          </Button>
          <Button
            size="sm"
            variant={sort === 'newest' ? 'default' : 'outline'}
            className="min-h-11"
            aria-pressed={sort === 'newest'}
            onClick={() => setSort('newest')}
          >
            Newest
          </Button>
        </div>
      </div>

      {isDrawer && onJumpToInline && (
        <Button
          variant="link"
          className="mb-3 h-auto min-h-11 justify-start px-0 text-sm"
          onClick={() => {
            onJumpToInline();
            onRequestClose?.();
          }}
        >
          View comments below chapter
        </Button>
      )}

      <div className={isDrawer ? 'min-h-0 flex-1 overflow-y-auto pr-1' : undefined}>
      {canPostDemo ? (
        <div className="space-y-2 mb-6 rounded-xl border border-border/50 bg-card/40 p-3 sticky bottom-0 bg-background/95 backdrop-blur-sm z-[1]">
          <Label htmlFor={isDrawer ? 'reader-comment-drawer-input' : 'reader-comment-input'}>
            {replyTo ? 'Write a reply (temporary demo comment)' : 'Add a comment (temporary in demo)'}
          </Label>
          <Textarea
            id={isDrawer ? 'reader-comment-drawer-input' : 'reader-comment-input'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Share a thought about this chapter…"
            className="min-h-[88px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{draft.length}/500</span>
            <div className="flex gap-2">
              {replyTo && (
                <Button variant="ghost" className="min-h-11" onClick={() => setReplyTo(null)}>
                  Cancel reply
                </Button>
              )}
              <Button className="min-h-11" onClick={submit} disabled={draft.trim().length < 2}>
                <Send className="h-4 w-4 mr-2" />
                Post
              </Button>
            </div>
          </div>
          {status && (
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              {status}
            </p>
          )}
        </div>
      ) : needsRealLogin ? (
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to join the discussion on staging or production.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">
          Comments are available in the interactive demo or when signed in.
        </p>
      )}

      {roots.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-xl">
          No comments yet. Be the first to start the discussion.
        </p>
      ) : (
        <ul className="space-y-4 pb-4">
          {roots.map((comment) => (
            <li key={comment.id} className="rounded-xl border border-border/40 p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold"
                  aria-hidden
                >
                  {comment.author.slice(0, 1).toUpperCase()}
                </span>
                <span className="font-medium break-words">{comment.author}</span>
                {comment.pinned && (
                  <Badge variant="secondary" className="gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                )}
                {comment.temporary && <Badge variant="outline">Temporary</Badge>}
                <span className="text-xs text-muted-foreground">{formatWhen(comment.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="min-h-11"
                  aria-pressed={isLiked(comment.id)}
                  onClick={() => toggleLike(comment.id)}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {comment.likes}
                </Button>
                {canPostDemo && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => setReplyTo(comment.id)}
                  >
                    Reply
                  </Button>
                )}
              </div>
              <ul className="space-y-3 pl-4 sm:pl-6 border-l border-border/40">
                {repliesOf(comment.id).map((reply) => (
                  <li key={reply.id} className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium break-words">{reply.author}</span>
                      {reply.temporary && <Badge variant="outline">Temporary</Badge>}
                      <span className="text-xs text-muted-foreground">{formatWhen(reply.createdAt)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{reply.content}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="min-h-11"
                      aria-pressed={isLiked(reply.id)}
                      onClick={() => toggleLike(reply.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {reply.likes}
                    </Button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      </div>
    </section>
  );
}

export default ReaderComments;
