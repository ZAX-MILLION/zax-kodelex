import { useCallback, useMemo, useState } from 'react';
import {
  DEMO_COMMENT_LIKES_SESSION_KEY,
  DEMO_COMMENTS_SESSION_KEY,
  DEMO_COMMENT_SEEDS,
  getDemoCommentSeedsForChapter,
  type DemoCommentSeed,
} from '@/features/demo/data/demoComments';
import { appConfig } from '@/config/env';

export interface ReaderComment {
  id: string;
  chapterKey: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
  pinned?: boolean;
  parentId?: string | null;
  temporary?: boolean;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function clearDemoCommentSession() {
  sessionStorage.removeItem(DEMO_COMMENTS_SESSION_KEY);
  sessionStorage.removeItem(DEMO_COMMENT_LIKES_SESSION_KEY);
}

export function useDemoChapterComments(chapterKey: string) {
  const enabled = appConfig.isDemo || appConfig.features.roleLab;

  const [extra, setExtra] = useState<ReaderComment[]>(() =>
    enabled ? readJson<ReaderComment[]>(DEMO_COMMENTS_SESSION_KEY, []) : []
  );
  const [liked, setLiked] = useState<string[]>(() =>
    enabled ? readJson<string[]>(DEMO_COMMENT_LIKES_SESSION_KEY, []) : []
  );
  const [sort, setSort] = useState<'top' | 'newest'>('top');

  const seeds = useMemo(
    () => getDemoCommentSeedsForChapter(chapterKey).map(seedToComment),
    [chapterKey]
  );

  const comments = useMemo(() => {
    const userForChapter = extra.filter((c) => c.chapterKey === chapterKey);
    const merged = [...seeds, ...userForChapter];
    const withLikes = merged.map((c) => ({
      ...c,
      likes: c.likes + (liked.includes(c.id) ? 1 : 0),
    }));
    return withLikes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (sort === 'top') return b.likes - a.likes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [seeds, extra, chapterKey, liked, sort]);

  const roots = comments.filter((c) => !c.parentId);
  const repliesOf = useCallback(
    (id: string) => comments.filter((c) => c.parentId === id),
    [comments]
  );

  const addComment = useCallback(
    (content: string, parentId?: string | null) => {
      if (!enabled) return { ok: false as const, message: 'Demo comments unavailable.' };
      const trimmed = content.trim();
      if (trimmed.length < 2) return { ok: false as const, message: 'Comment is too short.' };
      if (trimmed.length > 500) return { ok: false as const, message: 'Max 500 characters.' };
      const next: ReaderComment = {
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        chapterKey,
        author: 'You (temporary)',
        content: trimmed,
        createdAt: new Date().toISOString(),
        likes: 0,
        parentId: parentId ?? null,
        temporary: true,
      };
      setExtra((prev) => {
        const updated = [...prev, next];
        writeJson(DEMO_COMMENTS_SESSION_KEY, updated);
        return updated;
      });
      return { ok: true as const, message: 'Comment posted for this demo session.' };
    },
    [chapterKey, enabled]
  );

  const toggleLike = useCallback(
    (id: string) => {
      if (!enabled) return;
      setLiked((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        writeJson(DEMO_COMMENT_LIKES_SESSION_KEY, next);
        return next;
      });
    },
    [enabled]
  );

  return {
    enabled,
    comments,
    roots,
    repliesOf,
    sort,
    setSort,
    count: comments.length,
    addComment,
    toggleLike,
    isLiked: (id: string) => liked.includes(id),
    seedCount: DEMO_COMMENT_SEEDS.length,
  };
}

function seedToComment(seed: DemoCommentSeed): ReaderComment {
  return {
    id: seed.id,
    chapterKey: seed.chapterKey,
    author: seed.author,
    content: seed.content,
    createdAt: seed.createdAt,
    likes: seed.likes,
    pinned: seed.pinned,
    parentId: seed.parentId ?? null,
    temporary: false,
  };
}
