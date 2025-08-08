import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image_url: string;
  slug: string;
  published_at: string;
  view_count: number;
  tags: string[];
}

export const useBlogPosts = (limit = 6) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, featured_image_url, slug, published_at, view_count, tags')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedPosts: BlogPost[] = data?.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || '',
        featured_image_url: post.featured_image_url || '',
        slug: post.slug,
        published_at: post.published_at,
        view_count: post.view_count || 0,
        tags: post.tags || []
      })) || [];

      setPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, [limit]);

  return { posts, loading, refreshPosts: fetchBlogPosts };
};