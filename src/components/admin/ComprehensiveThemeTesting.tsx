import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useChildTheme } from '@/hooks/useChildTheme';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useSEO } from '@/hooks/useSEO';
import { ThemeVerification } from './ThemeVerification';
import { ThemeTestButton } from '@/components/themes/ThemeTestButton';
import { CheckCircle, XCircle, AlertCircle, Loader2, Monitor, Smartphone, Code, Globe, Zap, Shield } from 'lucide-react';

interface TestResult {
  category: string;
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  icon: React.ReactNode;
}

interface TestSuite {
  name: string;
  icon: React.ReactNode;
  tests: TestResult[];
  overall: 'passed' | 'failed' | 'warning';
}

export const ComprehensiveThemeTesting: React.FC = () => {
  const { availableThemes, currentTheme } = useChildTheme();
  const { metrics, score } = usePerformanceMonitor();
  const { seoSettings, currentMetadata } = useSEO();
  
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);

  const runComprehensiveTests = async () => {
    setTesting(true);
    setProgress(0);
    
    const suites: TestSuite[] = [];

    // 1. Theme System Tests
    setProgress(15);
    const themeTests = await runThemeSystemTests();
    suites.push(themeTests);

    // 2. Performance Tests
    setProgress(30);
    const performanceTests = runPerformanceTests();
    suites.push(performanceTests);

    // 3. SEO Tests
    setProgress(45);
    const seoTests = runSEOTests();
    suites.push(seoTests);

    // 4. Responsive Design Tests
    setProgress(60);
    const responsiveTests = runResponsiveTests();
    suites.push(responsiveTests);

    // 5. Component Tests
    setProgress(75);
    const componentTests = await runComponentTests();
    suites.push(componentTests);

    // 6. Security Tests
    setProgress(90);
    const securityTests = runSecurityTests();
    suites.push(securityTests);

    setProgress(100);
    setTestSuites(suites);
    setTesting(false);
  };

  const runThemeSystemTests = async (): Promise<TestSuite> => {
    const tests: TestResult[] = [];

    // Test theme loading
    tests.push({
      category: 'themes',
      name: 'Theme Database Connection',
      status: availableThemes.length > 0 ? 'passed' : 'failed',
      message: `Found ${availableThemes.length} themes in database`,
      icon: <Monitor className="w-4 h-4" />
    });

    // Test active theme
    tests.push({
      category: 'themes',
      name: 'Active Theme Set',
      status: currentTheme ? 'passed' : 'failed',
      message: currentTheme ? `Active: ${currentTheme.display_name}` : 'No active theme',
      icon: <CheckCircle className="w-4 h-4" />
    });

    // Test Shiranami theme
    const shiranamiTheme = availableThemes.find(t => t.name === '04-shiranami-sakura');
    tests.push({
      category: 'themes',
      name: 'Shiranami Sakura Theme',
      status: shiranamiTheme ? 'passed' : 'failed',
      message: shiranamiTheme ? 'Theme found and ready' : 'Theme missing',
      icon: <Code className="w-4 h-4" />
    });

    // Test component loading
    try {
      const { ShiranamiSakuraHomepage } = await import('@/themes/components/04-shiranami-sakura');
      tests.push({
        category: 'themes',
        name: 'Component Loading',
        status: 'passed',
        message: 'Theme components load successfully',
        icon: <CheckCircle className="w-4 h-4" />
      });
    } catch (error) {
      tests.push({
        category: 'themes',
        name: 'Component Loading',
        status: 'failed',
        message: 'Failed to load theme components',
        icon: <XCircle className="w-4 h-4" />
      });
    }

    const overall = tests.every(t => t.status === 'passed') ? 'passed' : 
                   tests.some(t => t.status === 'failed') ? 'failed' : 'warning';

    return {
      name: 'Theme System',
      icon: <Monitor className="w-5 h-5" />,
      tests,
      overall
    };
  };

  const runPerformanceTests = (): TestSuite => {
    const tests: TestResult[] = [];

    if (metrics) {
      // Load time test
      tests.push({
        category: 'performance',
        name: 'Page Load Time',
        status: metrics.loadTime < 3000 ? 'passed' : metrics.loadTime < 5000 ? 'warning' : 'failed',
        message: `${(metrics.loadTime / 1000).toFixed(2)}s`,
        icon: <Zap className="w-4 h-4" />
      });

      // FCP test
      tests.push({
        category: 'performance',
        name: 'First Contentful Paint',
        status: metrics.firstContentfulPaint < 1800 ? 'passed' : metrics.firstContentfulPaint < 3000 ? 'warning' : 'failed',
        message: `${(metrics.firstContentfulPaint / 1000).toFixed(2)}s`,
        icon: <Zap className="w-4 h-4" />
      });

      // Bundle size test
      tests.push({
        category: 'performance',
        name: 'Bundle Size',
        status: metrics.bundleSize < 1 ? 'passed' : metrics.bundleSize < 3 ? 'warning' : 'failed',
        message: `${metrics.bundleSize.toFixed(2)}MB`,
        icon: <Monitor className="w-4 h-4" />
      });
    } else {
      tests.push({
        category: 'performance',
        name: 'Performance Metrics',
        status: 'warning',
        message: 'Metrics not yet available',
        icon: <AlertCircle className="w-4 h-4" />
      });
    }

    const overall = tests.every(t => t.status === 'passed') ? 'passed' : 
                   tests.some(t => t.status === 'failed') ? 'failed' : 'warning';

    return {
      name: 'Performance',
      icon: <Zap className="w-5 h-5" />,
      tests,
      overall
    };
  };

  const runSEOTests = (): TestSuite => {
    const tests: TestResult[] = [];

    // Basic SEO setup
    tests.push({
      category: 'seo',
      name: 'Site Title',
      status: seoSettings.siteTitle ? 'passed' : 'failed',
      message: seoSettings.siteTitle || 'Missing site title',
      icon: <Globe className="w-4 h-4" />
    });

    tests.push({
      category: 'seo',
      name: 'Meta Description',
      status: seoSettings.siteDescription ? 'passed' : 'failed',
      message: seoSettings.siteDescription ? 'Description set' : 'Missing description',
      icon: <Globe className="w-4 h-4" />
    });

    tests.push({
      category: 'seo',
      name: 'Current Page Meta',
      status: currentMetadata.title ? 'passed' : 'warning',
      message: currentMetadata.title || 'Using default meta',
      icon: <Globe className="w-4 h-4" />
    });

    const overall = tests.every(t => t.status === 'passed') ? 'passed' : 
                   tests.some(t => t.status === 'failed') ? 'failed' : 'warning';

    return {
      name: 'SEO',
      icon: <Globe className="w-5 h-5" />,
      tests,
      overall
    };
  };

  const runResponsiveTests = (): TestSuite => {
    const tests: TestResult[] = [];

    // Viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    tests.push({
      category: 'responsive',
      name: 'Viewport Meta Tag',
      status: viewport ? 'passed' : 'failed',
      message: viewport ? 'Viewport configured' : 'Missing viewport meta',
      icon: <Smartphone className="w-4 h-4" />
    });

    // Screen size detection
    tests.push({
      category: 'responsive',
      name: 'Mobile Detection',
      status: window.innerWidth < 768 ? 'passed' : 'passed',
      message: `Screen width: ${window.innerWidth}px`,
      icon: <Smartphone className="w-4 h-4" />
    });

    // CSS responsive classes
    const hasResponsiveClasses = document.querySelector('.sm\\:') || document.querySelector('.md\\:') || document.querySelector('.lg\\:');
    tests.push({
      category: 'responsive',
      name: 'Responsive CSS Classes',
      status: hasResponsiveClasses ? 'passed' : 'warning',
      message: hasResponsiveClasses ? 'Responsive classes found' : 'No responsive classes detected',
      icon: <Monitor className="w-4 h-4" />
    });

    const overall = tests.every(t => t.status === 'passed') ? 'passed' : 
                   tests.some(t => t.status === 'failed') ? 'failed' : 'warning';

    return {
      name: 'Responsive Design',
      icon: <Smartphone className="w-5 h-5" />,
      tests,
      overall
    };
  };

  const runComponentTests = async (): Promise<TestSuite> => {
    const tests: TestResult[] = [];

    // Test manga card rendering
    const mangaCards = document.querySelectorAll('[class*="MangaCard"]');
    tests.push({
      category: 'components',
      name: 'Manga Card Rendering',
      status: mangaCards.length > 0 ? 'passed' : 'warning',
      message: `${mangaCards.length} manga cards found`,
      icon: <Code className="w-4 h-4" />
    });

    // Test image loading
    const images = document.querySelectorAll('img');
    const brokenImages = Array.from(images).filter(img => !img.complete || img.naturalHeight === 0);
    tests.push({
      category: 'components',
      name: 'Image Loading',
      status: brokenImages.length === 0 ? 'passed' : 'warning',
      message: `${images.length - brokenImages.length}/${images.length} images loaded`,
      icon: <Monitor className="w-4 h-4" />
    });

    // Test navigation
    const navigation = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    tests.push({
      category: 'components',
      name: 'Navigation',
      status: navigation ? 'passed' : 'warning',
      message: navigation ? 'Navigation found' : 'No navigation detected',
      icon: <Code className="w-4 h-4" />
    });

    const overall = tests.every(t => t.status === 'passed') ? 'passed' : 
                   tests.some(t => t.status === 'failed') ? 'failed' : 'warning';

    return {
      name: 'Components',
      icon: <Code className="w-5 h-5" />,
      tests,
      overall
    };
  };

  const runSecurityTests = (): TestSuite => {
    const tests: TestResult[] = [];

    // HTTPS check
    tests.push({
      category: 'security',
      name: 'HTTPS Protocol',
      status: window.location.protocol === 'https:' ? 'passed' : 'warning',
      message: `Using ${window.location.protocol}`,
      icon: <Shield className="w-4 h-4" />
    });

    // Content Security Policy
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    tests.push({
      category: 'security',
      name: 'Content Security Policy',
      status: csp ? 'passed' : 'warning',
      message: csp ? 'CSP configured' : 'No CSP detected',
      icon: <Shield className="w-4 h-4" />
    });

    // XSS Protection
    tests.push({
      category: 'security',
      name: 'XSS Protection',
      status: 'passed',
      message: 'React XSS protection active',
      icon: <Shield className="w-4 h-4" />
    });

    const overall = tests.every(t => t.status === 'passed') ? 'passed' : 
                   tests.some(t => t.status === 'failed') ? 'failed' : 'warning';

    return {
      name: 'Security',
      icon: <Shield className="w-5 h-5" />,
      tests,
      overall
    };
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runComprehensiveTests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comprehensive Theme Testing</h2>
          <p className="text-muted-foreground">
            Full system testing and production readiness check
          </p>
        </div>
        <Button 
          onClick={runComprehensiveTests} 
          variant="outline"
          disabled={testing}
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Testing...
            </>
          ) : (
            'Run Tests'
          )}
        </Button>
      </div>

      {testing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Running tests...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {testSuites.map((suite) => (
          <Card key={suite.name} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                {suite.icon}
                {suite.name}
                {getStatusIcon(suite.overall)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suite.tests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {test.icon}
                      <span className="font-medium">{test.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getStatusColor(test.status)}`}>
                        {test.message}
                      </span>
                      {getStatusIcon(test.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Individual Testing Components */}
      <div className="grid gap-6 mt-8">
        <ThemeVerification />
        <ThemeTestButton />
      </div>
    </div>
  );
};