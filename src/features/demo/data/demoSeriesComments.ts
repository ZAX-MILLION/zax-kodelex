/**
 * Seeded demo series-level comments — session-only, never Supabase.
 */

export interface DemoSeriesCommentReply {
  id: string;
  author: string;
  content: string;
  created_at: string;
  like_count: number;
}

export interface DemoSeriesComment {
  id: string;
  series_id: string;
  author: string;
  content: string;
  created_at: string;
  like_count: number;
  replies?: DemoSeriesCommentReply[];
}

const SESSION_KEY = 'zax-demo-series-comments-session';
const REACTIONS_KEY = 'zax-demo-series-comments-reactions';

const SEED_COMMENTS: Array<{
  author: string;
  content: string;
  like_count: number;
  replies?: DemoSeriesCommentReply[];
}> = [
  {
    author: 'ReaderOne',
    content: 'Can’t wait for the next chapter update!',
    like_count: 12,
    replies: [
      {
        id: 'seed-reply-0',
        author: 'Editor',
        content: 'New chapter drops Friday — stay tuned!',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        like_count: 4,
      },
    ],
  },
  {
    author: 'ArtLover',
    content: 'The cover art alone sold me on this series.',
    like_count: 8,
  },
  {
    author: 'PlotTwist',
    content: 'That last chapter cliffhanger though…',
    like_count: 15,
  },
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
    replies: c.replies?.map((r) => ({ ...r, id: `${seriesId}-${r.id}` })),
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

function readReactions(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(REACTIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

function writeReactions(map: Record<string, number>) {
  try {
    sessionStorage.setItem(REACTIONS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function getDemoSeriesComments(seriesId: string): DemoSeriesComment[] {
  const seeds = getDemoSeriesCommentSeeds(seriesId);
  const session = readSession().filter((c) => c.series_id === seriesId);
  const reactions = readReactions();
  const merged = [...session, ...seeds].map((c) => ({
    ...c,
    like_count: c.like_count + (reactions[c.id] || 0),
    replies: c.replies?.map((r) => ({
      ...r,
      like_count: r.like_count + (reactions[r.id] || 0),
    })),
  }));
  return merged.sort(
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
    replies: [],
  };
  const all = readSession();
  all.unshift(comment);
  writeSession(all);
  return comment;
}

export function addDemoSeriesCommentReply(
  commentId: string,
  author: string,
  content: string
): DemoSeriesCommentReply | null {
  const reply: DemoSeriesCommentReply = {
    id: `${commentId}-reply-${Date.now()}`,
    author: author.trim() || 'Demo Reader',
    content: content.trim(),
    created_at: new Date().toISOString(),
    like_count: 0,
  };

  const session = readSession();
  const idx = session.findIndex((c) => c.id === commentId);
  if (idx >= 0) {
    session[idx].replies = [...(session[idx].replies || []), reply];
    writeSession(session);
    return reply;
  }

  for (const [seriesId, seeds] of SEEDED.entries()) {
    const seedIdx = seeds.findIndex((c) => c.id === commentId);
    if (seedIdx >= 0) {
      const cloned = { ...seeds[seedIdx], replies: [...(seeds[seedIdx].replies || []), reply] };
      const sessionComment: DemoSeriesComment = { ...cloned, series_id: seriesId };
      const all = readSession();
      all.unshift(sessionComment);
      writeSession(all);
      return reply;
    }
  }
  return null;
}

export function toggleDemoCommentReaction(targetId: string): number {
  const map = readReactions();
  map[targetId] = (map[targetId] || 0) + 1;
  writeReactions(map);
  return map[targetId];
}

export type DemoCommentSort = 'newest' | 'top';

export function sortDemoSeriesComments(
  comments: DemoSeriesComment[],
  sort: DemoCommentSort
): DemoSeriesComment[] {
  const list = [...comments];
  if (sort === 'top') {
    return list.sort((a, b) => b.like_count - a.like_count);
  }
  return list.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
