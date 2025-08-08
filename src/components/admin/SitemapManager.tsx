import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Map, 
  Download, 
  RefreshCw, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Globe,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

interface SitemapStats {
  totalUrls: number;
  lastGenerated: string;
  size: string;
}

const CHANGE_FREQUENCIES = [
  'always',
  'hourly', 
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never'
];

const PRIORITIES = [
  '1.0',
  '0.9',
  '0.8',
  '0.7',
  '0.6',
  '0.5',
  '0.4',
  '0.3',
  '0.2',
  '0.1'
];

export const SitemapManager = () => {
  const { toast } = useToast();
  const [sitemapEntries, setSitemapEntries] = useState<SitemapEntry[]>([]);
  const [sitemapStats, setSitemapStats] = useState<SitemapStats>({
    totalUrls: 0,
    lastGenerated: '',
    size: '0 KB'
  });
  const [generatedSitemap, setGeneratedSitemap] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);

  useEffect(() => {
    if (autoGenerate) {
      generateSitemap();
    }
  }, []);

  const generateSitemap = async () => {
    try {
      setLoading(true);
      
      const baseUrl = window.location.origin;
      const entries: SitemapEntry[] = [];

      // Add static pages
      entries.push({
        url: baseUrl,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '1.0'
      });

      // Get chapters from database
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('id, updated_at, chapter_number')
        .eq('is_locked', false)
        .order('chapter_number');

      if (chaptersError) throw chaptersError;

      // Add chapter pages
      chapters?.forEach(chapter => {
        entries.push({
          url: `${baseUrl}/reader/${chapter.id}`,
          lastmod: new Date(chapter.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.8'
        });
      });

      // Get manga metadata
      const { data: mangaMeta, error: metaError } = await supabase
        .from('manga_meta')
        .select('updated_at')
        .maybeSingle();

      if (!metaError && mangaMeta) {
        entries.push({
          url: `${baseUrl}/chapters`,
          lastmod: new Date(mangaMeta.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.9'
        });
      }

      setSitemapEntries(entries);
      
      // Generate XML
      const sitemapXml = generateSitemapXML(entries);
      setGeneratedSitemap(sitemapXml);

      // Update stats
      setSitemapStats({
        totalUrls: entries.length,
        lastGenerated: new Date().toLocaleString(),
        size: `${Math.round(sitemapXml.length / 1024)} KB`
      });

      toast({
        title: "Sitemap generated successfully",
        description: `Generated sitemap with ${entries.length} URLs`,
      });
    } catch (error) {
      console.error('Error generating sitemap:', error);
      toast({
        title: "Error generating sitemap",
        description: "Failed to generate sitemap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSitemapXML = (entries: SitemapEntry[]): string => {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const urlsetClose = '</urlset>';
    
    const urls = entries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n');

    return xmlHeader + urlsetOpen + urls + '\n' + urlsetClose;
  };

  const downloadSitemap = () => {
    const blob = new Blob([generatedSitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Sitemap downloaded",
      description: "sitemap.xml has been downloaded to your device",
    });
  };

  const updateEntryPriority = (index: number, priority: string) => {
    setSitemapEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, priority } : entry
    ));
  };

  const updateEntryChangefreq = (index: number, changefreq: string) => {
    setSitemapEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, changefreq } : entry
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sitemap Manager</h3>
          <p className="text-sm text-muted-foreground">
            Generate and manage XML sitemaps for better SEO
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateSitemap} disabled={loading} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Generating...' : 'Regenerate'}
          </Button>
          <Button onClick={downloadSitemap} disabled={!generatedSitemap} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total URLs</p>
                <p className="text-2xl font-bold">{sitemapStats.totalUrls}</p>
              </div>
              <Map className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">File Size</p>
                <p className="text-2xl font-bold">{sitemapStats.size}</p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Generated</p>
                <p className="text-sm font-medium">{sitemapStats.lastGenerated || 'Never'}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Sitemap Entries
            </CardTitle>
            <CardDescription>
              Configure individual URL settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sitemapEntries.map((entry, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {entry.url.replace(window.location.origin, '')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {entry.lastmod}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Select 
                      value={entry.changefreq} 
                      onValueChange={(value) => updateEntryChangefreq(index, value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHANGE_FREQUENCIES.map(freq => (
                          <SelectItem key={freq} value={freq}>
                            {freq}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={entry.priority} 
                      onValueChange={(value) => updateEntryPriority(index, value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map(priority => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              
              {sitemapEntries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No sitemap entries yet. Click "Generate" to create sitemap.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Sitemap XML</CardTitle>
            <CardDescription>
              Preview of the generated sitemap.xml file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedSitemap}
              readOnly
              rows={12}
              className="font-mono text-xs"
              placeholder="Generated sitemap XML will appear here..."
            />
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Test in Search Console
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Validate XML
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            SEO Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
              <div>
                <p className="font-medium">Submit to Search Engines</p>
                <p className="text-sm text-muted-foreground">
                  Submit your sitemap to Google Search Console and Bing Webmaster Tools
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
              <div>
                <p className="font-medium">Update Robots.txt</p>
                <p className="text-sm text-muted-foreground">
                  Add "Sitemap: {window.location.origin}/sitemap.xml" to your robots.txt file
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
              <div>
                <p className="font-medium">Regular Updates</p>
                <p className="text-sm text-muted-foreground">
                  Regenerate your sitemap whenever you add new chapters or pages
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};