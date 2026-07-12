import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/LazyImage';
import { Eye, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { BlogPost } from '@/hooks/useBlogPosts';

interface BlogPostCardProps {
  post: BlogPost;
}

export const BlogPostCard = ({ post }: BlogPostCardProps) => {
  const fallbackImage = `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=240&fit=crop`;

  return (
    <Link to={`/blog/${post.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Featured Image */}
        <div className="relative h-48 overflow-hidden">
          <LazyImage
            src={post.featured_image_url || fallbackImage}
            alt={post.title}
            fill={true}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            errorFallback={
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">No Image</span>
              </div>
            }
          />
          
          {/* Tags Overlay */}
          {post.tags && post.tags.length > 0 && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="text-xs">
                {post.tags[0]}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {post.excerpt}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{post.view_count}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};