import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Globe, 
  FileText, 
  Map, 
  Bot,
  Save,
  Plus,
  Trash2,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SEOHealthCheck } from "./SEOHealthCheck";

interface SEOSettings {
  id?: string;
  page_type: string;
  target_id?: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  robots_directives: string;
  structured_data: any;
}

const PAGE_TYPES = [
  { value: 'home', label: 'Home Page' },
  { value: 'series', label: 'Series Page' },
  { value: 'chapter', label: 'Chapter Page' },
  { value: 'reader', label: 'Reader Page' },
];

const ROBOTS_OPTIONS = [
  'index, follow',
  'noindex, follow',
  'index, nofollow',
  'noindex, nofollow',
];

export const SEOPanel = () => {
  const { toast } = useToast();
  const [seoSettings, setSeoSettings] = useState<SEOSettings[]>([]);
  const [selectedPageType, setSelectedPageType] = useState('home');
  const [currentSettings, setCurrentSettings] = useState<SEOSettings>({
    page_type: 'home',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    robots_directives: 'index, follow',
    structured_data: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSEOSettings();
  }, []);

  useEffect(() => {
    const settings = seoSettings.find(s => s.page_type === selectedPageType);
    if (settings) {
      setCurrentSettings(settings);
    } else {
      setCurrentSettings({
        page_type: selectedPageType,
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        canonical_url: '',
        og_title: '',
        og_description: '',
        og_image_url: '',
        robots_directives: 'index, follow',
        structured_data: {},
      });
    }
  }, [selectedPageType, seoSettings]);

  const loadSEOSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .order('page_type');

      if (error) throw error;
      setSeoSettings(data || []);
    } catch (error) {
      console.error('Error loading SEO settings:', error);
      toast({
        title: "Error loading SEO settings",
        description: "Failed to load SEO configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const dataToSave = {
        page_type: currentSettings.page_type,
        target_id: currentSettings.target_id || null,
        meta_title: currentSettings.meta_title,
        meta_description: currentSettings.meta_description,
        meta_keywords: currentSettings.meta_keywords,
        canonical_url: currentSettings.canonical_url,
        og_title: currentSettings.og_title,
        og_description: currentSettings.og_description,
        og_image_url: currentSettings.og_image_url,
        robots_directives: currentSettings.robots_directives,
        structured_data: currentSettings.structured_data,
      };

      if (currentSettings.id) {
        const { error } = await supabase
          .from('seo_settings')
          .update(dataToSave)
          .eq('id', currentSettings.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('seo_settings')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        setCurrentSettings(prev => ({ ...prev, id: data.id }));
      }

      await loadSEOSettings();
      toast({
        title: "SEO settings saved!",
        description: "Your SEO configuration has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving SEO settings:', error);
      toast({
        title: "Error saving SEO settings",
        description: "Failed to save SEO configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateStructuredData = () => {
    const baseUrl = window.location.origin;
    let structuredData = {};

    switch (selectedPageType) {
      case 'home':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": currentSettings.meta_title,
          "description": currentSettings.meta_description,
          "url": baseUrl,
        };
        break;
      case 'series':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "ComicSeries",
          "name": currentSettings.meta_title,
          "description": currentSettings.meta_description,
          "url": `${baseUrl}/series`,
        };
        break;
      case 'chapter':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "ComicIssue",
          "name": currentSettings.meta_title,
          "description": currentSettings.meta_description,
        };
        break;
    }

    setCurrentSettings(prev => ({
      ...prev,
      structured_data: structuredData
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Management</h2>
          <p className="text-muted-foreground">Optimize your site for search engines and social media</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="meta-tags" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="meta-tags">Meta Tags</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="technical">Technical SEO</TabsTrigger>
          <TabsTrigger value="structured">Structured Data</TabsTrigger>
          <TabsTrigger value="health-check">Health Check</TabsTrigger>
        </TabsList>

        <TabsContent value="meta-tags" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Meta Tags Configuration
              </CardTitle>
              <CardDescription>
                Configure meta tags for different page types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Page Type</Label>
                <Select value={selectedPageType} onValueChange={setSelectedPageType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mt-2">
                  {seoSettings
                    .filter(s => s.page_type === selectedPageType)
                    .map(setting => (
                    <Badge key={setting.id} variant="secondary">
                      Configured
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meta-title">Meta Title</Label>
                  <Input
                    id="meta-title"
                    value={currentSettings.meta_title}
                    onChange={(e) => setCurrentSettings(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="Enter SEO title (max 60 characters)"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {currentSettings.meta_title.length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical-url">Canonical URL</Label>
                  <Input
                    id="canonical-url"
                    value={currentSettings.canonical_url}
                    onChange={(e) => setCurrentSettings(prev => ({ ...prev, canonical_url: e.target.value }))}
                    placeholder="https://yourdomain.com/page"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={currentSettings.meta_description}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="Enter SEO description (max 160 characters)"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {currentSettings.meta_description.length}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-keywords">Meta Keywords</Label>
                <Input
                  id="meta-keywords"
                  value={currentSettings.meta_keywords}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, meta_keywords: e.target.value }))}
                  placeholder="manga, comics, fantasy, action (comma-separated)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media Optimization
              </CardTitle>
              <CardDescription>
                Configure Open Graph and Twitter Card meta tags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="og-title">Open Graph Title</Label>
                <Input
                  id="og-title"
                  value={currentSettings.og_title}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, og_title: e.target.value }))}
                  placeholder="Title for social media sharing"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="og-description">Open Graph Description</Label>
                <Textarea
                  id="og-description"
                  value={currentSettings.og_description}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, og_description: e.target.value }))}
                  placeholder="Description for social media sharing"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="og-image">Open Graph Image URL</Label>
                <Input
                  id="og-image"
                  value={currentSettings.og_image_url}
                  onChange={(e) => setCurrentSettings(prev => ({ ...prev, og_image_url: e.target.value }))}
                  placeholder="https://yourdomain.com/og-image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1200x630px. Image will be displayed when sharing on social media.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Technical SEO Settings
              </CardTitle>
              <CardDescription>
                Configure robots directives and crawling settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Robots Meta Tag</Label>
                <Select 
                  value={currentSettings.robots_directives} 
                  onValueChange={(value) => setCurrentSettings(prev => ({ ...prev, robots_directives: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROBOTS_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Controls how search engines crawl and index this page type
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Robots.txt
                </Button>
                <Button variant="outline" className="gap-2">
                  <Map className="h-4 w-4" />
                  Generate Sitemap
                </Button>
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Test in Search Console
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structured" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Structured Data (Schema.org)</CardTitle>
              <CardDescription>
                Configure structured data for rich search results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Current page type: <strong>{PAGE_TYPES.find(p => p.value === selectedPageType)?.label}</strong>
                </p>
                <Button onClick={generateStructuredData} variant="outline" size="sm">
                  Generate Schema
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Structured Data JSON-LD</Label>
                <Textarea
                  value={JSON.stringify(currentSettings.structured_data, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setCurrentSettings(prev => ({ ...prev, structured_data: parsed }));
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder="Generated schema markup will appear here..."
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Test with Google
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Schema Validator
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health-check" className="space-y-6">
          <SEOHealthCheck />
        </TabsContent>
      </Tabs>
    </div>
  );
};