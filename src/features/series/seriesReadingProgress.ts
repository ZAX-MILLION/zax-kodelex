/**
 * Client-side reading progress, library, and share helpers for series details (demo-safe).
 */

const CONTINUE_PREFIX = 'zax-demo-continue:';
const READ_PREFIX = 'zax-demo-read:';
const LIBRARY_KEY = 'zax-demo-library';

export interface SeriesReadingState {
  continueChapter: number | null;
  readChapters: Set<number>;
  progressPercent: number;
  isInLibrary: boolean;
}

function readChapterSet(seriesId: string): Set<number> {
  const out = new Set<number>();
  try {
    const raw = sessionStorage.getItem(`${READ_PREFIX}${seriesId}`);
    if (!raw) return out;
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      parsed.forEach((n) => {
        if (typeof n === 'number' && Number.isFinite(n)) out.add(n);
      });
    }
  } catch {
    /* ignore */
  }
  return out;
}

function writeChapterSet(seriesId: string, chapters: Set<number>) {
  try {
    sessionStorage.setItem(`${READ_PREFIX}${seriesId}`, JSON.stringify([...chapters]));
  } catch {
    /* ignore */
  }
}

export function getContinueChapterNumber(seriesId: string): number | null {
  try {
    const raw = sessionStorage.getItem(`${CONTINUE_PREFIX}${seriesId}`);
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function setContinueChapterNumber(seriesId: string, chapterNumber: number) {
  try {
    sessionStorage.setItem(`${CONTINUE_PREFIX}${seriesId}`, String(chapterNumber));
    markChapterRead(seriesId, chapterNumber);
  } catch {
    /* ignore */
  }
}

export function markChapterRead(seriesId: string, chapterNumber: number) {
  const set = readChapterSet(seriesId);
  set.add(chapterNumber);
  writeChapterSet(seriesId, set);
}

export function markAllChaptersRead(seriesId: string, chapterNumbers: number[]) {
  const set = readChapterSet(seriesId);
  chapterNumbers.forEach((n) => set.add(n));
  writeChapterSet(seriesId, set);
}

export function isChapterRead(seriesId: string, chapterNumber: number): boolean {
  return readChapterSet(seriesId).has(chapterNumber);
}

export function getReadingProgressPercent(
  seriesId: string,
  totalChapters: number
): number {
  if (totalChapters <= 0) return 0;
  const read = readChapterSet(seriesId).size;
  return Math.min(100, Math.round((read / totalChapters) * 100));
}

function readLibrary(): Set<string> {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

function writeLibrary(ids: Set<string>) {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

export function isSeriesInLibrary(seriesId: string): boolean {
  return readLibrary().has(seriesId);
}

export function toggleSeriesLibrary(seriesId: string): boolean {
  const lib = readLibrary();
  if (lib.has(seriesId)) {
    lib.delete(seriesId);
    writeLibrary(lib);
    return false;
  }
  lib.add(seriesId);
  writeLibrary(lib);
  return true;
}

export function getSeriesReadingState(
  seriesId: string,
  totalChapters: number
): SeriesReadingState {
  const readChapters = readChapterSet(seriesId);
  return {
    continueChapter: getContinueChapterNumber(seriesId),
    readChapters,
    progressPercent: getReadingProgressPercent(seriesId, totalChapters),
    isInLibrary: isSeriesInLibrary(seriesId),
  };
}

export function getSeriesShareUrl(seriesId: string, title?: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const path = `${import.meta.env.BASE_URL || '/'}series/${seriesId}`.replace(/\/{2,}/g, '/');
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  if (typeof navigator !== 'undefined' && navigator.share) {
    return url;
  }
  return title ? `${url} — ${title}` : url;
}

export async function shareSeries(seriesId: string, title: string): Promise<'shared' | 'copied' | 'failed'> {
  const url = getSeriesShareUrl(seriesId);
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title, url });
      return 'shared';
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return 'copied';
    }
  } catch {
    return 'failed';
  }
  return 'failed';
}
