import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ChapterUnlockPopup from '../ChapterUnlockPopup';
import {
  Clock,
  CheckCircle,
  Lock,
  Unlock,
  MessageCircle,
  ArrowUpDown,
  BookMarked,
  Circle,
} from 'lucide-react';
import type { DemoAccessType } from '@/features/demo/data/demoChapterCatalog';
import {
  getContinueChapterNumber,
  isChapterRead,
  markAllChaptersRead,
} from '@/features/series/seriesReadingProgress';

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

interface ModernChapterGridProps {
  chapters: SeriesChapterItem[];
  seriesId?: string;
}

type AccessFilter = 'all' | DemoAccessType;
type ReadFilter = 'all' | 'read' | 'unread';

const ModernChapterGrid: React.FC<ModernChapterGridProps> = ({ chapters = [], seriesId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [userAccess, setUserAccess] = useState<Record<string, boolean>>({});
  const [selectedChapter, setSelectedChapter] = useState<SeriesChapterItem | null>(null);
  const [showUnlockPopup, setShowUnlockPopup] = useState(false);
  const [readTick, setReadTick] = useState(0);

  const continueChapter = seriesId ? getContinueChapterNumber(seriesId) : null;

  useEffect(() => {
    if (user && chapters.length > 0) {
      checkUserAccess();
    }
  }, [user, chapters]);

  useEffect(() => {
    const onStorage = () => setReadTick((n) => n + 1);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const checkUserAccess = async () => {
    if (!user) return;
    if (chapters.some((chapter) => chapter.id.includes('-ch-'))) {
      return;
    }

    try {
      const { data } = await supabase
        .from('chapter_access')
        .select('chapter_id')
        .eq('user_id', user.id)
        .in('chapter_id', chapters.map((c) => c.id));

      const accessMap: Record<string, boolean> = {};
      data?.forEach((access) => {
        accessMap[access.chapter_id] = true;
      });
      setUserAccess(accessMap);
    } catch (error) {
      console.error('Error checking user access:', error);
    }
  };

  const filteredChapters = useMemo(() => {
    let list = [...chapters];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          String(c.chapter_number).includes(q)
      );
    }
    if (accessFilter !== 'all') {
      list = list.filter((c) => {
        const type = c.access_type || (c.is_locked ? (c.unlock_cost > 0 ? 'coins' : 'premium') : 'free');
        return type === accessFilter;
      });
    }
    if (readFilter !== 'all' && seriesId) {
      list = list.filter((c) => {
        const read = isChapterRead(seriesId, c.chapter_number);
        return readFilter === 'read' ? read : !read;
      });
    }
    list.sort((a, b) =>
      sortNewestFirst
        ? b.chapter_number - a.chapter_number
        : a.chapter_number - b.chapter_number
    );
    return list;
  }, [chapters, searchQuery, accessFilter, readFilter, sortNewestFirst, seriesId, readTick]);

  const getChapterStatus = (chapter: SeriesChapterItem) => {
    if (userAccess[chapter.id]) return 'unlocked';
    if (chapter.access_type === 'premium') return 'locked-premium';
    if (chapter.access_type === 'coins') return 'locked';
    if (chapter.access_type === 'free' || !chapter.is_locked) return 'free';
    if (chapter.unlock_cost > 0) return 'locked';
    return 'locked-premium';
  };

  const handleChapterClick = (chapter: SeriesChapterItem) => {
    if (chapter.id.includes('-ch-') || seriesId?.startsWith('00000000-0000-4000-a000-')) {
      const targetSeries = seriesId || chapter.id.split('-ch-')[0];
      navigate(`/reader/${targetSeries}/${chapter.chapter_number}`);
      return;
    }

    const status = getChapterStatus(chapter);
    if (status === 'locked' || status === 'locked-premium') {
      setSelectedChapter(chapter);
      setShowUnlockPopup(true);
    } else {
      navigate(`/reader/${chapter.id}`);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">Chapters</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Input
            type="search"
            placeholder="Search chapters…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-h-10 w-full sm:w-44"
            aria-label="Search chapters"
          />
          <Select value={accessFilter} onValueChange={(v) => setAccessFilter(v as AccessFilter)}>
            <SelectTrigger className="min-h-10 w-full sm:w-36">
              <SelectValue placeholder="Access" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All access</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="coins">Coin</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
          <Select value={readFilter} onValueChange={(v) => setReadFilter(v as ReadFilter)}>
            <SelectTrigger className="min-h-10 w-full sm:w-36">
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
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-10 gap-2"
              onClick={() => {
                markAllChaptersRead(
                  seriesId,
                  chapters.map((c) => c.chapter_number)
                );
                setReadTick((n) => n + 1);
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1">
        {filteredChapters.map((chapter) => {
          const daysAgo = Math.floor(
            (Date.now() - new Date(chapter.release_date).getTime()) / (1000 * 60 * 60 * 24)
          );
          const isNew = daysAgo <= 3;
          const status = getChapterStatus(chapter);
          const isLockedVisual = status === 'locked' || status === 'locked-premium';
          const isRead = seriesId ? isChapterRead(seriesId, chapter.chapter_number) : false;
          const isContinue = continueChapter === chapter.chapter_number;
          const commentCount = chapter.comment_count ?? 0;

          return (
            <Card
              key={chapter.id}
              className={`group cursor-pointer border border-border/10 bg-card/30 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/50 ${
                isContinue ? 'ring-2 ring-primary/50' : ''
              } ${isLockedVisual ? 'opacity-80' : ''}`}
              onClick={() => handleChapterClick(chapter)}
            >
              <div className="flex items-center gap-3 p-4 sm:gap-4">
                <div className="relative shrink-0">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg text-sm font-bold shadow-md sm:h-14 sm:w-14 sm:text-base ${
                      isLockedVisual
                        ? 'border-2 border-destructive/30 bg-destructive text-destructive-foreground'
                        : status === 'unlocked'
                          ? 'border-2 border-blue-500/30 bg-blue-500 text-white'
                          : 'border-2 border-green-600/30 bg-green-600 text-white'
                    }`}
                  >
                    {chapter.chapter_number}
                  </div>
                  {isNew && !isLockedVisual && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="flex flex-wrap items-center gap-2 font-bold group-hover:text-primary">
                        <span className="line-clamp-1">Chapter {chapter.chapter_number}</span>
                        {isContinue && (
                          <Badge variant="default" className="gap-1 text-[10px]">
                            <BookMarked className="h-3 w-3" />
                            Continue
                          </Badge>
                        )}
                        {isRead && (
                          <Badge variant="secondary" className="gap-1 text-[10px]">
                            <CheckCircle className="h-3 w-3" />
                            Read
                          </Badge>
                        )}
                        {!isRead && !isContinue && (
                          <Circle className="h-3 w-3 text-muted-foreground" aria-label="Unread" />
                        )}
                      </h3>
                      <p className="line-clamp-1 text-sm text-muted-foreground">{chapter.title}</p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {status === 'locked' ? (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <Lock className="h-3 w-3" />
                          {chapter.unlock_cost} coins
                        </Badge>
                      ) : status === 'locked-premium' ? (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <Lock className="h-3 w-3" />
                          Premium
                        </Badge>
                      ) : status === 'unlocked' ? (
                        <Badge variant="secondary" className="gap-1 border-blue-500/30 bg-blue-500/20 text-xs text-blue-600">
                          <Unlock className="h-3 w-3" />
                          Unlocked
                        </Badge>
                      ) : (
                        <Badge variant="default" className="gap-1 bg-green-600 text-xs hover:bg-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Free
                        </Badge>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                        </span>
                        {commentCount > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {commentCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredChapters.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No chapters match your filters.</p>
      )}

      {selectedChapter && (
        <ChapterUnlockPopup
          isOpen={showUnlockPopup}
          onClose={() => {
            setShowUnlockPopup(false);
            setSelectedChapter(null);
          }}
          chapterId={selectedChapter.id}
          chapterTitle={`Chapter ${selectedChapter.chapter_number}: ${selectedChapter.title}`}
          unlockCost={selectedChapter.unlock_cost}
          onUnlocked={() => {
            checkUserAccess();
          }}
        />
      )}
    </div>
  );
};

export default ModernChapterGrid;
