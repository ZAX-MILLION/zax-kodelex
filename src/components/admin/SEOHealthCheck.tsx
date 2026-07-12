import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Globe, 
  Image, 
  FileText, 
  Link,
  Smartphone,
  Zap,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SEOCheck {
  id: string;
  category: 'meta' | 'content' | 'technical' | 'performance' | 'mobile';
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  impact: 'high' | 'medium' | 'low';
  suggestion?: string;
}

interface SEOScore {
  overall: number;
  meta: number;
  content: number;
  technical: number;
  performance: number;
  mobile: number;
}

export const SEOHealthCheck = () => {
  const [checks, setChecks] = useState<SEOCheck[]>([]);
  const [scores, setScores] = useState<SEOScore>({
    overall: 0,
    meta: 0,
    content: 0,
    technical: 0,
    performance: 0,
    mobile: 0
  });
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    runSEOAudit();
  }, []);

  const runSEOAudit = async () => {
    setIsRunning(true);
    const results: SEOCheck[] = [];

    try {
      // Meta Tags Analysis
      const title = document.querySelector('title')?.textContent || '';
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
      
      results.push({
        id: 'title-length',
        category: 'meta',
        name: 'Title Length',
        status: title.length >= 30 && title.length <= 60 ? 'pass' : 'warning',
        message: `Title is ${title.length} characters (optimal: 30-60)`,
        impact: 'high',
        suggestion: title.length < 30 ? 'Make title longer and more descriptive' : 'Keep title under 60 characters'
      });

      results.push({
        id: 'meta-description',
        category: 'meta',
        name: 'Meta Description',
        status: description.length >= 120 && description.length <= 160 ? 'pass' : description.length > 0 ? 'warning' : 'fail',
        message: description.length > 0 ? `Description is ${description.length} characters (optimal: 120-160)` : 'Missing meta description',
        impact: 'high',
        suggestion: 'Add compelling meta description that summarizes page content'
      });

      // Open Graph Tags
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');

      results.push({
        id: 'open-graph',
        category: 'meta',
        name: 'Open Graph Tags',
        status: ogTitle && ogDescription && ogImage ? 'pass' : 'warning',
        message: ogTitle && ogDescription && ogImage ? 'All essential OG tags present' : 'Missing some Open Graph tags',
        impact: 'medium',
        suggestion: 'Add og:title, og:description, and og:image for better social sharing'
      });

      // Structured Data
      const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
      results.push({
        id: 'structured-data',
        category: 'meta',
        name: 'Structured Data',
        status: structuredData.length > 0 ? 'pass' : 'warning',
        message: `${structuredData.length} structured data blocks found`,
        impact: 'medium',
        suggestion: 'Add JSON-LD structured data for better search engine understanding'
      });

      // Content Analysis
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const h1Count = document.querySelectorAll('h1').length;
      
      results.push({
        id: 'heading-structure',
        category: 'content',
        name: 'Heading Structure',
        status: h1Count === 1 && headings.length > 1 ? 'pass' : 'warning',
        message: `${h1Count} H1 tags, ${headings.length} total headings`,
        impact: 'medium',
        suggestion: 'Use exactly one H1 tag and maintain proper heading hierarchy'
      });

      // Images
      const images = document.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'));
      
      results.push({
        id: 'image-alt-text',
        category: 'content',
        name: 'Image Alt Text',
        status: imagesWithoutAlt.length === 0 ? 'pass' : 'warning',
        message: `${imagesWithoutAlt.length} images missing alt text out of ${images.length} total`,
        impact: 'medium',
        suggestion: 'Add descriptive alt text to all images for accessibility and SEO'
      });

      // Technical SEO
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      results.push({
        id: 'canonical-url',
        category: 'technical',
        name: 'Canonical URL',
        status: canonicalLink ? 'pass' : 'warning',
        message: canonicalLink ? 'Canonical URL specified' : 'Missing canonical URL',
        impact: 'medium',
        suggestion: 'Add canonical URL to prevent duplicate content issues'
      });

      // Robots.txt
      try {
        const robotsResponse = await fetch('/robots.txt');
        results.push({
          id: 'robots-txt',
          category: 'technical',
          name: 'Robots.txt',
          status: robotsResponse.ok ? 'pass' : 'warning',
          message: robotsResponse.ok ? 'Robots.txt file found' : 'Robots.txt file missing',
          impact: 'low',
          suggestion: 'Create robots.txt file to guide search engine crawling'
        });
      } catch (error) {
        results.push({
          id: 'robots-txt',
          category: 'technical',
          name: 'Robots.txt',
          status: 'warning',
          message: 'Unable to check robots.txt',
          impact: 'low'
        });
      }

      // Performance Metrics
      const performanceEntries = performance.getEntriesByType('navigation');
      if (performanceEntries.length > 0) {
        const navTiming = performanceEntries[0] as PerformanceNavigationTiming;
        const loadTime = navTiming.loadEventEnd - navTiming.loadEventStart;
        
        results.push({
          id: 'page-load-speed',
          category: 'performance',
          name: 'Page Load Speed',
          status: loadTime < 3000 ? 'pass' : loadTime < 5000 ? 'warning' : 'fail',
          message: `Page loaded in ${Math.round(loadTime)}ms`,
          impact: 'high',
          suggestion: loadTime > 3000 ? 'Optimize images, minify CSS/JS, and use CDN' : undefined
        });
      }

      // Mobile Optimization
      const viewport = document.querySelector('meta[name="viewport"]');
      results.push({
        id: 'mobile-viewport',
        category: 'mobile',
        name: 'Mobile Viewport',
        status: viewport ? 'pass' : 'fail',
        message: viewport ? 'Viewport meta tag present' : 'Missing viewport meta tag',
        impact: 'high',
        suggestion: 'Add viewport meta tag for mobile responsiveness'
      });

      // Mobile-friendly test (basic)
      const isMobileFriendly = window.innerWidth <= 768 ? 'pass' : 'warning';
      results.push({
        id: 'mobile-friendly',
        category: 'mobile',
        name: 'Mobile Responsive',
        status: viewport && CSS.supports('display', 'flex') ? 'pass' : 'warning',
        message: 'Basic mobile responsiveness check',
        impact: 'high',
        suggestion: 'Ensure site works well on all device sizes'
      });

      setChecks(results);

      // Calculate scores by category
      const calculateCategoryScore = (category: string) => {
        const categoryChecks = results.filter(check => check.category === category);
        if (categoryChecks.length === 0) return 100;
        
        const passCount = categoryChecks.filter(check => check.status === 'pass').length;
        return Math.round((passCount / categoryChecks.length) * 100);
      };

      const newScores = {
        meta: calculateCategoryScore('meta'),
        content: calculateCategoryScore('content'),
        technical: calculateCategoryScore('technical'),
        performance: calculateCategoryScore('performance'),
        mobile: calculateCategoryScore('mobile'),
        overall: 0
      };

      newScores.overall = Math.round(
        (newScores.meta + newScores.content + newScores.technical + newScores.performance + newScores.mobile) / 5
      );

      setScores(newScores);

    } catch (error) {
      console.error('SEO audit failed:', error);
      toast({
        title: 'SEO Audit Failed',
        description: 'Unable to complete SEO health check',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'default';
      case 'fail':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meta':
        return <FileText className="h-4 w-4" />;
      case 'content':
        return <Globe className="h-4 w-4" />;
      case 'technical':
        return <Link className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Health Check
          </CardTitle>
          <CardDescription>
            Analyze your site's search engine optimization and get improvement recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{scores.overall}</div>
              <div className="text-sm text-muted-foreground">Overall</div>
              <Progress value={scores.overall} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{scores.meta}</div>
              <div className="text-xs text-muted-foreground">Meta Tags</div>
              <Progress value={scores.meta} className="mt-1 h-1" />
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{scores.content}</div>
              <div className="text-xs text-muted-foreground">Content</div>
              <Progress value={scores.content} className="mt-1 h-1" />
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{scores.technical}</div>
              <div className="text-xs text-muted-foreground">Technical</div>
              <Progress value={scores.technical} className="mt-1 h-1" />
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{scores.performance}</div>
              <div className="text-xs text-muted-foreground">Speed</div>
              <Progress value={scores.performance} className="mt-1 h-1" />
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{scores.mobile}</div>
              <div className="text-xs text-muted-foreground">Mobile</div>
              <Progress value={scores.mobile} className="mt-1 h-1" />
            </div>
          </div>

          <Button onClick={runSEOAudit} disabled={isRunning} className="w-full">
            {isRunning ? 'Running SEO Audit...' : 'Rerun SEO Audit'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {['meta', 'content', 'technical', 'performance', 'mobile'].map((category) => {
          const categoryChecks = checks.filter(check => check.category === category);
          if (categoryChecks.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getCategoryIcon(category)}
                  {category.charAt(0).toUpperCase() + category.slice(1)} SEO
                  <Badge variant={scores[category as keyof SEOScore] >= 80 ? 'default' : 'secondary'}>
                    {scores[category as keyof SEOScore]}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryChecks.map((check) => (
                  <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getStatusIcon(check.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium">{check.name}</h4>
                        <Badge variant={getImpactColor(check.impact)} className="text-xs">
                          {check.impact} impact
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{check.message}</p>
                      {check.suggestion && (
                        <p className="text-xs text-blue-600 font-medium">{check.suggestion}</p>
                      )}
                    </div>
                    <Badge variant={getStatusColor(check.status)} className="text-xs">
                      {check.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {scores.overall < 70 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">SEO Score Below 70% - Immediate Action Recommended</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Focus on high-impact issues first (marked in red)</li>
                <li>Ensure all meta tags are properly configured</li>
                <li>Optimize page loading speed</li>
                <li>Verify mobile responsiveness</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};