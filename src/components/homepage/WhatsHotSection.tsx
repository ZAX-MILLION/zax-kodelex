import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Star, TrendingUp } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import { Link } from 'react-router-dom';

interface HotArticle {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  readTime?: string;
  views?: number;
  isNew?: boolean;
}

interface WhatsHotSectionProps {
  articles?: HotArticle[];
}

export const WhatsHotSection = ({ articles = [] }: WhatsHotSectionProps) => {
  // Mock data for demonstration
  const mockArticles: HotArticle[] = [
    {
      id: '1',
      title: 'Top 10 Manga Series Coming This Season',
      description: 'Discover the most anticipated manga releases this season...',
      image: '/src/assets/manga-covers/crimson-blade-cover.jpg',
      category: 'Trends',
      readTime: '5 min read',
      views: 12500,
      isNew: true
    },
    {
      id: '2', 
      title: 'Behind the Scenes: Scanlation Process',
      description: 'Learn about the detailed process of manga translation...',
      image: '/src/assets/manga-covers/dragons-legacy-cover.jpg',
      category: 'Behind the Scenes',
      readTime: '8 min read',
      views: 8300
    },
    {
      id: '3',
      title: 'Interview with Popular Mangaka',
      description: 'Exclusive interview with one of today\'s rising stars...',
      image: '/src/assets/manga-covers/mystic-academy-cover.jpg',
      category: 'Interviews',
      readTime: '12 min read',
      views: 15600
    },
    {
      id: '4',
      title: 'Manga Industry Trends 2024',
      description: 'Analyzing the latest trends in manga publishing...',
      image: '/src/assets/manga-cover.jpg',
      category: 'Analysis',
      readTime: '10 min read',
      views: 9800
    },
    {
      id: '5',
      title: 'Community Spotlight: Fan Art',
      description: 'Showcasing amazing fan artwork from our community...',
      image: '/src/assets/hero-bg.jpg',
      category: 'Community',
      readTime: '6 min read',
      views: 7200
    },
    {
      id: '6',
      title: 'New Website Features Update',
      description: 'Check out the latest improvements to our platform...',
      image: '/src/assets/reader-bg.jpg',
      category: 'Updates',
      readTime: '4 min read',
      views: 11100,
      isNew: true
    }
  ];

  const displayArticles = articles.length > 0 ? articles : mockArticles;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">What's Hot</h2>
        </div>
        <Button variant="outline" asChild>
          <Link to="/news">
            View All Articles
          </Link>
        </Button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayArticles.map((article) => (
          <Card key={article.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <Link to={`/article/${article.id}`} className="block">
              <div className="relative aspect-[16/9] overflow-hidden">
                <LazyImage
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Category badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
                    {article.category}
                  </Badge>
                </div>

                {/* New badge */}
                {article.isNew && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary text-primary-foreground">
                      New
                    </Badge>
                  </div>
                )}

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg line-clamp-2 group-hover:text-primary-foreground transition-colors">
                    {article.title}
                  </h3>
                </div>
              </div>

              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    {article.readTime && (
                      <span>{article.readTime}</span>
                    )}
                    {article.views && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Star className="h-3 w-3" />
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};