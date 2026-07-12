import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Tags, 
  User, 
  MessageCircle, 
  Star, 
  Eye,
  BookOpen,
  Calendar,
  Hash
} from 'lucide-react';
import { useHomepageWidgets, useGenresList, SeriesCard } from '@/hooks/useHomepageData';
import { Link } from 'react-router-dom';
import TrendingSidebar from './TrendingSidebar';
import { CompactMangaCard } from './CompactMangaCard';

interface SidebarWidgetsProps {
  popularSeries?: SeriesCard[];
  trendingSeries?: SeriesCard[];
  className?: string;
}

export const SidebarWidgets = ({ popularSeries = [], trendingSeries = [], className = "" }: SidebarWidgetsProps) => {
  const { widgets, loading } = useHomepageWidgets();
  const { genres } = useGenresList();

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-12 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const renderWidget = (widget: any) => {
    const settings = widget.settings || {};
    const itemsCount = settings.items_count || 5;

    switch (widget.widget_type) {
      case 'popular_this_week':
        return (
          <PopularThisWeekWidget 
            series={popularSeries.slice(0, itemsCount)}
            title={settings.title || widget.widget_name}
          />
        );
      
      case 'genres_list':
        return (
          <GenresListWidget 
            genres={genres.slice(0, itemsCount)}
            title={settings.title || widget.widget_name}
          />
        );
      
      case 'top_authors':
        return (
          <TopAuthorsWidget 
            count={itemsCount}
            title={settings.title || widget.widget_name}
          />
        );
      
      case 'recent_comments':
        return (
          <RecentCommentsWidget 
            count={itemsCount}
            title={settings.title || widget.widget_name}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Trending Sidebar - Always show first */}
      <TrendingSidebar series={trendingSeries} />
      
      {widgets.map((widget) => (
        <div key={widget.id}>
          {renderWidget(widget)}
        </div>
      ))}
    </div>
  );
};

const PopularThisWeekWidget = ({ series, title }: { series: SeriesCard[], title: string }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <TrendingUp className="h-4 w-4 text-primary" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {series.length > 0 ? (
        <>
          {series.map((item, index) => (
            <CompactMangaCard 
              key={item.id} 
              series={item} 
              index={index}
            />
          ))}
          <Button variant="outline" size="sm" className="w-full mt-4" asChild>
            <Link to="/series?sort=trending">View All Popular</Link>
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No popular series this week
        </p>
      )}
    </CardContent>
  </Card>
);

const GenresListWidget = ({ genres, title }: { genres: Array<{ name: string; count: number }>, title: string }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <Tags className="h-4 w-4 text-primary" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {genres.length > 0 ? (
          genres.map((genre) => (
            <Link
              key={genre.name}
              to={`/browse?genre=${encodeURIComponent(genre.name)}`}
              className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors group"
            >
              <span className="text-sm group-hover:text-primary transition-colors">
                {genre.name}
              </span>
              <Badge variant="secondary" className="text-xs">
                {genre.count}
              </Badge>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No genres available
          </p>
        )}
      </div>
      <Button variant="outline" size="sm" className="w-full mt-4" asChild>
        <Link to="/categories">All Genres</Link>
      </Button>
    </CardContent>
  </Card>
);

const TopAuthorsWidget = ({ count, title }: { count: number, title: string }) => {
  // Mock data - in a real app, this would come from the database
  const topAuthors = [
    { name: 'Takeshi Yamamoto', seriesCount: 5, followers: 1200 },
    { name: 'Luna Chen', seriesCount: 3, followers: 890 },
    { name: 'Miyuki Tanaka', seriesCount: 4, followers: 750 },
    { name: 'Marcus Kane', seriesCount: 2, followers: 650 },
    { name: 'Emi Watanabe', seriesCount: 3, followers: 580 }
  ].slice(0, count);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topAuthors.map((author, index) => (
          <div key={author.name}>
            <Link 
              to={`/browse?author=${encodeURIComponent(author.name)}`}
              className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors group"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                {index + 1}
              </div>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {author.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {author.seriesCount} series
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {author.followers}
                  </span>
                </div>
              </div>
            </Link>
            {index < topAuthors.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full mt-4" asChild>
          <Link to="/browse?sort=author">All Authors</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const RecentCommentsWidget = ({ count, title }: { count: number, title: string }) => {
  // Mock data - in a real app, this would come from the comments table
  const recentComments = [
    { 
      id: '1', 
      user: 'MangaFan123', 
      content: 'This chapter was amazing! Can\'t wait for the next one.', 
      seriesTitle: 'Crimson Blade Chronicles',
      timeAgo: '5m ago' 
    },
    { 
      id: '2', 
      user: 'NovelReader', 
      content: 'The character development in this series is incredible.', 
      seriesTitle: 'Digital Hearts',
      timeAgo: '12m ago' 
    },
    { 
      id: '3', 
      user: 'FantasyLover', 
      content: 'Plot twist! Didn\'t see that coming at all.', 
      seriesTitle: 'Dragon\'s Legacy',
      timeAgo: '25m ago' 
    },
    { 
      id: '4', 
      user: 'ActionAddict', 
      content: 'The fight scenes are so well choreographed!', 
      seriesTitle: 'Shadow Hunters',
      timeAgo: '1h ago' 
    },
    { 
      id: '5', 
      user: 'StorySeeker', 
      content: 'This world-building is phenomenal. Love the details.', 
      seriesTitle: 'Mystic Academy',
      timeAgo: '2h ago' 
    }
  ].slice(0, count);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentComments.map((comment, index) => (
          <div key={comment.id}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {comment.user[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{comment.user}</span>
                <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 pl-8">
                {comment.content}
              </p>
              <Link 
                to="/series/1" 
                className="text-xs text-primary hover:underline pl-8 block"
              >
                on {comment.seriesTitle}
              </Link>
            </div>
            {index < recentComments.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}
        <Button variant="outline" size="sm" className="w-full mt-4" asChild>
          <Link to="/browse?sort=recent-comments">All Comments</Link>
        </Button>
      </CardContent>
    </Card>
  );
};