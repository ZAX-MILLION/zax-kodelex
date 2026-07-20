import { Link, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import { BlogPostCard } from '@/components/homepage/BlogPostCard';
import { BlogArticle } from '@/components/blog/BlogArticle';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { appConfig } from '@/config/env';
import { LoadingState } from '@/components/LoadingSpinner';

const Blog = () => {
  const { slug } = useParams();
  const { posts, loading } = useBlogPosts(20);

  if (slug) {
    return <BlogArticle slug={slug} />;
  }

  const [featured, ...rest] = posts;

  return (
    <div className="min-h-screen bg-background">
      <EnhancedSEOHelmet
        title="Blog — Zax Million"
        description="Platform news, membership guides, and product updates from Zax Million."
        noindex={appConfig.shouldNoIndex}
      />

      <div className="relative overflow-hidden border-b border-border/40">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 15% 0%, hsl(25 95% 53% / 0.16), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 10%, hsl(210 100% 60% / 0.1), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/90 mb-3">Journal</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Zax Million Blog</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
            Product updates, membership clarity, and platform notes — written for readers and
            operators evaluating the experience.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <LoadingState message="Loading articles…" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">No articles yet</h2>
            <p className="text-muted-foreground">Check back soon for platform updates.</p>
            <Button asChild variant="outline" className="min-h-11">
              <Link to="/">
                Back home
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {featured && <BlogPostCard post={featured} featured />}
            {rest.length > 0 && (
              <section aria-labelledby="more-articles-heading" className="space-y-6">
                <h2 id="more-articles-heading" className="text-xl sm:text-2xl font-bold">
                  More articles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                  {rest.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
