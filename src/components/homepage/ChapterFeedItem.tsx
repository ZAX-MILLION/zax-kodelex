import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/LazyImage';
import { Clock, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { ChapterFeedItem as ChapterFeedItemType } from '@/hooks/useChaptersFeed';
import { getFallbackCoverImage } from '@/utils/imageOptimization';
interface ChapterFeedItemProps {
  chapter: ChapterFeedItemType;
}
export const ChapterFeedItem = ({
  chapter
}: ChapterFeedItemProps) => {
  const fallbackImage = getFallbackCoverImage(chapter.series_id);
  return <Link to={`/reader/${chapter.series_id}/${chapter.chapter_number}`} className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:bg-accent/50 transition-colors group min-w-0">
      {/* Series Cover */}
      

      {/* Chapter Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-xs">
            Chapter {chapter.chapter_number}
          </Badge>
          <Badge variant="outline" className="text-xs">
            New
          </Badge>
          {chapter.is_locked && (
            <Badge className="text-xs flex items-center gap-1 bg-rose-700 text-white hover:bg-rose-700 border-0">
              <Lock className="w-3 h-3" /> Locked
            </Badge>
          )}
        </div>
        
        <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
          {chapter.series_title}
        </h3>
        
        {chapter.chapter_title && chapter.chapter_title !== `Chapter ${chapter.chapter_number}` && <p className="text-xs text-muted-foreground truncate mt-1">
            {chapter.chapter_title}
          </p>}
      </div>

      {/* Timestamp */}
      <div className="flex-shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>{formatDistanceToNow(new Date(chapter.created_at), {
          addSuffix: true
        })}</span>
      </div>
    </Link>;
};