import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Globe, 
  Eye, 
  Code, 
  Image,
  Settings,
  BarChart3,
  FileText,
  Share
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SEOSettings {
  // Global SEO
  site_title: string;
  site_description: string;
  site_keywords: string;
  site_url: string;
  default_og_image: string;
  favicon_url: string;
  
  // Analytics & Tracking
  google_analytics_id: string;
  google_tag_manager_id: string;
  google_search_console_verification: string;
  facebook_app_id: string;
  twitter_handle: string;
  
  // AdSense & Monetization
  google_adsense_id: string;
  adsense_auto_ads: boolean;
  
  // Technical SEO
  robots_txt: string;
  sitemap_enabled: boolean;
  structured_data_enabled: boolean;
  canonical_urls_enabled: boolean;
  
  // Social Media
  og_site_name: string;
  twitter_card_type: 'summary' | 'summary_large_image';
}

interface PageTemplate {
  page_type: string;
  title_template: string;
  description_template: string;
  keywords_template: string;
  og_image_template: string;
}

const DEFAULT_TEMPLATES: PageTemplate[] = [
  {
    page_type: 'homepage',
    title_template: '{site_title} - {site_description}',
    description_template: '{site_description}',
    keywords_template: 'manga, novel, webtoon, comics, read online',
    og_image_template: '{default_og_image}'
  },
  {
    page_type: 'series',
    title_template: '{series_title} - {site_title}',
    description_template: '{series_description}',
    keywords_template: '{series_genres}, {series_tags}, manga, novel',
    og_image_template: '{series_cover}'
  },
  {
    page_type: 'chapter',
    title_template: '{series_title} Chapter {chapter_number}: {chapter_title} - {site_title}',
    description_template: 'Read {series_title} Chapter {chapter_number}: {chapter_title} online for free.',
    keywords_template: '{series_title}, chapter {chapter_number}, {series_genres}',
    og_image_template: '{chapter_thumbnail}'
  }
];

