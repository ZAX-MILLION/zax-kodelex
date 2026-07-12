import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import LazyImage from '@/components/LazyImage';
import { CalendarDays, Clock, Eye } from 'lucide-react';

interface ArticleData {
  id: string;
  title: string;
  content: string;
  category: string;
  publishedDate: string;
  readTime: string;
  views: number;
  author: string;
  image: string;
  tags: string[];
}

const Article = () => {
  const { id } = useParams<{ id: string }>();

  // Mock article data - in a real app, this would be fetched from the database
  const getArticleData = (articleId: string): ArticleData => {
    const articles: { [key: string]: ArticleData } = {
      '1': {
        id: '1',
        title: 'Top 10 Manga Series Coming This Season',
        content: `
          <p>As we enter the new season, manga enthusiasts have a lot to look forward to. From highly anticipated adaptations to fresh original stories, here are the top 10 manga series that are set to make waves this season.</p>
          
          <h2>1. Dragon Slayer Chronicles</h2>
          <p>A epic fantasy adventure following a young warrior's quest to defeat ancient dragons threatening the realm. With stunning artwork and compelling character development, this series promises to be a standout.</p>
          
          <h2>2. Space Pirate Captain</h2>
          <p>Set in a futuristic galaxy, this sci-fi adventure combines humor, action, and incredible world-building. Follow Captain Zara as she navigates through space battles and political intrigue.</p>
          
          <h2>3. Cherry Blossom Romance</h2>
          <p>A heartwarming romance set in modern-day Tokyo, exploring the delicate relationship between two college students during cherry blossom season.</p>
          
          <h2>4. Shadow Ninja Academy</h2>
          <p>Dark, intense action manga featuring young ninjas training in ancient arts while facing modern threats. The artwork is particularly noteworthy for its detailed fight scenes.</p>
          
          <h2>5. Mecha Warriors United</h2>
          <p>Giant robot battles meet political drama in this sophisticated mecha series that doesn't shy away from complex themes and moral ambiguity.</p>
          
          <p>These series represent just a fraction of the incredible content coming this season. Each offers something unique, whether you're into action, romance, sci-fi, or fantasy.</p>
          
          <p>Stay tuned for more detailed reviews of each series as they premiere!</p>
        `,
        category: 'Featured',
        publishedDate: '2025-01-15',
        readTime: '5 min read',
        views: 15420,
        author: 'Manga Editorial Team',
        image: '/manga-covers/crimson-blade-cover.jpg',
        tags: ['Seasonal Preview', 'Recommendations', 'New Releases']
      },
      '2': {
        id: '2',
        title: 'The Art of Manga Storytelling',
        content: `
          <p>Manga storytelling is a unique art form that combines visual narrative with traditional storytelling techniques. Understanding these elements can enhance your appreciation of the medium.</p>
          
          <h2>Visual Pacing</h2>
          <p>Unlike other comic formats, manga uses a specific pacing that guides the reader's eye through panels in a particular rhythm. This creates tension, emotion, and narrative flow.</p>
          
          <h2>Character Development</h2>
          <p>Japanese manga excels at deep character development, often spanning hundreds of chapters to fully explore a character's growth and transformation.</p>
          
          <h2>Cultural Context</h2>
          <p>Many manga series incorporate elements of Japanese culture, history, and social issues, providing readers with insights into Japanese society.</p>
          
          <p>Whether you're a casual reader or a serious manga enthusiast, understanding these storytelling elements will deepen your appreciation for this incredible medium.</p>
        `,
        category: 'Analysis',
        publishedDate: '2025-01-10',
        readTime: '7 min read',
        views: 8930,
        author: 'Sarah Chen',
        image: '/manga-covers/mystic-academy-cover.jpg',
        tags: ['Analysis', 'Storytelling', 'Culture']
      }
    };

    return articles[articleId] || {
      id: articleId || '1',
      title: 'Article Not Found',
      content: '<p>The requested article could not be found.</p>',
      category: 'Error',
      publishedDate: new Date().toISOString().split('T')[0],
      readTime: '1 min read',
      views: 0,
      author: 'System',
      image: '/manga-covers/crimson-blade-cover.jpg',
      tags: []
    };
  };

  const article = getArticleData(id || '1');

  return (
    <>
      <EnhancedSEOHelmet 
        title={`${article.title} - Zax Million`}
        description={article.content.replace(/<[^>]*>/g, '').substring(0, 160)}
        keywords={['manga', 'article', ...article.tags].join(', ')}
        image={`${window.location.origin}${article.image}`}
        type="article"
        author={article.author}
        publishedTime={article.publishedDate}
        section={article.category}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Article Header */}
          <Card className="mb-8 overflow-hidden">
            <div className="relative h-64 md:h-96">
              <LazyImage 
                src={article.image} 
                alt={article.title}
                className="w-full h-full object-cover"
                width={800}
                height={400}
                fill={true}
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <Badge variant="secondary" className="mb-2">
                  {article.category}
                </Badge>
                <h1 className="text-2xl md:text-4xl font-bold mb-2">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {new Date(article.publishedDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {article.views.toLocaleString()} views
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Article Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">By {article.author}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </CardContent>
          </Card>

          {/* Related Articles */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Related Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <h3 className="font-semibold mb-2">Manga Reading Tips for Beginners</h3>
                  <p className="text-sm text-muted-foreground">Essential guide for new manga readers...</p>
                </div>
                <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <h3 className="font-semibold mb-2">Understanding Manga Genres</h3>
                  <p className="text-sm text-muted-foreground">A comprehensive breakdown of manga categories...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Article;