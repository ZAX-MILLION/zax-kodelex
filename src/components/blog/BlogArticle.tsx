import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import { BlogPostCard } from '@/components/homepage/BlogPostCard';
import { useBlogPost } from '@/hooks/useBlogPosts';
import { appConfig } from '@/config/env';
import { LoadingState } from '@/components/LoadingSpinner';

interface BlogArticleProps {
  slug: string;
}

export function BlogArticle({ slug }: BlogArticleProps) {
  const { post, related, loading, notFound } = useBlogPost(slug);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingState message="Opening article…" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-2xl text-center space-y-6">
        <EnhancedSEOHelmet
          title="Article not found | Zax Million"
          description="This blog article is not available."
          noindex={appConfig.shouldNoIndex}
        />
        <h1 className="text-2xl sm:text-3xl font-bold">Article not found</h1>
        <p className="text-muted-foreground">
          That slug does not match a published article in this environment.
        </p>
        <Button asChild className="min-h-11">
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to blog
          </Link>
        </Button>
      </div>
    );
  }

  const paragraphs = (post.content || post.excerpt || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="pb-16">
      <EnhancedSEOHelmet
        title={post.seo_title || `${post.title} | Zax Million`}
        description={post.seo_description || post.excerpt}
        image={post.featured_image_url}
        type="article"
        author={post.author}
        publishedTime={post.published_at}
        tags={post.tags}
        noindex={appConfig.shouldNoIndex}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.seo_description || post.excerpt,
          image: post.featured_image_url,
          datePublished: post.published_at,
          author: {
            '@type': 'Person',
            name: post.author || 'ZAX MILLION',
          },
        }}
      />

      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button variant="ghost" asChild className="min-h-11 -ml-2 mb-4">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to blog
            </Link>
          </Button>

          <header className="max-w-3xl space-y-4">
            <div className="flex flex-wrap gap-2">
              {post.category && <Badge variant="secondary">{post.category}</Badge>}
              {post.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" aria-hidden />
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {post.author && <span>{post.author}</span>}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" aria-hidden />
                {format(new Date(post.published_at), 'MMMM d, yyyy')}
              </span>
              {post.reading_time_minutes ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden />
                  {post.reading_time_minutes} min read
                </span>
              ) : null}
            </div>
          </header>
        </div>
      </div>

      {post.featured_image_url && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-border/40 aspect-[16/9] bg-muted">
            <img
              src={post.featured_image_url}
              alt={post.featured_image_alt || post.title}
              width={1200}
              height={675}
              loading="eager"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-5 text-base sm:text-[1.05rem] leading-relaxed text-foreground/95">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {appConfig.isDemo && (
          <aside className="max-w-2xl mx-auto mt-10 rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold">Explore the live demo</h2>
            <p className="text-sm text-muted-foreground">
              Jump into a featured series, open a free sample chapter, or try Role Lab personas.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <Button asChild className="min-h-11">
                <Link to="/series/00000000-0000-4000-a000-000000000001">
                  Featured series
                </Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11">
                <Link to="/reader/00000000-0000-4000-a000-000000000001/1">
                  Read sample chapter
                </Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11">
                <Link to="/demo">Role Lab</Link>
              </Button>
              <Button asChild variant="ghost" className="min-h-11">
                <Link to="/premium">Membership preview</Link>
              </Button>
              <Button asChild variant="ghost" className="min-h-11">
                <Link to="/demo/uploader">Uploader simulation</Link>
              </Button>
            </div>
          </aside>
        )}
      </div>

      {related.length > 0 && (
        <section
          aria-labelledby="related-heading"
          className="container mx-auto px-4 sm:px-6 lg:px-8 mt-14 pt-10 border-t border-border/40"
        >
          <h2 id="related-heading" className="text-xl sm:text-2xl font-bold mb-6">
            Related articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {related.map((item) => (
              <BlogPostCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
