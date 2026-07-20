import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export type SeriesDetailTabId =
  | 'overview'
  | 'chapters'
  | 'comments'
  | 'reviews'
  | 'related';

const TAB_ITEMS: Array<{ id: SeriesDetailTabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'chapters', label: 'Chapters' },
  { id: 'comments', label: 'Comments' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'related', label: 'Related Titles' },
];

interface SeriesDetailTabsProps {
  activeTab: SeriesDetailTabId;
  onTabChange: (tab: SeriesDetailTabId) => void;
  chapterCount?: number;
}

export function SeriesDetailTabs({ activeTab, onTabChange, chapterCount }: SeriesDetailTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as SeriesDetailTabId;
    if (TAB_ITEMS.some((t) => t.id === hash) && hash !== activeTab) {
      onTabChange(hash);
    }
  }, []);

  useEffect(() => {
    if (window.location.hash !== `#${activeTab}`) {
      window.history.replaceState(null, '', `#${activeTab}`);
    }
  }, [activeTab]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % TAB_ITEMS.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + TAB_ITEMS.length) % TAB_ITEMS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TAB_ITEMS.length - 1;
    else return;
    e.preventDefault();
    onTabChange(TAB_ITEMS[next].id);
    const btn = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next];
    btn?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Series sections"
      className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-border/25 bg-card/50 p-1 scrollbar-thin sm:mb-6"
    >
      {TAB_ITEMS.map((tab, index) => {
        const label =
          tab.id === 'chapters' && chapterCount != null
            ? `${tab.label} (${chapterCount})`
            : tab.label;
        const selected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'min-h-10 shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm',
              selected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function SeriesDetailTabPanel({
  id,
  activeTab,
  children,
}: {
  id: SeriesDetailTabId;
  activeTab: SeriesDetailTabId;
  children: React.ReactNode;
}) {
  if (activeTab !== id) return null;
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className="focus:outline-none"
    >
      {children}
    </div>
  );
}
