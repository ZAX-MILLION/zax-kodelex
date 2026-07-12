import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '@/utils/dateFormatting';
import LazyImage from '@/components/LazyImage';
import { 
  BookOpen, 
  Lock, 
  Clock, 
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  release_date: string;
  page_count: number;
  is_locked: boolean;
  sort_order: number;
  thumbnail_url?: string;
  view_count?: number;
}

interface ChapterListProps {
  chapters: Chapter[];
  seriesId?: string;
  className?: string;
  reverseOrder?: boolean;
  onToggleOrder?: () => void;
}

export const ChapterList: React.FC<ChapterListProps> = ({ 
  chapters, 
  seriesId,
  className = '',
  reverseOrder = true,
  onToggleOrder
}) => {
  const [showAll, setShowAll] = useState(false);
  const [expandedView, setExpandedView] = useState(false);

  // Sort chapters by chapter number
  const sortedChapters = useMemo(() => {
    return [...chapters].sort((a, b) => 
      reverseOrder 
        ? b.chapter_number - a.chapter_number  // Descending (newest first)
        : a.chapter_number - b.chapter_number  // Ascending (oldest first)
    );
  }, [chapters, reverseOrder]);

  // Show only first 15 chapters initially, with scrollable area for the rest
  const displayedChapters = useMemo(() => {
    if (showAll || sortedChapters.length <= 15) {
      return sortedChapters;
    }
    return sortedChapters.slice(0, 15);
  }, [sortedChapters, showAll]);

  const hasMoreChapters = sortedChapters.length > 15;

  const formatChapterTime = (dateString: string) => {
    try {
      return formatTimeAgo(dateString);
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Chapters ({chapters.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            {onToggleOrder && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleOrder}
                className="text-muted-foreground hover:text-foreground"
              >
                <Clock className="h-4 w-4 mr-1" />
                {reverseOrder ? 'Newest First' : 'Oldest First'}
              </Button>
            )}
            {hasMoreChapters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedView(!expandedView)}
                className="text-muted-foreground hover:text-foreground"
              >
                {expandedView ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Compact
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Expand
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chapters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No chapters available yet.</p>
          </div>
        ) : (
          <>
            <ScrollArea 
              className={`${expandedView ? 'h-96' : 'h-80'} w-full rounded-md border border-border/50`}
            >
              <div className="space-y-2 p-4">
                {displayedChapters.map((chapter) => {
                  const chapterLink = seriesId 
                    ? `/reader/${seriesId}/${chapter.chapter_number}`
                    : `/reader/${chapter.id}`;
                  
                  return (
                    <Link
                      key={chapter.id}
                      to={chapterLink}
                      className="block"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 group">
                        {/* Chapter number badge */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                          {chapter.chapter_number}
                        </div>

                        {/* Chapter thumbnail (if available) */}
                        {chapter.thumbnail_url && (
                          <div className="flex-shrink-0 w-12 h-16 rounded bg-muted overflow-hidden">
                            <LazyImage 
                              src={chapter.thumbnail_url}
                              alt={`Chapter ${chapter.chapter_number}`}
                              className="w-full h-full object-cover transition-all duration-200 group-hover:scale-105"
                              loading="lazy"
                              width={48}
                              height={64}
                            />
                          </div>
                        )}

                        {/* Chapter info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                              {chapter.title || `Chapter ${chapter.chapter_number}`}
                            </h3>
                            {chapter.is_locked && (
                              <Lock className="h-3 w-3 text-orange-500 flex-shrink-0" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{chapter.page_count} pages</span>
                            </div>
                            {chapter.view_count !== undefined && (
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{chapter.view_count}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatChapterTime(chapter.release_date)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="flex-shrink-0">
                          {chapter.is_locked ? (
                            <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400 bg-amber-500/10">
                              Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-green-500/40 text-green-400 bg-green-500/10">
                              Free
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Show more button */}
            {hasMoreChapters && !showAll && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(true)}
                  className="w-full"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show All {chapters.length} Chapters
                </Button>
              </div>
            )}

            {showAll && hasMoreChapters && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(false)}
                  className="w-full"
                >
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less (First 15)
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChapterList;