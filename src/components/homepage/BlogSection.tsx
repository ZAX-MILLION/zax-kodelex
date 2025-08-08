import { useBlogPosts } from '@/hooks/useBlogPosts';
import { BlogPostCard } from './BlogPostCard';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHomepageSettings } from '@/hooks/useHomepageData';

export const BlogSection = () => {
  const { settings } = useHomepageSettings();
  const blogCount = settings?.blog_posts_count || 6;
  const { posts, loading } = useBlogPosts(blogCount);

  if (loading) {
    return (
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Latest Articles</h2>
            </div>
            <p className="text-muted-foreground">Stay updated with our latest news and insights</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/blog">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-48 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="flex justify-between">
                  <div className="h-3 bg-muted rounded w-16" />
                  <div className="h-3 bg-muted rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!posts.length) {
    return (
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Latest Articles</h2>
            </div>
            <p className="text-muted-foreground">Stay updated with our latest news and insights</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No blog posts available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Latest Articles</h2>
          </div>
          <p className="text-muted-foreground">Stay updated with our latest news and insights</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/blog">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};