import { useState } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  addDemoSeriesReview,
  getDemoSeriesReviews,
  summarizeDemoReviews,
} from '@/features/demo/data/demoSeriesReviews';
import { formatDistanceToNow } from 'date-fns';

interface SeriesReviewsProps {
  seriesId: string;
  seriesIndex?: number;
}

export function SeriesReviews({ seriesId, seriesIndex = 0 }: SeriesReviewsProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState(() => getDemoSeriesReviews(seriesId, seriesIndex));
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const summary = summarizeDemoReviews(reviews);

  const submit = () => {
    if (!body.trim()) {
      toast({ title: 'Review required', description: 'Please write a short review.', variant: 'destructive' });
      return;
    }
    const review = addDemoSeriesReview(seriesId, {
      author: 'You',
      rating,
      title,
      body,
    });
    setReviews((prev) => [review, ...prev]);
    setTitle('');
    setBody('');
    toast({ title: 'Review posted', description: 'Saved for this browser session only.' });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/25 bg-card/70 p-4 backdrop-blur-sm sm:p-6">
        <h3 className="mb-4 text-lg font-semibold">Rating summary</h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="text-center sm:pr-6">
            <div className="text-4xl font-black text-primary">{summary.average || '—'}</div>
            <div className="flex justify-center gap-0.5 py-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`h-4 w-4 ${n <= Math.round(summary.average) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{summary.count} reviews</p>
          </div>
          <div className="flex-1 space-y-1">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = summary.distribution[star];
              const pct = summary.count ? Math.round((count / summary.count) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{star}</span>
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/50">
                    <div className="h-full bg-yellow-500/80" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/25 bg-card/70 p-4 backdrop-blur-sm sm:p-6">
        <h3 className="mb-3 text-lg font-semibold">Write a review</h3>
        <p className="mb-4 text-xs text-muted-foreground">Session-only demo — not saved to the server.</p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="review-rating">Rating</Label>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="rounded p-1 hover:bg-muted/50"
                  aria-label={`Rate ${n} stars`}
                >
                  <Star
                    className={`h-5 w-5 ${n <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="review-title">Title</Label>
            <Input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} className="min-h-11" />
          </div>
          <div>
            <Label htmlFor="review-body">Review</Label>
            <Textarea id="review-body" value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
          </div>
          <Button className="min-h-11" onClick={submit}>
            Post review
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-xl border border-border/25 bg-card/60 p-4 backdrop-blur-sm"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{review.title}</p>
                <p className="text-xs text-muted-foreground">
                  {review.author} · {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                {review.rating}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.body}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <ThumbsUp className="h-3 w-3" />
              {review.helpful_count} found helpful
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
