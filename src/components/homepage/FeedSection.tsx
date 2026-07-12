import { useChaptersFeed } from '@/hooks/useChaptersFeed';
import { ChapterFeedItem } from './ChapterFeedItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, TrendingUp } from 'lucide-react';
import { useHomepageSettings } from '@/hooks/useHomepageData';

export const FeedSection = () => {
  const { settings } = useHomepageSettings();
  const feedCount = settings?.feed_chapters_count || 10;
  const { chapters, loading } = useChaptersFeed(30, feedCount);

  if (loading) {
    return (
      <section className="w-full">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Latest Updates</h2>
          </div>
          <p className="text-muted-foreground text-sm">Fresh chapters from the past 30 days</p>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg animate-pulse">
                  <div className="w-12 h-16 bg-muted rounded-md" />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="h-4 w-16 bg-muted rounded" />
                      <div className="h-4 w-12 bg-muted rounded" />
                    </div>
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!chapters.length) {
    return (
      <section className="w-full">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Latest Updates</h2>
          </div>
          <p className="text-muted-foreground text-sm">Fresh chapters from the past 30 days</p>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No new chapters in the past 30 days</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Latest Updates</h2>
        </div>
        <p className="text-muted-foreground text-sm">Fresh chapters from the past 30 days</p>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <ChapterFeedItem key={chapter.chapter_id} chapter={chapter} />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  );
};