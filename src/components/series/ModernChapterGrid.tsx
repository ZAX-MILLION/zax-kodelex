import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ChapterUnlockPopup from '../ChapterUnlockPopup';
import { ChapterGridViewToggle } from './ChapterGridViewToggle';
import { ArrowUpDown, CheckCircle } from 'lucide-react';
import { useSeriesChapterController } from '@/features/series/useSeriesChapterController';
import { getChapterGridColumnClasses } from '@/features/series/seriesChapterGridView';
import type {
  ChapterAccessFilter,
  ChapterListVariant,
  ChapterReadFilter,
  SeriesChapterItem,
} from '@/features/series/seriesChapterTypes';
import { EditorialChapterList } from './chapters/EditorialChapterList';
import { CinematicChapterCards } from './chapters/CinematicChapterCards';
import { CatalogueChapterGrid } from './chapters/CatalogueChapterGrid';
import { CompactChapterList } from './chapters/CompactChapterList';

export type { SeriesChapterItem } from '@/features/series/seriesChapterTypes';

interface ModernChapterGridProps {
  chapters: SeriesChapterItem[];
  seriesId?: string;
  /** Which layout's item presentation to render. Filter/sort/access/read logic is always shared. */
  variant?: ChapterListVariant;
  heading?: string;
}

const RENDERERS: Record<ChapterListVariant, typeof EditorialChapterList> = {
  editorial: EditorialChapterList,
  cinematic: CinematicChapterCards,
  catalogue: CatalogueChapterGrid,
  compact: CompactChapterList,
};

const ModernChapterGrid: React.FC<ModernChapterGridProps> = ({
  chapters = [],
  seriesId,
  variant = 'catalogue',
  heading = 'Chapters',
}) => {
  const {
    gridView,
    setGridView,
    sortNewestFirst,
    setSortNewestFirst,
    searchQuery,
    setSearchQuery,
    accessFilter,
    setAccessFilter,
    readFilter,
    setReadFilter,
    displayItems,
    handleChapterClick,
    markAllRead,
    selectedChapter,
    showUnlockPopup,
    closeUnlockPopup,
    onUnlocked,
  } = useSeriesChapterController(chapters, seriesId);

  const columnClassName = getChapterGridColumnClasses(gridView);
  const Renderer = RENDERERS[variant];
  const isIndexToc = variant === 'compact';

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">{heading}</h2>
          {!isIndexToc && (
            <ChapterGridViewToggle value={gridView} onChange={setGridView} />
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Input
            type="search"
            placeholder="Search chapters…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-10 w-full min-w-0 sm:max-w-[11rem] sm:flex-1"
            aria-label="Search chapters"
          />
          <Select value={accessFilter} onValueChange={(v) => setAccessFilter(v as ChapterAccessFilter)}>
            <SelectTrigger className="min-h-10 w-full min-w-0 sm:w-32" aria-label="Filter chapters by access">
              <SelectValue placeholder="Access" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All access</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="coins">Coin</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
          <Select value={readFilter} onValueChange={(v) => setReadFilter(v as ChapterReadFilter)}>
            <SelectTrigger className="min-h-10 w-full min-w-0 sm:w-32" aria-label="Filter chapters by read status">
              <SelectValue placeholder="Read status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 gap-2"
            onClick={() => setSortNewestFirst((v) => !v)}
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortNewestFirst ? 'Newest first' : 'Oldest first'}
          </Button>
          {seriesId && chapters.length > 0 && (
            <Button type="button" variant="ghost" size="sm" className="min-h-10 gap-2" onClick={markAllRead}>
              <CheckCircle className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <div
        data-chapter-grid-view={isIndexToc ? 1 : gridView}
        data-chapter-list-variant={variant}
        data-chapter-toc={isIndexToc ? 'single-column' : undefined}
      >
        <Renderer
          items={displayItems}
          gridView={isIndexToc ? 1 : gridView}
          columnClassName={columnClassName}
          onChapterClick={handleChapterClick}
        />
      </div>

      {displayItems.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No chapters match your filters.</p>
      )}

      {selectedChapter && (
        <ChapterUnlockPopup
          isOpen={showUnlockPopup}
          onClose={closeUnlockPopup}
          chapterId={selectedChapter.id}
          chapterTitle={`Chapter ${selectedChapter.chapter_number}: ${selectedChapter.title}`}
          unlockCost={selectedChapter.unlock_cost}
          onUnlocked={onUnlocked}
        />
      )}
    </div>
  );
};

export default ModernChapterGrid;
