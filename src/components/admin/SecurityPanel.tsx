import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Ban, 
  Settings, 
  Eye,
  RefreshCw,
  Lock,
  Globe
} from 'lucide-react';
import { SecurityValidator } from '@/utils/security/validation';
import { globalRateLimiter, RATE_LIMIT_CONFIGS, RateLimitResult } from '@/utils/security/rateLimiting';
import { getSecurityHeaders } from '@/utils/security/headers';
import { useToast } from '@/hooks/use-toast';

interface SecurityStatus {
  overall: 'secure' | 'warning' | 'critical';
  score: number;
  issues: SecurityIssue[];
}

interface SecurityIssue {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  resolved: boolean;
}

interface RateLimitStat {
  endpoint: string;
  requests: number;
  blocked: number;
  lastActivity: Date;
}

export const SecurityPanel = () => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    overall: 'warning',
    score: 75,
    issues: []
  });
  const [rateLimitStats, setRateLimitStats] = useState<RateLimitStat[]>([]);
  const [securitySettings, setSecuritySettings] = useState({
    enableHeaders: true,
    enableRateLimit: true,
    enableInputValidation: true,
    strictMode: false,
    logSecurityEvents: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityStatus();
    loadRateLimitStats();
    checkSecurityHeaders();
  }, []);

  const loadSecurityStatus = async () => {
    // Simulate security checks
    const issues: SecurityIssue[] = [
      {
        id: 'headers',
        level: 'warning',
        title: 'Security Headers',
        description: 'Some security headers are missing or misconfigured',
        resolved: false
      },
      {
        id: 'rls',
        level: 'info',
        title: 'Row Level Security',
        description: 'RLS policies are active and properly configured',
        resolved: true
      },
      {
        id: 'validation',
        level: 'info',
        title: 'Input Validation',
        description: 'Input validation system is active',
        resolved: true
      }
    ];

    const score = Math.round((issues.filter(i => i.resolved).length / issues.length) * 100);
    const overall = score >= 90 ? 'secure' : score >= 70 ? 'warning' : 'critical';

    setSecurityStatus({ overall, score, issues });
  };

  const loadRateLimitStats = () => {
    // Simulate rate limit statistics
    const stats: RateLimitStat[] = [
      {
        endpoint: 'login',
        requests: 1250,
        blocked: 23,
        lastActivity: new Date()
      },
      {
        endpoint: 'comments',
        requests: 5680,
        blocked: 12,
        lastActivity: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        endpoint: 'api_general',
        requests: 12840,
        blocked: 156,
        lastActivity: new Date(Date.now() - 2 * 60 * 1000)
      }
    ];

    setRateLimitStats(stats);
  };

  const checkSecurityHeaders = () => {
    const headers = getSecurityHeaders();
    console.log('Security Headers Configuration:', headers);
  };

  const testInputValidation = () => {
    const testInputs = [
      '<script>alert("xss")</script>',
      "'; DROP TABLE users; --",
      'Normal text content',
      '<p>Safe <strong>HTML</strong> content</p>'
    ];

    testInputs.forEach(input => {
      const result = SecurityValidator.isSecureInput(input);
      console.log(`Input: "${input}" - Secure: ${result.isSecure}`, result.threats);
    });

    toast({
      title: "Validation Test Complete",
      description: "Check console for detailed results"
    });
  };

  const testRateLimit = (endpoint: string) => {
    const identifier = `test-user-${Date.now()}`;
    const result = globalRateLimiter.check(identifier, endpoint);
    
    toast({
      title: result.allowed ? "Request Allowed" : "Rate Limited",
      description: `${result.remaining} requests remaining. Resets at ${new Date(result.resetTime).toLocaleTimeString()}`,
      variant: result.allowed ? "default" : "destructive"
    });
  };

  const updateSecuritySettings = async () => {
    setIsLoading(true);
    
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Security Settings Updated",
        description: "Security configuration has been saved successfully"
      });
      
      await loadSecurityStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (level: SecurityStatus['overall']) => {
    switch (level) {
      case 'secure': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getIssueIcon = (level: SecurityIssue['level']) => {
    switch (level) {
      case 'info': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Center
          </h2>
          <p className="text-muted-foreground">
            Monitor and manage application security
          </p>
        </div>
        <Button onClick={loadSecurityStatus} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Security Status</CardTitle>
              <CardDescription>Overall security assessment</CardDescription>
            </div>
            <Badge 
              variant={securityStatus.overall === 'secure' ? 'default' : 'destructive'}
              className={getStatusColor(securityStatus.overall)}
            >
              {securityStatus.overall.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Security Score</span>
                <span>{securityStatus.score}%</span>
              </div>
              <Progress value={securityStatus.score} className="h-2" />
            </div>
            
            <div className="space-y-2">
              {securityStatus.issues.map(issue => (
                <div key={issue.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  {getIssueIcon(issue.level)}
                  <div className="flex-1">
                    <div className="font-medium">{issue.title}</div>
                    <div className="text-sm text-muted-foreground">{issue.description}</div>
                  </div>
                  {issue.resolved && (
                    <Badge variant="outline" className="text-green-600">
                      Resolved
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="headers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="headers">Security Headers</TabsTrigger>
          <TabsTrigger value="ratelimit">Rate Limiting</TabsTrigger>
          <TabsTrigger value="validation">Input Validation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Security Headers */}
        <TabsContent value="headers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                HTTP Security Headers
              </CardTitle>
              <CardDescription>
                Configure security headers to protect against common attacks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Security headers are configured but may need server-side implementation for full effectiveness.
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4">
                  {Object.entries(getSecurityHeaders()).map(([header, value]) => (
                    <div key={header} className="space-y-2">
                      <Label className="font-mono text-sm">{header}</Label>
                      <Textarea 
                        value={value} 
                        readOnly 
                        className="font-mono text-xs bg-muted"
                        rows={header === 'Content-Security-Policy' ? 3 : 1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limiting */}
        <TabsContent value="ratelimit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Rate Limiting Status
              </CardTitle>
              <CardDescription>
                Monitor and manage API rate limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4">
                  {rateLimitStats.map(stat => (
                    <div key={stat.endpoint} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">{stat.endpoint.replace('_', ' ')}</div>
                        <div className="text-sm text-muted-foreground">
                          Last activity: {stat.lastActivity.toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <span className="text-green-600">{stat.requests}</span> total / 
                          <span className="text-red-600 ml-1">{stat.blocked}</span> blocked
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => testRateLimit(stat.endpoint)}
                          className="mt-2"
                        >
                          Test Limit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Rate Limit Configuration</h4>
                  <div className="grid gap-4">
                    {Object.entries(RATE_LIMIT_CONFIGS).map(([endpoint, config]) => (
                      <div key={endpoint} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{endpoint.replace('_', ' ')}</span>
                          <Badge variant="outline">
                            {config.maxRequests} req / {config.windowMs / 1000}s
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Input Validation */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Input Validation & Sanitization
              </CardTitle>
              <CardDescription>
                Test and monitor input security measures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={testInputValidation}>
                  Test Validation System
                </Button>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Input validation system is active and protecting against:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Cross-Site Scripting (XSS)</li>
                      <li>SQL Injection</li>
                      <li>HTML Injection</li>
                      <li>Path Traversal</li>
                      <li>Command Injection</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Manage security features and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Security Headers</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable HTTP security headers
                      </p>
                    </div>
                    <Switch 
                      checked={securitySettings.enableHeaders}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, enableHeaders: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rate Limiting</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable API rate limiting
                      </p>
                    </div>
                    <Switch 
                      checked={securitySettings.enableRateLimit}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, enableRateLimit: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Input Validation</Label>
                      <p className="text-sm text-muted-foreground">
                        Validate and sanitize user input
                      </p>
                    </div>
                    <Switch 
                      checked={securitySettings.enableInputValidation}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, enableInputValidation: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Strict Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enhanced security with stricter policies
                      </p>
                    </div>
                    <Switch 
                      checked={securitySettings.strictMode}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, strictMode: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Security Event Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Log security events and threats
                      </p>
                    </div>
                    <Switch 
                      checked={securitySettings.logSecurityEvents}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, logSecurityEvents: checked }))
                      }
                    />
                  </div>
                </div>

                <Button 
                  onClick={updateSecuritySettings} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Update Security Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};