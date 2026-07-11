import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SEOHelmet from '@/components/SEOHelmet';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { BlogPostCard } from '@/components/homepage/BlogPostCard';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const Blog = () => {
  const { slug } = useParams();
  const { posts, loading } = useBlogPosts(20);

  // If accessing a specific blog post
  if (slug) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHelmet 
          title={`Blog Post - Zax Million`}
          description="Read our latest blog post"
        />
        <AnimatedBackground />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Blog Post Coming Soon</h2>
              <p className="text-muted-foreground">
                Individual blog post pages will be implemented in a future update.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Blog listing page
  return (
    <div className="min-h-screen bg-background">
      <SEOHelmet 
        title="Blog - Zax Million"
        description="Latest news, updates, and insights from Zax Million"
      />
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Blog</h1>
          <p className="text-muted-foreground">Latest news, updates, and insights</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No Blog Posts Yet</h2>
              <p className="text-muted-foreground">Check back later for updates!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Blog;