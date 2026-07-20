import { useEffect, useId, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ReaderChapterListItem {
  id: string;
  chapter_number: number;
  title: string;
  access: 'free' | 'coins' | 'premium';
}

interface ReaderChapterListProps {
  open: boolean;
  onClose: () => void;
  seriesTitle: string;
  chapters: ReaderChapterListItem[];
  currentChapterNumber: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onSelectChapter: (chapterNumber: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function ReaderChapterList({
  open,
  onClose,
  seriesTitle,
  chapters,
  currentChapterNumber,
  hasPrevious,
  hasNext,
  onSelectChapter,
  onPrevious,
  onNext,
}: ReaderChapterListProps) {
  const titleId = useId();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.querySelector('[role="listbox"]')) return;
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = [...chapters].sort((a, b) => b.chapter_number - a.chapter_number);
    if (!q) return base;
    return base.filter(
      (c) =>
        String(c.chapter_number).includes(q) ||
        c.title.toLowerCase().includes(q)
    );
  }, [chapters, query]);

  if (!open) return null;

  const accessBadge = (access: ReaderChapterListItem['access']) => {
    if (access === 'free') return <Badge variant="secondary">Free</Badge>;
    if (access === 'coins') return <Badge variant="outline">Coins</Badge>;
    return <Badge>Premium</Badge>;
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-stretch sm:justify-end print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close chapter list"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-[71] flex w-full flex-col border border-border bg-background shadow-2xl',
          'max-h-[min(85vh,640px)] rounded-t-2xl sm:max-h-none sm:h-full sm:w-96 sm:rounded-none sm:rounded-l-xl',
          'pb-[max(0.5rem,env(safe-area-inset-bottom))]'
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-3">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-base font-semibold">
              {seriesTitle}
            </h2>
            <p className="text-xs text-muted-foreground">Chapters</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="min-h-11 min-w-11"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 px-3 py-2">
          <Button
            variant="outline"
            className="min-h-11 flex-1"
            disabled={!hasPrevious}
            onClick={() => {
              onPrevious();
              onClose();
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            className="min-h-11 flex-1"
            disabled={!hasNext}
            onClick={() => {
              onNext();
              onClose();
            }}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="relative px-3 pb-2">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to chapter…"
            className="min-h-11 pl-9"
            aria-label="Search chapters"
          />
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-3" role="list" aria-label="Chapter list">
          {filtered.map((chapter) => {
            const current = chapter.chapter_number === currentChapterNumber;
            return (
              <li key={chapter.id}>
                <button
                  type="button"
                  aria-current={current ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-3 text-left min-h-11',
                    'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    current && 'bg-primary/15 text-primary'
                  )}
                  onClick={() => {
                    onSelectChapter(chapter.chapter_number);
                    onClose();
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      Ch. {chapter.chapter_number}
                      {chapter.title ? ` — ${chapter.title}` : ''}
                    </span>
                  </span>
                  {accessBadge(chapter.access)}
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">No chapters match.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
