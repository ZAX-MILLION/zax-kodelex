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

  const [featured, ...rest] = posts;

  if (loading) {
    return (
      <section className="w-full container mx-auto px-4 sm:px-6 lg:px-8 py-10" aria-busy="true">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">From the journal</h2>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-56 rounded-2xl bg-muted" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!posts.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="home-blog-heading"
      className="w-full container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 id="home-blog-heading" className="text-2xl sm:text-3xl font-bold">
              From the journal
            </h2>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Platform notes, membership clarity, and product updates from Zax Million.
          </p>
        </div>
        <Button variant="outline" asChild className="w-full sm:w-auto min-h-11">
          <Link to="/blog">
            All articles
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {featured && <BlogPostCard post={featured} featured />}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