export const SEOManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    site_title: 'Manga Reader Pro',
    site_description: 'Premium manga and novel reading platform with ad-free experience',
    site_keywords: 'manga, novel, webtoon, comics, read online, premium',
    site_url: 'https://yoursite.com',
    default_og_image: '/manga-cover.jpg',
    favicon_url: '/favicon.ico',
    google_analytics_id: '',
    google_tag_manager_id: '',
    google_search_console_verification: '',
    facebook_app_id: '',
    twitter_handle: '',
    google_adsense_id: '',
    adsense_auto_ads: false,
    robots_txt: `User-agent: *\nAllow: /\n\nSitemap: {site_url}/sitemap.xml`,
    sitemap_enabled: true,
    structured_data_enabled: true,
    canonical_urls_enabled: true,
    og_site_name: 'Manga Reader Pro',
    twitter_card_type: 'summary_large_image'
  });
  
  const [pageTemplates, setPageTemplates] = useState<PageTemplate[]>(DEFAULT_TEMPLATES);
  const [previewData, setPreviewData] = useState({
    series_title: 'Attack on Titan',
    series_description: 'Humanity fights for survival against giant titans in this epic manga series.',
    chapter_number: 139,
    chapter_title: 'Final Chapter',
    series_genres: 'Action, Drama, Fantasy'
  });

  useEffect(() => {
    loadSEOSettings();
  }, []);

  const loadSEOSettings = () => {
    // Load from localStorage for demo
    const stored = localStorage.getItem('seo_settings');
    if (stored) {
      setSeoSettings({ ...seoSettings, ...JSON.parse(stored) });
    }
    
    const storedTemplates = localStorage.getItem('seo_templates');
    if (storedTemplates) {
      setPageTemplates(JSON.parse(storedTemplates));
    }
  };

  const saveSEOSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('seo_settings', JSON.stringify(seoSettings));
      localStorage.setItem('seo_templates', JSON.stringify(pageTemplates));
      
      toast({
        title: "Success",
        description: "SEO settings saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save SEO settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const interpolateTemplate = (template: string, data: Record<string, any>) => {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || seoSettings[key as keyof SEOSettings] || match;
    });
  };

  const updateTemplate = (pageType: string, field: keyof PageTemplate, value: string) => {
    setPageTemplates(prev => 
      prev.map(template => 
        template.page_type === pageType 
          ? { ...template, [field]: value }
          : template
      )
    );
  };

  const generateRobotsTxt = () => {
    return `User-agent: *
Allow: /

# Disallow admin areas
Disallow: /admin/
Disallow: /auth/

# Disallow search parameters
Disallow: /*?*

# Allow all content
Allow: /series/
Allow: /chapter/
Allow: /browse/

# Sitemap
Sitemap: ${seoSettings.site_url}/sitemap.xml`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Management</h2>
          <p className="text-muted-foreground">
            Configure SEO settings, meta tags, and search engine optimization
          </p>
        </div>
        <Button onClick={saveSEOSettings} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="global" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="global">Global SEO</TabsTrigger>
          <TabsTrigger value="templates">Page Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Global SEO Settings
              </CardTitle>
              <CardDescription>
                Configure site-wide SEO meta data and social media settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_title">Site Title</Label>
                  <Input
                    id="site_title"
                    value={seoSettings.site_title}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, site_title: e.target.value }))}
                    placeholder="Your Site Title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site_url">Site URL</Label>
                  <Input
                    id="site_url"
                    value={seoSettings.site_url}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, site_url: e.target.value }))}
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={seoSettings.site_description}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, site_description: e.target.value }))}
                  placeholder="Brief description of your site"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_keywords">Default Keywords</Label>
                <Input
                  id="site_keywords"
                  value={seoSettings.site_keywords}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, site_keywords: e.target.value }))}
                  placeholder="manga, novel, webtoon, comics"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_og_image">Default OG Image URL</Label>
                  <Input
                    id="default_og_image"
                    value={seoSettings.default_og_image}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, default_og_image: e.target.value }))}
                    placeholder="/og-image.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="favicon_url">Favicon URL</Label>
                  <Input
                    id="favicon_url"
                    value={seoSettings.favicon_url}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, favicon_url: e.target.value }))}
                    placeholder="/favicon.ico"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter_handle">Twitter Handle</Label>
                  <Input
                    id="twitter_handle"
                    value={seoSettings.twitter_handle}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, twitter_handle: e.target.value }))}
                    placeholder="@yourhandle"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facebook_app_id">Facebook App ID</Label>
                  <Input
                    id="facebook_app_id"
                    value={seoSettings.facebook_app_id}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, facebook_app_id: e.target.value }))}
                    placeholder="123456789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Page Templates
              </CardTitle>
              <CardDescription>
                Configure SEO templates for different page types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {pageTemplates.map((template) => (
                <Card key={template.page_type} className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">{template.page_type}</Badge>
                    <h4 className="font-semibold capitalize">{template.page_type} Pages</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title Template</Label>
                      <Input
                        value={template.title_template}
                        onChange={(e) => updateTemplate(template.page_type, 'title_template', e.target.value)}
                        placeholder="Use {variables} for dynamic content"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Description Template</Label>
                      <Textarea
                        value={template.description_template}
                        onChange={(e) => updateTemplate(template.page_type, 'description_template', e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Keywords Template</Label>
                      <Input
                        value={template.keywords_template}
                        onChange={(e) => updateTemplate(template.page_type, 'keywords_template', e.target.value)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
              
              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription>
                  Available variables: {'{site_title}'}, {'{series_title}'}, {'{chapter_number}'}, {'{chapter_title}'}, {'{series_description}'}, {'{series_genres}'}, {'{series_tags}'}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics & Tracking
              </CardTitle>
              <CardDescription>
                Configure Google Analytics, Tag Manager, and advertising
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                  <Input
                    id="google_analytics_id"
                    value={seoSettings.google_analytics_id}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
                  <Input
                    id="google_tag_manager_id"
                    value={seoSettings.google_tag_manager_id}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, google_tag_manager_id: e.target.value }))}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_search_console_verification">Google Search Console Verification</Label>
                <Input
                  id="google_search_console_verification"
                  value={seoSettings.google_search_console_verification}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, google_search_console_verification: e.target.value }))}
                  placeholder="meta tag content value"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">AdSense Configuration</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="google_adsense_id">Google AdSense ID</Label>
                  <Input
                    id="google_adsense_id"
                    value={seoSettings.google_adsense_id}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, google_adsense_id: e.target.value }))}
                    placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Auto Ads</Label>
                    <p className="text-sm text-muted-foreground">Automatically place ads throughout your site</p>
                  </div>
                  <Switch
                    checked={seoSettings.adsense_auto_ads}
                    onCheckedChange={(checked) => setSeoSettings(prev => ({ ...prev, adsense_auto_ads: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Technical SEO
              </CardTitle>
              <CardDescription>
                Configure robots.txt, sitemaps, and structured data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>XML Sitemap</Label>
                    <p className="text-xs text-muted-foreground">Auto-generate sitemap.xml</p>
                  </div>
                  <Switch
                    checked={seoSettings.sitemap_enabled}
                    onCheckedChange={(checked) => setSeoSettings(prev => ({ ...prev, sitemap_enabled: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Structured Data</Label>
                    <p className="text-xs text-muted-foreground">JSON-LD schema markup</p>
                  </div>
                  <Switch
                    checked={seoSettings.structured_data_enabled}
                    onCheckedChange={(checked) => setSeoSettings(prev => ({ ...prev, structured_data_enabled: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Canonical URLs</Label>
                    <p className="text-xs text-muted-foreground">Prevent duplicate content</p>
                  </div>
                  <Switch
                    checked={seoSettings.canonical_urls_enabled}
                    onCheckedChange={(checked) => setSeoSettings(prev => ({ ...prev, canonical_urls_enabled: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="robots_txt">Robots.txt Content</Label>
                <Textarea
                  id="robots_txt"
                  value={seoSettings.robots_txt}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, robots_txt: e.target.value }))}
                  rows={8}
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSeoSettings(prev => ({ ...prev, robots_txt: generateRobotsTxt() }))}
                >
                  Generate Default Robots.txt
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                SEO Preview
              </CardTitle>
              <CardDescription>
                Preview how your pages will appear in search results and social media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {pageTemplates.map((template) => (
                <Card key={template.page_type} className="p-4">
                  <h4 className="font-semibold capitalize mb-4">{template.page_type} Page Preview</h4>
                  
                  <div className="space-y-4">
                    {/* Google Search Preview */}
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2">Google Search Results</p>
                      <div className="space-y-1">
                        <h3 className="text-blue-600 text-lg leading-tight hover:underline cursor-pointer">
                          {interpolateTemplate(template.title_template, previewData)}
                        </h3>
                        <p className="text-green-700 text-sm">
                          {seoSettings.site_url}/{template.page_type === 'homepage' ? '' : 'example-url'}
                        </p>
                        <p className="text-sm text-gray-700">
                          {interpolateTemplate(template.description_template, previewData)}
                        </p>
                      </div>
                    </div>

                    {/* Social Media Preview */}
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-2">Social Media Share</p>
                      <div className="flex gap-3">
                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {interpolateTemplate(template.title_template, previewData)}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {interpolateTemplate(template.description_template, previewData)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {seoSettings.site_url}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};