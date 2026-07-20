import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { BlogPost } from '@/hooks/useBlogPosts';

interface BlogPostCardProps {
  post: BlogPost;
  featured?: boolean;
}

export const BlogPostCard = ({ post, featured = false }: BlogPostCardProps) => {
  const imageAlt = post.featured_image_alt || post.title;

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40">
        <Link
          to={`/blog/${post.slug}`}
          className="grid grid-cols-1 md:grid-cols-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[280px] overflow-hidden bg-muted">
            {post.featured_image_url ? (
              <img
                src={post.featured_image_url}
                alt={imageAlt}
                width={800}
                height={500}
                loading="eager"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:transform-none"
              />
            ) : (
              <div
                className="h-full w-full bg-gradient-to-br from-primary/30 via-background to-manga-blue/20"
                aria-hidden
              />
            )}
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {post.category && <Badge variant="secondary">{post.category}</Badge>}
              <Badge variant="outline">Featured</Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-muted-foreground leading-relaxed line-clamp-3">{post.excerpt}</p>
            )}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" aria-hidden />
                {format(new Date(post.published_at), 'MMM d, yyyy')}
              </span>
              {post.reading_time_minutes ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {post.reading_time_minutes} min read
                </span>
              ) : null}
              {post.author ? <span>{post.author}</span> : null}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group h-full">
      <Link
        to={`/blog/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/30 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {post.featured_image_url ? (
            <img
              src={post.featured_image_url}
              alt={imageAlt}
              width={640}
              height={400}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:transform-none"
            />
          ) : (
            <div
              className="h-full w-full bg-gradient-to-br from-primary/25 via-background to-muted"
              aria-hidden
            />
          )}
          {post.category && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="text-xs">
                {post.category}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-3">
          <h3 className="text-lg font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{post.excerpt}</p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden />
              {format(new Date(post.published_at), 'MMM d, yyyy')}
            </span>
            {post.reading_time_minutes ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                {post.reading_time_minutes} min
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
};
