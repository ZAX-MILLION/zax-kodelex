const STORAGE_KEYS = {
  READING_PROGRESS: 'manga_reading_progress',
  BOOKMARKS: 'manga_bookmarks',
  LAST_READ: 'manga_last_read'
};

export interface ReadingProgress {
  chapterId: string;
  pageIndex: number;
  totalPages: number;
  timestamp: number;
}

export interface ChapterProgress {
  [chapterId: string]: {
    currentPage: number;
    totalPages: number;
    completed: boolean;
    lastRead: number;
  };
}

export const getReadingProgress = (): ChapterProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const saveReadingProgress = (chapterId: string, pageIndex: number, totalPages: number) => {
  const progress = getReadingProgress();
  const completed = pageIndex >= totalPages - 1;
  
  progress[chapterId] = {
    currentPage: pageIndex,
    totalPages,
    completed,
    lastRead: Date.now()
  };
  
  localStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(progress));
  
  // Update last read chapter
  localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify({
    chapterId,
    pageIndex,
    timestamp: Date.now()
  }));
};

export const getChapterProgress = (chapterId: string): number => {
  const progress = getReadingProgress();
  const chapterData = progress[chapterId];
  
  if (!chapterData) return 0;
  if (chapterData.completed) return 100;
  
  return Math.round((chapterData.currentPage / chapterData.totalPages) * 100);
};

export const getLastReadChapter = (): ReadingProgress | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_READ);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const getBookmarks = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const toggleBookmark = (chapterId: string): boolean => {
  const bookmarks = getBookmarks();
  const isBookmarked = bookmarks.includes(chapterId);
  
  if (isBookmarked) {
    const updated = bookmarks.filter(id => id !== chapterId);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    return false;
  } else {
    const updated = [...bookmarks, chapterId];
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    return true;
  }
};