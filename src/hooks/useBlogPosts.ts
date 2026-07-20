import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { appConfig } from '@/config/env';
import { useToast } from '@/hooks/use-toast';
import {
  getDemoBlogPostBySlug,
  getRelatedDemoBlogPosts,
  listDemoBlogPosts,
  type DemoBlogPost,
} from '@/features/demo/data/demoBlogPosts';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image_url: string;
  featured_image_alt?: string;
  slug: string;
  published_at: string;
  view_count: number;
  tags: string[];
  category?: string;
  author?: string;
  reading_time_minutes?: number;
  content?: string;
  seo_title?: string;
  seo_description?: string;
}

function mapDemoPost(post: DemoBlogPost): BlogPost {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    featured_image_url: post.featured_image_url,
    featured_image_alt: post.featured_image_alt,
    slug: post.slug,
    published_at: post.published_at,
    view_count: post.view_count,
    tags: post.tags,
    category: post.category,
    author: post.author,
    reading_time_minutes: post.reading_time_minutes,
    content: post.content,
    seo_title: post.seo_title,
    seo_description: post.seo_description,
  };
}

function shouldUseDemoBlog(): boolean {
  return appConfig.isDemo || !appConfig.features.blogDatabase || !isSupabaseConfigured;
}

export const useBlogPosts = (limit = 6) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlogPosts = useCallback(async () => {
    try {
      setLoading(true);

      if (shouldUseDemoBlog()) {
        setPosts(listDemoBlogPosts(limit).map(mapDemoPost));
        return;
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, featured_image_url, slug, published_at, view_count, tags')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedPosts: BlogPost[] =
        data?.map((post) => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || '',
          featured_image_url: post.featured_image_url || '',
          slug: post.slug,
          published_at: post.published_at || '',
          view_count: post.view_count || 0,
          tags: post.tags || [],
        })) || [];

      setPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      // Never toast in demo / offline showcase paths
      if (!shouldUseDemoBlog() && appConfig.features.blogDatabase) {
        toast({
          title: 'Error',
          description: 'Failed to load blog posts',
          variant: 'destructive',
        });
        setPosts([]);
      } else {
        setPosts(listDemoBlogPosts(limit).map(mapDemoPost));
      }
    } finally {
      setLoading(false);
    }
  }, [limit, toast]);

  useEffect(() => {
    void fetchBlogPosts();
  }, [fetchBlogPosts]);

  return { posts, loading, refreshPosts: fetchBlogPosts };
};

export const useBlogPost = (slug: string | undefined) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!slug) {
        setPost(null);
        setRelated([]);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotFound(false);

      try {
        if (shouldUseDemoBlog()) {
          const demo = getDemoBlogPostBySlug(slug);
          if (!demo) {
            if (!cancelled) {
              setPost(null);
              setRelated([]);
              setNotFound(true);
            }
            return;
          }
          if (!cancelled) {
            setPost(mapDemoPost(demo));
            setRelated(getRelatedDemoBlogPosts(slug).map(mapDemoPost));
            setNotFound(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from('blog_posts')
          .select(
            'id, title, excerpt, content, featured_image_url, slug, published_at, view_count, tags, seo_title, seo_description'
          )
          .eq('status', 'published')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          if (!cancelled) {
            setPost(null);
            setRelated([]);
            setNotFound(true);
          }
          return;
        }

        if (!cancelled) {
          setPost({
            id: data.id,
            title: data.title,
            excerpt: data.excerpt || '',
            content: data.content || '',
            featured_image_url: data.featured_image_url || '',
            slug: data.slug,
            published_at: data.published_at || '',
            view_count: data.view_count || 0,
            tags: data.tags || [],
            seo_title: data.seo_title || data.title,
            seo_description: data.seo_description || data.excerpt || '',
          });
          setNotFound(false);

          const { data: relatedRows } = await supabase
            .from('blog_posts')
            .select('id, title, excerpt, featured_image_url, slug, published_at, view_count, tags')
            .eq('status', 'published')
            .neq('slug', slug)
            .order('published_at', { ascending: false })
            .limit(3);

          setRelated(
            (relatedRows || []).map((row) => ({
              id: row.id,
              title: row.title,
              excerpt: row.excerpt || '',
              featured_image_url: row.featured_image_url || '',
              slug: row.slug,
              published_at: row.published_at || '',
              view_count: row.view_count || 0,
              tags: row.tags || [],
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        if (shouldUseDemoBlog()) {
          const demo = getDemoBlogPostBySlug(slug);
          if (!cancelled) {
            if (demo) {
              setPost(mapDemoPost(demo));
              setRelated(getRelatedDemoBlogPosts(slug).map(mapDemoPost));
              setNotFound(false);
            } else {
              setPost(null);
              setNotFound(true);
            }
          }
        } else {
          if (!cancelled) {
            toast({
              title: 'Error',
              description: 'Failed to load blog post',
              variant: 'destructive',
            });
            setPost(null);
            setNotFound(true);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug, toast]);

  return { post, related, loading, notFound };
};
