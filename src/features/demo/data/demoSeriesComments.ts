/**
 * Seeded demo series-level comments — session-only, never Supabase.
 */

export interface DemoSeriesComment {
  id: string;
  series_id: string;
  author: string;
  content: string;
  created_at: string;
  like_count: number;
}

const SESSION_KEY = 'zax-demo-series-comments-session';

const SEED_COMMENTS = [
  { author: 'ReaderOne', content: 'Can’t wait for the next chapter update!', like_count: 12 },
  { author: 'ArtLover', content: 'The cover art alone sold me on this series.', like_count: 8 },
  { author: 'PlotTwist', content: 'That last chapter cliffhanger though…', like_count: 15 },
];

function seedForSeries(seriesId: string): DemoSeriesComment[] {
  const base = Date.now() - 86400000 * 3;
  return SEED_COMMENTS.map((c, i) => ({
    id: `${seriesId}-comment-seed-${i}`,
    series_id: seriesId,
    author: c.author,
    content: c.content,
    created_at: new Date(base - i * 3600000).toISOString(),
    like_count: c.like_count,
  }));
}

const SEEDED = new Map<string, DemoSeriesComment[]>();

export function getDemoSeriesCommentSeeds(seriesId: string): DemoSeriesComment[] {
  if (!SEEDED.has(seriesId)) {
    SEEDED.set(seriesId, seedForSeries(seriesId));
  }
  return SEEDED.get(seriesId)!;
}

function readSession(): DemoSeriesComment[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as DemoSeriesComment[]) : [];
  } catch {
    return [];
  }
}

function writeSession(comments: DemoSeriesComment[]) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(comments));
  } catch {
    /* ignore */
  }
}

export function getDemoSeriesComments(seriesId: string): DemoSeriesComment[] {
  const seeds = getDemoSeriesCommentSeeds(seriesId);
  const session = readSession().filter((c) => c.series_id === seriesId);
  return [...session, ...seeds].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function addDemoSeriesComment(seriesId: string, author: string, content: string): DemoSeriesComment {
  const comment: DemoSeriesComment = {
    id: `${seriesId}-comment-${Date.now()}`,
    series_id: seriesId,
    author: author.trim() || 'Demo Reader',
    content: content.trim(),
    created_at: new Date().toISOString(),
    like_count: 0,
  };
  const all = readSession();
  all.unshift(comment);
  writeSession(all);
  return comment;
}
