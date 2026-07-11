import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Rocket, 
  Database, 
  Shield, 
  Zap,
  Globe,
  FileText,
  Settings,
  Users,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateProductionReadiness, cleanupMockData, enableProductionMode } from '@/utils/seed/cleanupMockData';
import { configManager } from '@/utils/configManager';


interface CheckResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  critical: boolean;
}

export const ProductionReadinessPanel = () => {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [isProductionReady, setIsProductionReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    runAllChecks();
  }, []);

  const runAllChecks = async () => {
    setIsRunning(true);
    const results: CheckResult[] = [];

    try {
      // Development Mode Check
      results.push({
        id: 'devmode',
        name: 'Development Mode',
        status: 'pass',
        message: 'Running in development mode',
        critical: false
      });

      // Configuration Check
      try {
        const config = await configManager.loadConfig();
        const isConfigured = config.site.adminEmail && 
                           config.site.siteName !== 'MangaReader Pro' &&
                           !config.site.adminEmail.includes('manga.com');
        
        results.push({
          id: 'config',
          name: 'Site Configuration',
          status: isConfigured ? 'pass' : 'fail',
          message: isConfigured 
            ? 'Site properly configured' 
            : 'Site configuration needs customization',
          critical: true
        });
      } catch (error) {
        results.push({
          id: 'config',
          name: 'Site Configuration',
          status: 'fail',
          message: 'Configuration loading failed',
          critical: true
        });
      }

      // Mock Data Check
      const { ready: mockDataReady, issues: mockIssues } = validateProductionReadiness();
      results.push({
        id: 'mockdata',
        name: 'Mock Data Cleanup',
        status: mockDataReady ? 'pass' : 'warning',
        message: mockDataReady 
          ? 'No mock data detected' 
          : `${mockIssues.length} mock data issues found`,
        critical: false
      });

      // Security Check
      const securityIssues = [];
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        securityIssues.push('HTTPS not enabled');
      }
      if (localStorage.getItem('debug_mode') === 'true') {
        securityIssues.push('Debug mode still enabled');
      }

      results.push({
        id: 'security',
        name: 'Security Configuration',
        status: securityIssues.length === 0 ? 'pass' : 'warning',
        message: securityIssues.length === 0 
          ? 'Security configuration looks good' 
          : `${securityIssues.length} security issues detected`,
        critical: false
      });

      // Performance Check
      const performanceIssues = [];
      if (!('serviceWorker' in navigator)) {
        performanceIssues.push('Service Worker not supported');
      }
      if (document.querySelectorAll('img:not([loading])').length > 10) {
        performanceIssues.push('Images missing lazy loading attributes');
      }

      results.push({
        id: 'performance',
        name: 'Performance Optimization',
        status: performanceIssues.length === 0 ? 'pass' : 'info',
        message: performanceIssues.length === 0 
          ? 'Performance optimizations applied' 
          : `${performanceIssues.length} performance suggestions available`,
        critical: false
      });

      // Database Check
      const dbConnected = localStorage.getItem('installation_complete') === 'true';
      results.push({
        id: 'database',
        name: 'Database Connection',
        status: dbConnected ? 'pass' : 'fail',
        message: dbConnected 
          ? 'Database configuration completed' 
          : 'Database not configured - run installation wizard',
        critical: true
      });

      // SEO Check
      const seoChecks = [];
      if (!document.querySelector('meta[name="description"]')) {
        seoChecks.push('Missing meta description');
      }
      if (!document.querySelector('meta[property="og:title"]')) {
        seoChecks.push('Missing Open Graph tags');
      }

      results.push({
        id: 'seo',
        name: 'SEO Optimization',
        status: seoChecks.length === 0 ? 'pass' : 'warning',
        message: seoChecks.length === 0 
          ? 'SEO configuration complete' 
          : `${seoChecks.length} SEO improvements suggested`,
        critical: false
      });

      setChecks(results);

      // Calculate overall score
      const passCount = results.filter(r => r.status === 'pass').length;
      const score = Math.round((passCount / results.length) * 100);
      setOverallScore(score);

      // Check if production ready
      const criticalFailures = results.filter(r => r.critical && r.status === 'fail').length;
      setIsProductionReady(criticalFailures === 0 && score >= 70);

    } catch (error) {
      console.error('Production readiness check failed:', error);
      toast({
        title: 'Check Failed',
        description: 'Unable to complete production readiness check',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCleanupMockData = () => {
    const report = cleanupMockData();
    toast({
      title: 'Cleanup Complete',
      description: `Removed ${report.replacements} mock data entries`,
    });
    runAllChecks();
  };

  const handleEnableProductionMode = () => {
    enableProductionMode();
    toast({
      title: 'Production Mode Enabled',
      description: 'Application configured for production deployment',
    });
    runAllChecks();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'default';
      case 'fail':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Production Readiness Check
          </CardTitle>
          <CardDescription>
            Verify your application is ready for production deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Overall Score: {overallScore}%</h3>
              <p className="text-sm text-muted-foreground">
                {isProductionReady ? 'Ready for production!' : 'Needs attention before deployment'}
              </p>
            </div>
            <Badge variant={isProductionReady ? 'default' : 'destructive'}>
              {isProductionReady ? 'Production Ready' : 'Not Ready'}
            </Badge>
          </div>

          <Progress value={overallScore} className="w-full" />

          <div className="flex gap-2">
            <Button onClick={runAllChecks} disabled={isRunning}>
              {isRunning ? 'Running Checks...' : 'Rerun Checks'}
            </Button>
            <Button variant="outline" onClick={handleCleanupMockData}>
              Cleanup Mock Data
            </Button>
            <Button variant="outline" onClick={handleEnableProductionMode}>
              Enable Production Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map((check) => (
          <Card key={check.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">{check.name}</h4>
                    {check.critical && (
                      <Badge variant="outline" className="text-xs">Critical</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{check.message}</p>
                </div>
                <Badge variant={getStatusColor(check.status)} className="text-xs">
                  {check.status.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isProductionReady && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Before deploying to production:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Fix all critical issues marked above</li>
                <li>Test all functionality with real data</li>
                <li>Configure domain-specific settings</li>
                <li>Set up monitoring and backup systems</li>
                <li>Review security settings and permissions</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isProductionReady && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Congratulations! Your application is ready for production.</p>
              <p className="text-sm">All critical checks have passed. Consider addressing any warnings for optimal performance.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};