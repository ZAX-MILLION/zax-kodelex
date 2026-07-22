import type { DemoAccessType } from '@/features/demo/data/demoChapterCatalog';

export interface SeriesChapterItem {
  id: string;
  title: string;
  chapter_number: number;
  page_count: number;
  release_date: string;
  view_count: number;
  is_locked: boolean;
  unlock_cost: number;
  thumbnail_url: string;
  access_type?: DemoAccessType;
  comment_count?: number;
}

export type ChapterAccessFilter = 'all' | DemoAccessType;
export type ChapterReadFilter = 'all' | 'read' | 'unread';
export type ChapterStatus = 'unlocked' | 'locked-premium' | 'locked' | 'free';

/** Which layout family is rendering the chapter list — drives item presentation only. */
export type ChapterListVariant = 'editorial' | 'cinematic' | 'catalogue' | 'compact';

export function getChapterStatus(
  chapter: SeriesChapterItem,
  userAccess: Record<string, boolean>
): ChapterStatus {
  if (userAccess[chapter.id]) return 'unlocked';
  if (chapter.access_type === 'premium') return 'locked-premium';
  if (chapter.access_type === 'coins') return 'locked';
  if (chapter.access_type === 'free' || !chapter.is_locked) return 'free';
  if (chapter.unlock_cost > 0) return 'locked';
  return 'locked-premium';
}

export function daysAgoFor(releaseDate: string): number {
  return Math.floor((Date.now() - new Date(releaseDate).getTime()) / (1000 * 60 * 60 * 24));
}

export interface ChapterItemDisplayState {
  chapter: SeriesChapterItem;
  status: ChapterStatus;
  isLockedVisual: boolean;
  isRead: boolean;
  isContinue: boolean;
  daysAgo: number;
  isNew: boolean;
  commentCount: number;
}
