/**
 * Seeded demo series reviews — session-only submissions, never Supabase.
 */

export interface DemoSeriesReview {
  id: string;
  series_id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  helpful_count: number;
}

export interface DemoReviewSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

const SESSION_KEY = 'zax-demo-series-reviews-session';

const REVIEW_TEMPLATES = [
  {
    author: 'MangaFan42',
    rating: 5,
    title: 'Absolutely hooked',
    body: 'The pacing and art direction are top tier. Already caught up on all available chapters.',
  },
  {
    author: 'NightOwlReader',
    rating: 4,
    title: 'Solid read',
    body: 'Great world-building and characters. A few slow spots but overall very enjoyable.',
  },
  {
    author: 'WebtoonWeekly',
    rating: 5,
    title: 'Premium quality',
    body: 'One of the best series in the demo catalogue. Worth every coin for the latest chapter.',
  },
  {
    author: 'CasualCritic',
    rating: 3,
    title: 'Decent starter',
    body: 'Good introduction to the platform. Would like more chapters to judge the full arc.',
  },
];

function seedReviewsForSeries(seriesId: string, index: number): DemoSeriesReview[] {
  const base = new Date(Date.now() - (index + 1) * 5 * 24 * 60 * 60 * 1000);
  return REVIEW_TEMPLATES.slice(0, 2 + (index % 3)).map((tpl, i) => ({
    id: `${seriesId}-review-seed-${i}`,
    series_id: seriesId,
    author: tpl.author,
    rating: tpl.rating,
    title: tpl.title,
    body: tpl.body,
    created_at: new Date(base.getTime() - i * 86400000).toISOString(),
    helpful_count: 3 + i * 2 + index,
  }));
}

const SEEDED = new Map<string, DemoSeriesReview[]>();

export function getDemoSeriesReviewSeeds(seriesId: string, seriesIndex = 0): DemoSeriesReview[] {
  if (!SEEDED.has(seriesId)) {
    SEEDED.set(seriesId, seedReviewsForSeries(seriesId, seriesIndex));
  }
  return SEEDED.get(seriesId)!;
}

function readSessionReviews(): DemoSeriesReview[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as DemoSeriesReview[]) : [];
  } catch {
    return [];
  }
}

function writeSessionReviews(reviews: DemoSeriesReview[]) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(reviews));
  } catch {
    /* ignore */
  }
}

export function getDemoSeriesReviews(seriesId: string, seriesIndex = 0): DemoSeriesReview[] {
  const seeds = getDemoSeriesReviewSeeds(seriesId, seriesIndex);
  const session = readSessionReviews().filter((r) => r.series_id === seriesId);
  return [...session, ...seeds].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function addDemoSeriesReview(
  seriesId: string,
  input: { author: string; rating: number; title: string; body: string }
): DemoSeriesReview {
  const review: DemoSeriesReview = {
    id: `${seriesId}-review-${Date.now()}`,
    series_id: seriesId,
    author: input.author.trim() || 'Demo Reader',
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    title: input.title.trim() || 'My review',
    body: input.body.trim(),
    created_at: new Date().toISOString(),
    helpful_count: 0,
  };
  const all = readSessionReviews();
  all.unshift(review);
  writeSessionReviews(all);
  return review;
}

export function summarizeDemoReviews(reviews: DemoSeriesReview[]): DemoReviewSummary {
  const distribution: DemoReviewSummary['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (reviews.length === 0) {
    return { average: 0, count: 0, distribution };
  }
  let sum = 0;
  reviews.forEach((r) => {
    const bucket = Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5;
    distribution[bucket] += 1;
    sum += r.rating;
  });
  return {
    average: Number((sum / reviews.length).toFixed(1)),
    count: reviews.length,
    distribution,
  };
}
