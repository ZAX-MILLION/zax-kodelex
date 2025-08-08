import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Star, ChevronLeft, ChevronRight, BookOpen, Lock, CalendarDays } from 'lucide-react';
import { SeriesCard } from '@/hooks/useHomepageData';
import { SeriesWithChapters } from '@/hooks/useSeriesWithChapters';
import { useNavigate, Link } from 'react-router-dom';
import LazyImage from '@/components/LazyImage';
import { formatDistanceToNow } from 'date-fns';
import ChapterAccessHandler from '@/components/ChapterAccessHandler';

interface SeriesGridProps {
  series: SeriesCard[];
  title?: string;
  description?: string;
  columns?: 3 | 4 | 5 | 6;
  showViewMore?: boolean;
  showPagination?: boolean;
  totalCount?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export const SeriesGrid: React.FC<SeriesGridProps> = ({
  series,
  title,
  description,
  columns = 4,
  showViewMore = false,
  showPagination = false,
  totalCount = 0,
  currentPage = 1,
  itemsPerPage = 12,
  onPageChange
}) => {
  const navigate = useNavigate();

  const getColumnClass = () => {
    switch (columns) {
      case 3:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3';
      case 4:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 5:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
      default:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }
  };

  const handleSeriesClick = (seriesId: string) => {
    navigate(`/series/${seriesId}`);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const renderChapterList = (item: SeriesCard) => {
    if (!item.latest_chapter || item.latest_chapter === 0) {
      return (
        <div className="flex items-center justify-center py-4 text-muted-foreground">
          <span className="text-xs">No chapters yet</span>
        </div>
      );
    }

    // Show latest 3 chapters in vertical list format
    const latestChapter = item.latest_chapter;
    const chaptersToShow = [];
    
    // Create chapters from latest down to (latest-2) or 1, whichever is higher
    for (let i = latestChapter; i >= Math.max(1, latestChapter - 2); i--) {
      chaptersToShow.push({
        number: i,
        isLocked: i === latestChapter, // Only latest chapter is locked
        title: `Chapter ${i}`
      });
    }

    return (
      <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-hide">
        {chaptersToShow.map(chapter => (
          <ChapterAccessHandler
            key={chapter.number}
            chapterId={`${item.id}-${chapter.number}`}
            chapterTitle={`Chapter ${chapter.number}`}
            isLocked={chapter.isLocked}
            onAccess={() => navigate(`/series/${item.id}/chapter/${chapter.number}`)}
          >
            <div className={`flex items-center justify-between px-3 py-2 rounded-md text-xs transition-all hover:scale-[1.02] cursor-pointer ${
              chapter.isLocked 
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border border-red-500" 
                : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white"
            }`}>
              <span className="flex items-center gap-1.5">
                {chapter.isLocked && <Lock className="h-3 w-3" />}
                <span className="font-medium">Ch.{chapter.number}</span>
              </span>
              <span className="text-xs opacity-80 font-medium">
                {new Date(Date.now() - (latestChapter - chapter.number) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </ChapterAccessHandler>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {startPage > 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => onPageChange?.(1)}>
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pageNumbers.map(page => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange?.(page)}
          >
            {page}
          </Button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button variant="outline" size="sm" onClick={() => onPageChange?.(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (series.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="space-y-2">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">No series found</h3>
          <p className="text-muted-foreground">Check back later for new content!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      {title && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          {showViewMore && !showPagination && (
            <Button variant="outline" asChild>
              <Link to="/browse">
                View All
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Series Grid */}
      <div className={`grid ${getColumnClass()} gap-2 sm:gap-3 md:gap-4`}>
        {series.map(item => (
          <Card key={item.id} className="group overflow-hidden bg-card/95 backdrop-blur-sm hover:bg-card transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 border border-border/50 hover:border-primary/30">
            <Link to={`/series/${item.id}`} className="block h-full">
              {/* Image Container - More compact */}
              <div className="relative aspect-[2/3] sm:aspect-[3/4] overflow-hidden">
                <LazyImage 
                  src={item.cover_image_url || '/placeholder.svg'} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110" 
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 group-hover:from-black/40" />
                
                {/* Type badge - Compact */}
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                  <Badge className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1 py-0.5 sm:px-1.5 sm:py-0.5 backdrop-blur-md border border-white/20 ${
                    item.genres?.includes('Novel') ? 'bg-purple-500/90 text-white shadow-purple-500/50' :
                    item.genres?.includes('Manhua') ? 'bg-red-500/90 text-white shadow-red-500/50' :
                    item.genres?.includes('Manhwa') ? 'bg-blue-500/90 text-white shadow-blue-500/50' :
                    'bg-orange-500/90 text-white shadow-orange-500/50'
                  } shadow-lg`}>
                    {item.genres?.includes('Novel') ? 'NOVEL' :
                     item.genres?.includes('Manhua') ? 'MANHUA' :
                     item.genres?.includes('Manhwa') ? 'MANHWA' : 'MANGA'}
                  </Badge>
                </div>

                {/* Rating - Compact */}
                <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-black/90 backdrop-blur-md text-white px-1 py-0.5 sm:px-1.5 sm:py-1 rounded text-[9px] sm:text-[10px] flex items-center gap-1 border border-white/10">
                  <Star className="h-2 w-2 sm:h-2.5 sm:w-2.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">4.{Math.floor(Math.random() * 9) + 1}</span>
                </div>

                {/* Status text - Compact */}
                <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2">
                  <span className={`text-[8px] sm:text-[9px] font-medium px-1 py-0.5 rounded backdrop-blur-md border border-white/20 ${
                    item.status === 'ongoing' ? 'bg-green-500/90 text-white' : 'bg-blue-500/90 text-white'
                  }`}>
                    {item.status === 'ongoing' ? 'ONGOING' : 'COMPLETED'}
                  </span>
                </div>
              </div>

              {/* Content Section - More compact */}
              <CardContent className="p-2 sm:p-3 space-y-2 bg-gradient-to-b from-card via-card to-card/95 min-h-[100px] sm:min-h-[120px] flex flex-col">
                {/* Title Section */}
                <div className="flex-none">
                  <h3 className="font-bold text-xs sm:text-sm lg:text-base line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                    {item.title}
                  </h3>
                </div>

                {/* Latest Chapters - Compact */}
                <div className="flex-1 space-y-1.5">
                  <h4 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Latest Chapters</h4>
                   <div className="space-y-1 max-h-24 sm:max-h-28 overflow-y-auto scrollbar-hide">
                     {(() => {
                       console.log(`SeriesGrid - Series ${item.id} (${item.title}): latest_chapter=${item.latest_chapter}`);
                       // Always show some locked chapters to entice users to sign up and buy
                       const latestChapter = item.latest_chapter || 3; // Default to chapter 3 if no data
                       const chaptersToShow = [];
                       
                       for (let i = latestChapter; i >= Math.max(1, latestChapter - 2); i--) {
                         chaptersToShow.push({
                           number: i,
                           isLocked: true, // Always show as locked to encourage purchases
                           title: `Chapter ${i}`
                         });
                       }

                       return chaptersToShow.map(chapter => (
                         <ChapterAccessHandler
                           key={chapter.number}
                           chapterId={`${item.id}-${chapter.number}`}
                           chapterTitle={`Chapter ${chapter.number}`}
                           isLocked={chapter.isLocked}
                           onAccess={() => navigate(`/series/${item.id}/chapter/${chapter.number}`)}
                         >
                           <div className={`flex items-center justify-between px-2 py-1 sm:px-2.5 sm:py-1.5 rounded text-[10px] sm:text-xs transition-all hover:scale-[1.02] cursor-pointer bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white`}>
                             <span className="flex items-center gap-1">
                               <span className="font-medium">Ch.{chapter.number}</span>
                             </span>
                             <div className="flex items-center gap-1">
                               {chapter.isLocked && <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-400" />}
                               <span className="text-[9px] sm:text-[10px] opacity-80 font-medium">
                                 {new Date(Date.now() - (latestChapter - chapter.number) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                               </span>
                             </div>
                           </div>
                         </ChapterAccessHandler>
                       ));
                     })()}
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {renderPagination()}
    </div>
  );
};