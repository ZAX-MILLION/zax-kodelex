import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Lock, 
  Eye, 
  Calendar, 
  ArrowUpDown,
  Grid3X3,
  List,
  Zap,
  Clock
} from 'lucide-react';
import LazyImage from '@/components/LazyImage';

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  page_count: number;
  release_date: string;
  view_count: number;
  is_locked: boolean;
  thumbnail_url: string;
}

interface FuturisticChapterListProps {
  chapters: Chapter[];
  reverseOrder: boolean;
  onToggleOrder: () => void;
}

const FuturisticChapterList: React.FC<FuturisticChapterListProps> = ({
  chapters,
  reverseOrder,
  onToggleOrder,
}) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const sortedChapters = [...chapters].sort((a, b) => {
    return reverseOrder 
      ? b.chapter_number - a.chapter_number 
      : a.chapter_number - b.chapter_number;
  });

  const handleChapterClick = (chapterId: string) => {
    navigate(`/reader/${chapterId}`);
  };

  if (chapters.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10">
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">No chapters available</h3>
          <p className="text-muted-foreground">Chapters will appear here once they're published.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <Card className="bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-xl border border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">
                  {chapters.length} Chapter{chapters.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3 py-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3 py-2"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Sort Order */}
              <Button
                variant="outline"
                onClick={onToggleOrder}
                className="gap-2 bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10"
              >
                <ArrowUpDown className="h-4 w-4" />
                {reverseOrder ? 'Latest First' : 'Oldest First'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapters Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedChapters.map((chapter, index) => (
            <Card 
              key={chapter.id} 
              className="group bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:scale-105"
              onClick={() => handleChapterClick(chapter.id)}
            >
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
                  <LazyImage
                    src={chapter.thumbnail_url || '/placeholder.svg'}
                    alt={chapter.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      {chapter.is_locked ? (
                        <Lock className="h-8 w-8 text-white" />
                      ) : (
                        <Play className="h-8 w-8 text-white ml-1" />
                      )}
                    </div>
                  </div>
                  
                  {/* Chapter Number Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 font-bold shadow-lg">
                      Ch. {chapter.chapter_number}
                    </Badge>
                  </div>
                  
                  {/* Lock Badge */}
                  {chapter.is_locked && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
                        <Lock className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {chapter.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{chapter.view_count?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(chapter.release_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {chapter.page_count} pages
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedChapters.map((chapter, index) => (
            <Card 
              key={chapter.id}
              className="group bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-xl border border-white/10 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:translate-x-2"
              onClick={() => handleChapterClick(chapter.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Chapter Number */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg">
                      {chapter.chapter_number}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">
                          {chapter.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(chapter.release_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{chapter.view_count?.toLocaleString() || 0} views</span>
                          </div>
                          <span>{chapter.page_count} pages</span>
                        </div>
                      </div>
                      
                      {/* Action Area */}
                      <div className="flex items-center gap-3">
                        {chapter.is_locked && (
                          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-300">
                          {chapter.is_locked ? (
                            <Lock className="h-5 w-5 text-primary" />
                          ) : (
                            <Play className="h-5 w-5 text-primary ml-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FuturisticChapterList;