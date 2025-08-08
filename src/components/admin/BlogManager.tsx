import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Save, 
  Trash2, 
  Edit3,
  Eye,
  Calendar,
  Tag,
  Image,
  FileText,
  Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  featured_image_url: string;
  status: 'draft' | 'published';
  published_at: string;
  view_count: number;
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export const BlogManager = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []).map(post => ({
        ...post,
        status: post.status as 'draft' | 'published'
      })));
    } catch (err) {
      console.error('Error loading blog posts:', err);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewPost = () => {
    const newPost: BlogPost = {
      id: '',
      title: '',
      excerpt: '',
      content: '',
      slug: '',
      featured_image_url: '',
      status: 'draft',
      published_at: new Date().toISOString(),
      view_count: 0,
      tags: [],
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSelectedPost(newPost);
    setShowEditor(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSave = async () => {
    if (!selectedPost) return;

    try {
      setSaving(true);

      // Auto-generate slug if empty
      if (!selectedPost.slug && selectedPost.title) {
        selectedPost.slug = generateSlug(selectedPost.title);
      }

      const postData = {
        title: selectedPost.title,
        excerpt: selectedPost.excerpt,
        content: selectedPost.content,
        slug: selectedPost.slug,
        featured_image_url: selectedPost.featured_image_url,
        status: selectedPost.status,
        published_at: selectedPost.status === 'published' ? 
          (selectedPost.published_at || new Date().toISOString()) : 
          selectedPost.published_at,
        tags: selectedPost.tags,
        meta_title: selectedPost.meta_title,
        meta_description: selectedPost.meta_description,
        meta_keywords: selectedPost.meta_keywords,
      };

      if (selectedPost.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', selectedPost.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert(postData)
          .select()
          .single();
        if (error) throw error;
        setSelectedPost(prev => prev ? { ...prev, id: data.id } : null);
      }

      toast({
        title: "Success",
        description: "Blog post saved successfully"
      });

      await loadPosts();
    } catch (err) {
      console.error('Error saving blog post:', err);
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post deleted successfully"
      });

      await loadPosts();
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
        setShowEditor(false);
      }
    } catch (err) {
      console.error('Error deleting blog post:', err);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive"
      });
    }
  };

  const addTag = () => {
    if (newTag && selectedPost && !selectedPost.tags.includes(newTag)) {
      setSelectedPost(prev => prev ? {
        ...prev,
        tags: [...prev.tags, newTag]
      } : null);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    if (selectedPost) {
      setSelectedPost(prev => prev ? {
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      } : null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Blog Manager</h2>
          <p className="text-muted-foreground">Create and manage blog articles</p>
        </div>
        <Button onClick={createNewPost} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Article
        </Button>
      </div>

      {/* Blog Posts List */}
      {!showEditor && (
        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle>All Articles ({posts.length})</CardTitle>
            <CardDescription>Manage your blog posts and articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Featured Image */}
                  <div className="w-12 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Post Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate text-sm md:text-base">{post.title}</h3>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.view_count} views
                      </div>
                      {post.tags.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {post.tags.slice(0, 2).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPost(post);
                        setShowEditor(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No blog posts found. Create your first article to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blog Post Editor */}
      {showEditor && selectedPost && (
        <>
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditor(false);
                setSelectedPost(null);
              }}
            >
              ← Back to Articles
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Article"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Article Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={selectedPost.title}
                      onChange={(e) => setSelectedPost(prev => prev ? { ...prev, title: e.target.value } : null)}
                      placeholder="Enter article title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={selectedPost.slug}
                      onChange={(e) => setSelectedPost(prev => prev ? { ...prev, slug: e.target.value } : null)}
                      placeholder="article-url-slug"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={selectedPost.excerpt}
                      onChange={(e) => setSelectedPost(prev => prev ? { ...prev, excerpt: e.target.value } : null)}
                      placeholder="Brief description of the article..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={selectedPost.content}
                      onChange={(e) => setSelectedPost(prev => prev ? { ...prev, content: e.target.value } : null)}
                      placeholder="Article content (HTML supported)..."
                      rows={12}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing */}
              <Card>
                <CardHeader>
                  <CardTitle>Publishing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={selectedPost.status}
                      onValueChange={(value: 'draft' | 'published') => 
                        setSelectedPost(prev => prev ? { ...prev, status: value } : null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featured-image">Featured Image URL</Label>
                    <Input
                      id="featured-image"
                      value={selectedPost.featured_image_url}
                      onChange={(e) => setSelectedPost(prev => prev ? { ...prev, featured_image_url: e.target.value } : null)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag..."
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* SEO */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta-title">Meta Title</Label>
                    <Input
                      id="meta-title"
                      value={selectedPost.meta_title || ''}
                      onChange={(e) => setSelectedPost(prev => prev ? { ...prev, meta_title: e.target.value } : null)}
                      placeholder="SEO title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta-description">Meta Description</Label>
                    <Textarea
                      id="meta-description"
                      value={selectedPost.meta_description || ''}
                      onChange={(e) => setSelectedPost(prev => prev ? { ...prev, meta_description: e.target.value } : null)}
                      placeholder="SEO description..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};