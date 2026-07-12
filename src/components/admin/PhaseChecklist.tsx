import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Shield,
  Database,
  Palette,
  CreditCard,
  Zap,
  Users,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PhaseItem {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'not-started' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  dependencies?: string[];
}

interface Phase {
  id: number;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  items: PhaseItem[];
  isActive: boolean;
}

export const PhaseChecklist: React.FC = () => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [activePhase, setActivePhase] = useState<number>(5); // Currently in Phase 5

  useEffect(() => {
    initializePhases();
    checkCurrentStatus();
  }, []);

  const initializePhases = () => {
    const phaseData: Phase[] = [
      {
        id: 1,
        name: 'Foundation Setup',
        description: 'Core infrastructure and basic functionality',
        icon: Database,
        isActive: false,
        items: [
          {
            id: 'db-setup',
            name: 'Database Setup',
            description: 'Supabase connection and schema',
            status: 'completed',
            priority: 'high',
            estimatedTime: '2h'
          },
          {
            id: 'auth-system',
            name: 'Authentication System',
            description: 'User login, registration, password reset',
            status: 'completed',
            priority: 'high',
            estimatedTime: '4h'
          },
          {
            id: 'basic-ui',
            name: 'Basic UI Components',
            description: 'Header, navigation, footer, basic layouts',
            status: 'completed',
            priority: 'medium',
            estimatedTime: '3h'
          },
          {
            id: 'file-storage',
            name: 'File Storage Setup',
            description: 'Image upload and storage configuration',
            status: 'completed',
            priority: 'medium',
            estimatedTime: '2h'
          }
        ]
      },
      {
        id: 2,
        name: 'Core Features',
        description: 'Manga reading and management features',
        icon: Users,
        isActive: false,
        items: [
          {
            id: 'manga-reader',
            name: 'Manga Reader',
            description: 'Chapter viewing, navigation, bookmarks',
            status: 'completed',
            priority: 'high',
            estimatedTime: '6h'
          },
          {
            id: 'chapter-management',
            name: 'Chapter Management',
            description: 'Admin tools for uploading and organizing chapters',
            status: 'completed',
            priority: 'high',
            estimatedTime: '4h'
          },
          {
            id: 'user-profiles',
            name: 'User Profiles',
            description: 'User accounts, preferences, reading history',
            status: 'completed',
            priority: 'medium',
            estimatedTime: '3h'
          },
          {
            id: 'comments-system',
            name: 'Comments System',
            description: 'Chapter comments and user interactions',
            status: 'completed',
            priority: 'low',
            estimatedTime: '3h'
          }
        ]
      },
      {
        id: 3,
        name: 'Premium Features',
        description: 'Monetization and premium content',
        icon: CreditCard,
        isActive: false,
        items: [
          {
            id: 'payment-integration',
            name: 'Payment Integration',
            description: 'PayPal/Stripe integration for subscriptions',
            status: 'completed',
            priority: 'high',
            estimatedTime: '5h'
          },
          {
            id: 'premium-gating',
            name: 'Premium Content Gating',
            description: 'Restrict access to premium chapters',
            status: 'completed',
            priority: 'high',
            estimatedTime: '3h'
          },
          {
            id: 'subscription-management',
            name: 'Subscription Management',
            description: 'User subscription status and billing',
            status: 'completed',
            priority: 'medium',
            estimatedTime: '4h'
          },
          {
            id: 'premium-themes',
            name: 'Premium Themes',
            description: 'Exclusive themes for premium users',
            status: 'completed',
            priority: 'low',
            estimatedTime: '2h'
          }
        ]
      },
      {
        id: 4,
        name: 'Advanced Systems',
        description: 'Performance, security, and scalability',
        icon: Shield,
        isActive: false,
        items: [
          {
            id: 'security-hardening',
            name: 'Security Hardening',
            description: '2FA, rate limiting, input validation',
            status: 'completed',
            priority: 'high',
            estimatedTime: '4h'
          },
          {
            id: 'performance-optimization',
            name: 'Performance Optimization',
            description: 'Image compression, lazy loading, caching',
            status: 'completed',
            priority: 'medium',
            estimatedTime: '3h'
          },
          {
            id: 'seo-implementation',
            name: 'SEO Implementation',
            description: 'Meta tags, sitemap, structured data',
            status: 'completed',
            priority: 'medium',
            estimatedTime: '3h'
          },
          {
            id: 'analytics-tracking',
            name: 'Analytics & Tracking',
            description: 'User behavior and performance monitoring',
            status: 'completed',
            priority: 'low',
            estimatedTime: '2h'
          }
        ]
      },
      {
        id: 5,
        name: 'QA & Cleanup',
        description: 'Bug fixes, optimization, and final polish',
        icon: Settings,
        isActive: true,
        items: [
          {
            id: 'database-fixes',
            name: 'Database Query Fixes',
            description: 'Fix purchase/license fetch errors',
            status: 'in-progress',
            priority: 'high',
            estimatedTime: '2h'
          },
          {
            id: 'system-health',
            name: 'System Health Checks',
            description: 'Working system checklist and verification',
            status: 'in-progress',
            priority: 'high',
            estimatedTime: '1h'
          },
          {
            id: 'ui-improvements',
            name: 'UI/UX Improvements',
            description: 'File upload, user management interface',
            status: 'not-started',
            priority: 'medium',
            estimatedTime: '3h'
          },
          {
            id: 'data-cleanup',
            name: 'Remove Placeholder Data',
            description: 'Replace all fake data with real data sources',
            status: 'not-started',
            priority: 'medium',
            estimatedTime: '2h'
          },
          {
            id: 'screenshot-optimization',
            name: 'Screenshot Optimization',
            description: 'Reduce screenshot spam and add lazy loading',
            status: 'not-started',
            priority: 'low',
            estimatedTime: '1h'
          },
          {
            id: 'theme-architecture',
            name: 'Enhanced Theme System',
            description: 'Complete theme override architecture',
            status: 'in-progress',
            priority: 'high',
            estimatedTime: '4h'
          },
          {
            id: 'validation-tools',
            name: 'Validation & Checklist Tools',
            description: 'Dynamic completion tracking',
            status: 'in-progress',
            priority: 'medium',
            estimatedTime: '2h'
          }
        ]
      }
    ];

    setPhases(phaseData);
  };

  const checkCurrentStatus = async () => {
    // This would check actual system status and update phase items accordingly
    // For now, we'll use the static data above
  };

  const getStatusIcon = (status: PhaseItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'blocked':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 border-2 border-muted rounded-full" />;
    }
  };

  const getStatusBadge = (status: PhaseItem['status']) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      blocked: 'bg-red-100 text-red-800',
      'not-started': 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[status]}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: PhaseItem['priority']) => {
    const variants = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge variant="outline" className={variants[priority]}>
        {priority}
      </Badge>
    );
  };

  const calculatePhaseProgress = (phase: Phase) => {
    const completed = phase.items.filter(item => item.status === 'completed').length;
    return (completed / phase.items.length) * 100;
  };

  const getOverallProgress = () => {
    const allItems = phases.flatMap(phase => phase.items);
    const completed = allItems.filter(item => item.status === 'completed').length;
    return (completed / allItems.length) * 100;
  };

  const getCurrentPhaseItems = () => {
    const currentPhase = phases.find(p => p.isActive);
    return currentPhase ? currentPhase.items : [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Development Phase Checklist</h2>
          <p className="text-muted-foreground">
            Track progress through all development phases
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Overall Progress</p>
          <div className="flex items-center gap-2">
            <Progress value={getOverallProgress()} className="w-32" />
            <span className="text-sm font-medium">{Math.round(getOverallProgress())}%</span>
          </div>
        </div>
      </div>

      <Tabs value={activePhase.toString()} onValueChange={(value) => setActivePhase(parseInt(value))}>
        <TabsList className="grid w-full grid-cols-5">
          {phases.map((phase) => (
            <TabsTrigger key={phase.id} value={phase.id.toString()} className="flex items-center gap-2">
              <phase.icon className="h-4 w-4" />
              Phase {phase.id}
            </TabsTrigger>
          ))}
        </TabsList>

        {phases.map((phase) => (
          <TabsContent key={phase.id} value={phase.id.toString()}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <phase.icon className="h-5 w-5" />
                      {phase.name}
                      {phase.isActive && <Badge>Current Phase</Badge>}
                    </CardTitle>
                    <CardDescription>{phase.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Phase Progress</p>
                    <div className="flex items-center gap-2">
                      <Progress value={calculatePhaseProgress(phase)} className="w-24" />
                      <span className="text-sm font-medium">{Math.round(calculatePhaseProgress(phase))}%</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {phase.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getPriorityBadge(item.priority)}
                            <span className="text-xs text-muted-foreground">Est: {item.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Current Phase Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Phase 5 Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getCurrentPhaseItems().filter(item => item.status === 'completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getCurrentPhaseItems().filter(item => item.status === 'in-progress').length}
              </div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {getCurrentPhaseItems().filter(item => item.status === 'not-started').length}
              </div>
              <p className="text-sm text-muted-foreground">Not Started</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {getCurrentPhaseItems().filter(item => item.status === 'blocked').length}
              </div>
              <p className="text-sm text-muted-foreground">Blocked</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Next Actions:</h4>
            <ul className="text-sm space-y-1">
              {getCurrentPhaseItems()
                .filter(item => item.status === 'in-progress' || item.status === 'not-started')
                .slice(0, 3)
                .map(item => (
                  <li key={item.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {item.name} ({item.priority} priority)
                  </li>
                ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};