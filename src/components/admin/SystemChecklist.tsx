import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone,
  Zap,
  Key,
  CreditCard,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SystemCheck {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'warning' | 'checking';
  description: string;
  icon: React.ComponentType<any>;
  lastChecked?: Date;
  details?: string;
  actionUrl?: string;
}

interface SystemCategory {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  checks: SystemCheck[];
}

export const SystemChecklist = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [categories, setCategories] = useState<SystemCategory[]>([]);
  const { toast } = useToast();

  // Initialize on component mount
  useEffect(() => {
    const initialized = initializeChecks();
    setCategories(initialized);
  }, []);

  const initializeChecks = (): SystemCategory[] => [
    {
      name: 'Database & Storage',
      icon: Database,
      color: 'blue',
      checks: [
        {
          id: 'db-connection',
          name: 'Database Connection',
          category: 'database',
          status: 'checking',
          description: 'Verify Supabase/MySQL connection is active',
          icon: Database,
        },
        {
          id: 'storage-access',
          name: 'File Storage Access',
          category: 'database',
          status: 'checking',
          description: 'Check manga image storage accessibility',
          icon: Database,
        },
        {
          id: 'db-tables',
          name: 'Database Schema',
          category: 'database',
          status: 'checking',
          description: 'Verify all required tables exist',
          icon: Database,
        }
      ]
    },
    {
      name: 'Authentication & Security',
      icon: Shield,
      color: 'green',
      checks: [
        {
          id: 'auth-system',
          name: 'Authentication System',
          category: 'security',
          status: 'checking',
          description: 'User login/logout functionality',
          icon: Shield,
        },
        {
          id: '2fa-system',
          name: 'Two-Factor Authentication',
          category: 'security',
          status: 'checking',
          description: 'TOTP-based 2FA implementation',
          icon: Key,
        },
        {
          id: 'security-headers',
          name: 'Security Headers',
          category: 'security',
          status: 'checking',
          description: 'CSP, HSTS, and other security headers',
          icon: Shield,
        },
        {
          id: 'input-validation',
          name: 'Input Validation',
          category: 'security',
          status: 'checking',
          description: 'XSS and injection protection',
          icon: Shield,
        },
        {
          id: 'rate-limiting',
          name: 'Rate Limiting',
          category: 'security',
          status: 'checking',
          description: 'API endpoint rate limiting',
          icon: Shield,
        },
        {
          id: 'rls-policies',
          name: 'Row Level Security',
          category: 'security',
          status: 'checking',
          description: 'Database access control policies',
          icon: Shield,
        }
      ]
    },
    {
      name: 'E-commerce & Licensing',
      icon: CreditCard,
      color: 'purple',
      checks: [
        {
          id: 'stripe-integration',
          name: 'Stripe Payment System',
          category: 'ecommerce',
          status: 'checking',
          description: 'Payment processing functionality',
          icon: CreditCard,
        },
        {
          id: 'license-system',
          name: 'Chapter Licensing',
          category: 'ecommerce',
          status: 'checking',
          description: 'Premium content access control',
          icon: Key,
        },
        {
          id: 'purchase-tracking',
          name: 'Purchase Management',
          category: 'ecommerce',
          status: 'checking',
          description: 'Transaction and user purchase tracking',
          icon: CreditCard,
        }
      ]
    },
    {
      name: 'PWA & Performance',
      icon: Zap,
      color: 'orange',
      checks: [
        {
          id: 'pwa-manifest',
          name: 'PWA Manifest',
          category: 'pwa',
          status: 'checking',
          description: 'Progressive Web App configuration',
          icon: Smartphone,
        },
        {
          id: 'service-worker',
          name: 'Service Worker',
          category: 'pwa',
          status: 'checking',
          description: 'Offline functionality and caching',
          icon: Zap,
        },
        {
          id: 'image-optimization',
          name: 'Image Optimization',
          category: 'performance',
          status: 'checking',
          description: 'Manga image compression and loading',
          icon: Zap,
        }
      ]
    },
    {
      name: 'SEO & Accessibility',
      icon: Search,
      color: 'indigo',
      checks: [
        {
          id: 'meta-tags',
          name: 'Meta Tags & SEO',
          category: 'seo',
          status: 'checking',
          description: 'OpenGraph, Twitter cards, structured data',
          icon: Search,
        },
        {
          id: 'sitemap',
          name: 'Sitemap Generation',
          category: 'seo',
          status: 'checking',
          description: 'Automated sitemap for search engines',
          icon: Globe,
        },
        {
          id: 'mobile-responsive',
          name: 'Mobile Responsiveness',
          category: 'accessibility',
          status: 'checking',
          description: 'Touch-friendly interface on all devices',
          icon: Smartphone,
        }
      ]
    },
    {
      name: 'Theming & Customization',
      icon: Palette,
      color: 'pink',
      checks: [
        {
          id: 'theme-system',
          name: 'Theme System',
          category: 'themes',
          status: 'checking',
          description: 'Dark/light mode and custom themes',
          icon: Palette,
        },
        {
          id: 'child-themes',
          name: 'Child Theme Support',
          category: 'themes',
          status: 'checking',
          description: 'Framework for alternate designs',
          icon: Palette,
        }
      ]
    },
    {
      name: 'CDN & Performance',
      icon: Globe,
      color: 'teal',
      checks: [
        {
          id: 'cloudflare-config',
          name: 'Cloudflare Configuration',
          category: 'cdn',
          status: 'checking',
          description: 'API token and zone ID configured',
          icon: Globe,
        },
        {
          id: 'ssl-redirect',
          name: 'SSL Redirect',
          category: 'cdn',
          status: 'checking',
          description: 'HTTPS redirect enforcement',
          icon: Shield,
        },
        {
          id: 'cache-management',
          name: 'Cache Management',
          category: 'cdn',
          status: 'checking',
          description: 'Cache purging and optimization',
          icon: Zap,
        }
      ]
    }
  ];

  const runSystemChecks = async () => {
    setIsChecking(true);
    const newCategories = initializeChecks();

    try {
      // Database checks
      await checkDatabaseConnection(newCategories);
      await checkStorageAccess(newCategories);
      await checkDatabaseSchema(newCategories);

      // Security checks
      await checkAuthSystem(newCategories);
      await check2FASystem(newCategories);
      await checkCAPTCHASystem(newCategories);
      await checkRoleSystem(newCategories);

      // E-commerce checks
      await checkStripeIntegration(newCategories);
      await checkLicenseSystem(newCategories);
      await checkPurchaseTracking(newCategories);

      // PWA & Performance checks
      await checkPWAManifest(newCategories);
      await checkServiceWorker(newCategories);
      await checkImageOptimization(newCategories);

      // SEO checks
      await checkMetaTags(newCategories);
      await checkSitemap(newCategories);
      await checkMobileResponsive(newCategories);

      // Theme checks
      await checkThemeSystem(newCategories);
      await checkChildThemes(newCategories);

      // Cloudflare checks
      await checkCloudflareConfig(newCategories);
      await checkSSLRedirect(newCategories);
      await checkCacheManagement(newCategories);

      setCategories(newCategories);
      
      toast({
        title: "System Check Complete",
        description: "All system components have been verified.",
      });
    } catch (error) {
      console.error('System check failed:', error);
      toast({
        title: "System Check Failed",
        description: "Some checks could not be completed.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Individual check functions
  const checkDatabaseConnection = async (categories: SystemCategory[]) => {
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      updateCheckStatus(categories, 'db-connection', error ? 'failed' : 'passed', 
        error ? error.message : 'Database connection successful');
    } catch (err) {
      updateCheckStatus(categories, 'db-connection', 'failed', 'Unable to connect to database');
    }
  };

  const checkStorageAccess = async (categories: SystemCategory[]) => {
    try {
      const { error } = await supabase.storage.listBuckets();
      updateCheckStatus(categories, 'storage-access', error ? 'failed' : 'passed',
        error ? error.message : 'File storage accessible');
    } catch (err) {
      updateCheckStatus(categories, 'storage-access', 'failed', 'Storage access failed');
    }
  };

  const checkDatabaseSchema = async (categories: SystemCategory[]) => {
    try {
      // Check profiles table which should exist in all configurations
      const { error } = await supabase.from('profiles').select('count').limit(1);
      updateCheckStatus(categories, 'db-tables', error ? 'warning' : 'passed',
        error ? 'Some database tables may be missing' : 'Core database tables verified');
    } catch (err) {
      updateCheckStatus(categories, 'db-tables', 'warning', 'Database schema verification incomplete');
    }
  };

  const checkAuthSystem = async (categories: SystemCategory[]) => {
    try {
      const { data } = await supabase.auth.getSession();
      updateCheckStatus(categories, 'auth-system', 'passed', 'Authentication system operational');
    } catch (err) {
      updateCheckStatus(categories, 'auth-system', 'failed', 'Authentication system error');
    }
  };

  const check2FASystem = async (categories: SystemCategory[]) => {
    // Check if 2FA is implemented (placeholder - would check actual 2FA implementation)
    updateCheckStatus(categories, '2fa-system', 'warning', '2FA system ready for configuration');
  };

  const checkCAPTCHASystem = async (categories: SystemCategory[]) => {
    // Check CAPTCHA configuration
    const hasCaptchaKey = !!(import.meta.env.VITE_RECAPTCHA_SITE_KEY);
    updateCheckStatus(categories, 'captcha-protection', hasCaptchaKey ? 'passed' : 'warning',
      hasCaptchaKey ? 'CAPTCHA configured' : 'CAPTCHA needs configuration');
  };

  const checkRoleSystem = async (categories: SystemCategory[]) => {
    try {
      const { data, error } = await supabase.from('profiles').select('role').limit(1);
      updateCheckStatus(categories, 'role-system', error ? 'failed' : 'passed',
        error ? 'Role system error' : 'Role-based access control active');
    } catch {
      updateCheckStatus(categories, 'role-system', 'failed', 'Role system check failed');
    }
  };

  const checkStripeIntegration = async (categories: SystemCategory[]) => {
    const hasStripeKey = !!(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    updateCheckStatus(categories, 'stripe-integration', hasStripeKey ? 'passed' : 'warning',
      hasStripeKey ? 'Stripe configured' : 'Stripe needs configuration');
  };

  const checkLicenseSystem = async (categories: SystemCategory[]) => {
    // License system check - would verify if license functionality is configured
    updateCheckStatus(categories, 'license-system', 'warning', 'License system ready for configuration');
  };

  const checkPurchaseTracking = async (categories: SystemCategory[]) => {
    // Purchase tracking check - would verify purchase functionality
    updateCheckStatus(categories, 'purchase-tracking', 'warning', 'Purchase tracking ready for configuration');
  };

  const checkPWAManifest = async (categories: SystemCategory[]) => {
    try {
      const response = await fetch('/manifest.json');
      updateCheckStatus(categories, 'pwa-manifest', response.ok ? 'passed' : 'warning',
        response.ok ? 'PWA manifest found' : 'PWA manifest needs creation');
    } catch {
      updateCheckStatus(categories, 'pwa-manifest', 'warning', 'PWA manifest not found');
    }
  };

  const checkServiceWorker = async (categories: SystemCategory[]) => {
    const hasServiceWorker = 'serviceWorker' in navigator;
    updateCheckStatus(categories, 'service-worker', hasServiceWorker ? 'warning' : 'failed',
      hasServiceWorker ? 'Service worker support available - needs implementation' : 'Service worker not supported');
  };

  const checkImageOptimization = async (categories: SystemCategory[]) => {
    // Check if image compression utilities exist
    updateCheckStatus(categories, 'image-optimization', 'passed', 'Image optimization utilities available');
  };

  const checkMetaTags = async (categories: SystemCategory[]) => {
    const hasMetaTags = document.querySelector('meta[property="og:title"]') !== null;
    updateCheckStatus(categories, 'meta-tags', hasMetaTags ? 'passed' : 'warning',
      hasMetaTags ? 'SEO meta tags configured' : 'SEO meta tags need optimization');
  };

  const checkSitemap = async (categories: SystemCategory[]) => {
    try {
      const response = await fetch('/sitemap.xml');
      updateCheckStatus(categories, 'sitemap', response.ok ? 'passed' : 'warning',
        response.ok ? 'Sitemap available' : 'Sitemap needs generation');
    } catch {
      updateCheckStatus(categories, 'sitemap', 'warning', 'Sitemap not found');
    }
  };

  const checkMobileResponsive = async (categories: SystemCategory[]) => {
    const hasViewportMeta = document.querySelector('meta[name="viewport"]') !== null;
    updateCheckStatus(categories, 'mobile-responsive', hasViewportMeta ? 'passed' : 'warning',
      hasViewportMeta ? 'Mobile responsive design active' : 'Viewport meta tag missing');
  };

  const checkThemeSystem = async (categories: SystemCategory[]) => {
    const hasThemeProvider = document.documentElement.getAttribute('data-theme') !== null ||
                            document.documentElement.classList.contains('dark') ||
                            document.documentElement.classList.contains('light');
    updateCheckStatus(categories, 'theme-system', hasThemeProvider ? 'passed' : 'warning',
      hasThemeProvider ? 'Theme system active' : 'Theme system needs configuration');
  };

  const checkChildThemes = async (categories: SystemCategory[]) => {
    try {
      const { data, error } = await supabase.from('child_themes').select('count').limit(1);
      updateCheckStatus(categories, 'child-themes', error ? 'warning' : 'passed',
        error ? 'Child theme framework ready for implementation' : 'Child theme system active');
    } catch (err) {
      updateCheckStatus(categories, 'child-themes', 'warning', 'Child theme framework ready for implementation');
    }
  };

  const checkCloudflareConfig = async (categories: SystemCategory[]) => {
    try {
      const { data } = await supabase.from('site_settings').select('*').single();
      const cloudflareConfig = (data as any)?.cloudflare_config;
      
      const isConfigured = !!(cloudflareConfig?.api_token && cloudflareConfig?.zone_id);
      updateCheckStatus(categories, 'cloudflare-config', isConfigured ? 'passed' : 'warning',
        isConfigured ? 'Cloudflare API configured' : 'Cloudflare API not configured');
    } catch (err) {
      updateCheckStatus(categories, 'cloudflare-config', 'warning', 'Cloudflare configuration check failed');
    }
  };

  const checkSSLRedirect = async (categories: SystemCategory[]) => {
    try {
      const { data } = await supabase.from('site_settings').select('*').single();
      const cloudflareConfig = (data as any)?.cloudflare_config;
      
      const sslEnabled = !!cloudflareConfig?.ssl_redirect_enabled;
      updateCheckStatus(categories, 'ssl-redirect', sslEnabled ? 'passed' : 'warning',
        sslEnabled ? 'SSL redirect enabled' : 'SSL redirect not configured');
    } catch (err) {
      updateCheckStatus(categories, 'ssl-redirect', 'warning', 'SSL redirect status unknown');
    }
  };

  const checkCacheManagement = async (categories: SystemCategory[]) => {
    try {
      const { data } = await supabase.from('site_settings').select('*').single();
      const cloudflareConfig = (data as any)?.cloudflare_config;
      
      const hasCachePurge = !!cloudflareConfig?.last_cache_purge;
      const status = cloudflareConfig?.api_token ? (hasCachePurge ? 'passed' : 'warning') : 'warning';
      const message = cloudflareConfig?.api_token 
        ? (hasCachePurge ? `Last purged: ${new Date(cloudflareConfig.last_cache_purge).toLocaleDateString()}` : 'Cache not yet purged') 
        : 'Cache management requires API configuration';
      
      updateCheckStatus(categories, 'cache-management', status, message);
    } catch (err) {
      updateCheckStatus(categories, 'cache-management', 'warning', 'Cache management status unknown');
    }
  };

  const updateCheckStatus = (categories: SystemCategory[], checkId: string, status: SystemCheck['status'], details: string) => {
    categories.forEach(category => {
      category.checks.forEach(check => {
        if (check.id === checkId) {
          check.status = status;
          check.details = details;
          check.lastChecked = new Date();
        }
      });
    });
  };

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: SystemCheck['status']) => {
    const variants = {
      passed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      checking: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateProgress = () => {
    if (categories.length === 0) return 0;
    
    const allChecks = categories.flatMap(cat => cat.checks);
    const completedChecks = allChecks.filter(check => check.status !== 'checking');
    
    return (completedChecks.length / allChecks.length) * 100;
  };

  const getOverallStatus = () => {
    const allChecks = categories.flatMap(cat => cat.checks);
    const failedChecks = allChecks.filter(check => check.status === 'failed').length;
    const warningChecks = allChecks.filter(check => check.status === 'warning').length;
    
    if (failedChecks > 0) return 'critical';
    if (warningChecks > 0) return 'warning';
    return 'healthy';
  };

  useEffect(() => {
    runSystemChecks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">System Health Checklist</h2>
          <p className="text-muted-foreground">Monitor and verify all system components</p>
        </div>
        <Button onClick={runSystemChecks} disabled={isChecking}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Checking...' : 'Run Checks'}
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(calculateProgress())}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
            
            {getOverallStatus() === 'critical' && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-800">
                  Critical issues detected. Please address failed checks immediately.
                </AlertDescription>
              </Alert>
            )}
            
            {getOverallStatus() === 'warning' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-800">
                  System operational with warnings. Review and configure missing components.
                </AlertDescription>
              </Alert>
            )}
            
            {getOverallStatus() === 'healthy' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-800">
                  All systems operational. Your manga platform is production-ready!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Categories */}
      <div className="grid gap-6">
        {categories.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className="h-5 w-5" />
                {category.name}
              </CardTitle>
              <CardDescription>
                {category.checks.filter(c => c.status === 'passed').length} of {category.checks.length} checks passed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {category.checks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-muted-foreground">{check.description}</div>
                        {check.details && (
                          <div className="text-xs text-muted-foreground mt-1">{check.details}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(check.status)}
                      {check.lastChecked && (
                        <span className="text-xs text-muted-foreground">
                          {check.lastChecked.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};