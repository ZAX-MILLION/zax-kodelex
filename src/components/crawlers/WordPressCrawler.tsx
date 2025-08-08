import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Globe, 
  Download, 
  FileText, 
  Image, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Upload,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CrawledPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  date: string;
  categories: string[];
  tags: string[];
  featured_image: string;
  url: string;
  status: 'draft' | 'published';
}

interface CrawlResults {
  posts: CrawledPost[];
  totalFound: number;
  successCount: number;
  errorCount: number;
  status: 'idle' | 'crawling' | 'processing' | 'complete' | 'error';
}

export const WordPressCrawler: React.FC = () => {
  const { toast } = useToast();
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [crawlResults, setCrawlResults] = useState<CrawlResults>({
    posts: [],
    totalFound: 0,
    successCount: 0,
    errorCount: 0,
    status: 'idle'
  });
  const [progress, setProgress] = useState(0);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [importSettings, setImportSettings] = useState({
    defaultGenre: 'Novel',
    defaultStatus: 'ongoing',
    createSeries: true,
    chapterPerPost: true
  });

  const validateWebsiteUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const startCrawling = async () => {
    if (!websiteUrl || !validateWebsiteUrl(websiteUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive"
      });
      return;
    }

    setCrawlResults(prev => ({ ...prev, status: 'crawling' }));
    setProgress(0);

    try {
      // Simulate crawling with Firecrawl API
      // In a real implementation, this would call the Firecrawl API
      setProgress(25);
      
      // Simulate finding posts
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(50);
      
      // Mock crawled data
      const mockPosts: CrawledPost[] = [
        {
          id: '1',
          title: 'Chapter 1: The Beginning',
          content: '<p>This is the first chapter of our story...</p>',
          excerpt: 'The beginning of an epic tale',
          author: 'John Doe',
          date: '2024-01-15',
          categories: ['Fantasy', 'Adventure'],
          tags: ['novel', 'fantasy', 'adventure'],
          featured_image: 'https://example.com/image1.jpg',
          url: `${websiteUrl}/chapter-1`,
          status: 'published'
        },
        {
          id: '2',
          title: 'Chapter 2: The Journey Continues',
          content: '<p>Our hero embarks on their quest...</p>',
          excerpt: 'The adventure begins',
          author: 'John Doe',
          date: '2024-01-20',
          categories: ['Fantasy', 'Adventure'],
          tags: ['novel', 'fantasy', 'quest'],
          featured_image: 'https://example.com/image2.jpg',
          url: `${websiteUrl}/chapter-2`,
          status: 'published'
        }
      ];

      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCrawlResults({
        posts: mockPosts,
        totalFound: mockPosts.length,
        successCount: mockPosts.length,
        errorCount: 0,
        status: 'complete'
      });
      
      setProgress(100);
      
      toast({
        title: "Crawling Complete",
        description: `Successfully crawled ${mockPosts.length} posts`,
      });

    } catch (error) {
      console.error('Crawling error:', error);
      setCrawlResults(prev => ({ ...prev, status: 'error' }));
      toast({
        title: "Crawling Failed",
        description: "Failed to crawl the website. Please try again.",
        variant: "destructive"
      });
    }
  };

  const togglePostSelection = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const selectAllPosts = () => {
    setSelectedPosts(new Set(crawlResults.posts.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedPosts(new Set());
  };

  const importSelectedPosts = async () => {
    if (selectedPosts.size === 0) {
      toast({
        title: "No posts selected",
        description: "Please select posts to import",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedPostsData = crawlResults.posts.filter(p => selectedPosts.has(p.id));
      
      // Create series if needed
      if (importSettings.createSeries) {
        const seriesTitle = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        const { data: series, error: seriesError } = await supabase
          .from('manga_meta')
          .insert({
            title: seriesTitle,
            description: `Imported from ${websiteUrl}`,
            author: selectedPostsData[0]?.author || 'Unknown',
            status: importSettings.defaultStatus as 'ongoing' | 'completed' | 'hiatus',
            genres: [importSettings.defaultGenre],
            type: 'novel',
            publication_date: new Date().toISOString(),
            age_rating: 'PG-13',
            language: 'en'
          })
          .select()
          .single();

        if (seriesError) throw seriesError;

        // Import chapters
        for (let i = 0; i < selectedPostsData.length; i++) {
          const post = selectedPostsData[i];
          
          const { error: chapterError } = await supabase
            .from('chapters')
            .insert({
              series_id: series.id,
              title: post.title,
              chapter_number: i + 1,
              sort_order: i + 1,
              release_date: post.date,
              is_locked: false,
              page_count: 1, // For novels, we consider each post as 1 "page"
              content: post.content,
              seo_title: post.title,
              seo_description: post.excerpt
            });

          if (chapterError) throw chapterError;
        }
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${selectedPosts.size} posts`,
      });

      // Reset form
      setCrawlResults({
        posts: [],
        totalFound: 0,
        successCount: 0,
        errorCount: 0,
        status: 'idle'
      });
      setSelectedPosts(new Set());
      setProgress(0);

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import selected posts. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">WordPress Crawler</h2>
        <p className="text-muted-foreground">Import novels and content from WordPress websites</p>
      </div>

      {/* Setup Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website Configuration
          </CardTitle>
          <CardDescription>
            Configure the WordPress website you want to crawl for content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website-url">Website URL</Label>
            <Input
              id="website-url"
              type="url"
              placeholder="https://yoursite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              disabled={crawlResults.status === 'crawling'}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-key">Firecrawl API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="fc-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={crawlResults.status === 'crawling'}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">firecrawl.dev</a>
            </p>
          </div>

          <Button 
            onClick={startCrawling}
            disabled={!websiteUrl || !apiKey || crawlResults.status === 'crawling'}
            className="w-full gap-2"
          >
            {crawlResults.status === 'crawling' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Crawling...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Start Crawling
              </>
            )}
          </Button>

          {crawlResults.status === 'crawling' && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {progress < 25 && "Connecting to website..."}
                {progress >= 25 && progress < 50 && "Discovering content..."}
                {progress >= 50 && progress < 75 && "Processing posts..."}
                {progress >= 75 && "Finalizing results..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {crawlResults.status === 'complete' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Found</p>
                    <p className="text-2xl font-bold">{crawlResults.totalFound}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{crawlResults.successCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold text-red-600">{crawlResults.errorCount}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Import Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Import Settings</CardTitle>
              <CardDescription>Configure how the content should be imported</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-genre">Default Genre</Label>
                  <Select value={importSettings.defaultGenre} onValueChange={(value) => 
                    setImportSettings(prev => ({ ...prev, defaultGenre: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Novel">Novel</SelectItem>
                      <SelectItem value="Fantasy">Fantasy</SelectItem>
                      <SelectItem value="Romance">Romance</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                      <SelectItem value="Drama">Drama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-status">Series Status</Label>
                  <Select value={importSettings.defaultStatus} onValueChange={(value) => 
                    setImportSettings(prev => ({ ...prev, defaultStatus: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="hiatus">On Hiatus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Select Posts to Import</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllPosts}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Choose which posts you want to import ({selectedPosts.size} selected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {crawlResults.posts.map((post) => (
                  <div
                    key={post.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPosts.has(post.id) ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => togglePostSelection(post.id)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-4 h-4 rounded border-2 ${
                        selectedPosts.has(post.id) 
                          ? 'bg-primary border-primary' 
                          : 'border-muted-foreground'
                      }`} />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{post.title}</h4>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>By {post.author}</span>
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                        {post.categories.length > 0 && (
                          <div className="flex gap-1">
                            {post.categories.map(cat => (
                              <Badge key={cat} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPosts.size > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <Button onClick={importSelectedPosts} className="w-full gap-2">
                    <Upload className="h-4 w-4" />
                    Import {selectedPosts.size} Selected Posts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};