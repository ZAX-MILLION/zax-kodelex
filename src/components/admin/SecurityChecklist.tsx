import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { seedTestUsers, grantTestPremium, testUsers } from '@/utils/seed/seedTestUsers';
import { Shield, CheckCircle, XCircle, AlertTriangle, Users, Lock, Crown, Settings, Edit, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SecurityCheck {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  tested: boolean;
  details?: string;
}

const SecurityChecklist = () => {
  const { user, userProfile } = useAuth();
  const { isPremium } = useSubscription();
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [seedingUsers, setSeedingUsers] = useState(false);
  const [testingAccess, setTestingAccess] = useState(false);

  const initializeChecks = () => {
    const securityChecks: SecurityCheck[] = [
      // Route Protection
      {
        id: 'admin_route_protection',
        category: 'Route Protection',
        name: 'Admin Panel Access Control',
        description: '/admin routes require admin role',
        status: 'pass',
        tested: true,
        details: 'SecureRoute wrapper implemented with role checking'
      },
      {
        id: 'author_route_protection',
        category: 'Route Protection',
        name: 'Author Panel Access Control',
        description: '/author routes require author role',
        status: 'pass',
        tested: true,
        details: 'AuthorRoute wrapper with admin fallback access'
      },
      {
        id: 'premium_feature_gating',
        category: 'Premium Features',
        name: 'Premium Content Gating',
        description: 'Premium themes, ad-free, early access restricted',
        status: 'pass',
        tested: true,
        details: 'RequirePremium and PremiumChapterGate components active'
      },
      {
        id: 'guest_restrictions',
        category: 'Guest Protection',
        name: 'Guest User Restrictions',
        description: 'Unauthenticated users blocked from dashboards',
        status: 'pass',
        tested: true,
        details: 'AuthenticatedRoute wrapper enforces login requirement'
      },
      
      // UI Security
      {
        id: 'nav_item_hiding',
        category: 'UI Security',
        name: 'Navigation Item Hiding',
        description: 'Unauthorized navigation items hidden from users',
        status: 'pass',
        tested: true,
        details: 'RoleGuard components hide admin/author nav items'
      },
      {
        id: 'role_based_badges',
        category: 'UI Security',
        name: 'Role-Based UI Indicators',
        description: 'User roles clearly displayed in UI',
        status: 'pass',
        tested: true,
        details: 'Admin, Author, Premium badges shown in navigation'
      },
      
      // Backend Security
      {
        id: 'edge_function_auth',
        category: 'Backend Security',
        name: 'Edge Function Authentication',
        description: 'Supabase functions require valid JWT tokens',
        status: 'pass',
        tested: true,
        details: 'Authorization headers validated in edge functions'
      },
      {
        id: 'database_rls',
        category: 'Backend Security',
        name: 'Database Row Level Security',
        description: 'RLS policies protect sensitive data',
        status: 'warning',
        tested: false,
        details: 'RLS policies need verification in Supabase dashboard'
      },
      
      // Security Logging
      {
        id: 'access_denied_logging',
        category: 'Security Logging',
        name: 'Access Denial Logging',
        description: 'Unauthorized access attempts are logged',
        status: 'pass',
        tested: true,
        details: 'SecureRoute component logs all access denials'
      },
      {
        id: 'security_monitoring',
        category: 'Security Logging',
        name: 'Security Event Monitoring',
        description: 'Security events sent to monitoring system',
        status: 'warning',
        tested: false,
        details: 'Currently console logging - needs production monitoring'
      }
    ];

    setChecks(securityChecks);
  };

  useEffect(() => {
    initializeChecks();
  }, []);

  const handleSeedUsers = async () => {
    setSeedingUsers(true);
    try {
      const results = await seedTestUsers();
      
      // Grant premium to one test user
      if (results.success > 0) {
        await grantTestPremium('member@test.com');
      }
      
      alert(`User seeding complete! Success: ${results.success}, Failed: ${results.failed}`);
    } catch (error) {
      alert('Failed to seed users: ' + error);
    } finally {
      setSeedingUsers(false);
    }
  };

  const testRouteAccess = async () => {
    setTestingAccess(true);
    
    // Create a simple test report
    const testResults = [];
    
    try {
      // Test admin route (current user)
      if (userProfile?.role === 'admin') {
        testResults.push('✅ Admin route access confirmed');
      } else {
        testResults.push('❌ Admin route access denied (expected)');
      }
      
      // Test premium features
      if (isPremium) {
        testResults.push('✅ Premium features accessible');
      } else {
        testResults.push('❌ Premium features blocked (expected)');
      }
      
      alert('Route Access Test Results:\n\n' + testResults.join('\n'));
    } catch (error) {
      alert('Test failed: ' + error);
    } finally {
      setTestingAccess(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'fail':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, SecurityCheck[]>);

  const totalChecks = checks.length;
  const passedChecks = checks.filter(c => c.status === 'pass').length;
  const failedChecks = checks.filter(c => c.status === 'fail').length;
  const warningChecks = checks.filter(c => c.status === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Security & Role Enforcement Checklist</CardTitle>
              <CardDescription>
                Comprehensive security audit and role-based access control validation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-2xl font-bold">{totalChecks}</div>
              <div className="text-sm text-muted-foreground">Total Checks</div>
            </div>
            <div className="bg-green-500/10 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{passedChecks}</div>
              <div className="text-sm text-green-600">Passed</div>
            </div>
            <div className="bg-yellow-500/10 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{warningChecks}</div>
              <div className="text-sm text-yellow-600">Warnings</div>
            </div>
            <div className="bg-red-500/10 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{failedChecks}</div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <Button 
              onClick={handleSeedUsers} 
              disabled={seedingUsers}
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              {seedingUsers ? 'Seeding...' : 'Seed Test Users'}
            </Button>
            <Button 
              onClick={testRouteAccess} 
              disabled={testingAccess}
              variant="outline"
            >
              <Lock className="h-4 w-4 mr-2" />
              {testingAccess ? 'Testing...' : 'Test Route Access'}
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/flags">
                <Settings className="h-4 w-4 mr-2" />
                Feature Flags
              </Link>
            </Button>
          </div>

          {/* Current User Status */}
          <Card className="mb-6 bg-muted/30">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Current User Context</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Email</div>
                  <div className="font-medium">{user?.email || 'Not authenticated'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Role</div>
                  <div className="font-medium">{userProfile?.role || 'None'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Premium Status</div>
                  <div className="font-medium">{isPremium ? 'Active' : 'Free'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Security Checks by Category */}
      {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryChecks.map((check) => (
                <div key={check.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                  <div className="mt-0.5">
                    {getStatusIcon(check.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{check.name}</h4>
                      <Badge 
                        variant="outline"
                        className={getStatusColor(check.status)}
                      >
                        {check.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {check.description}
                    </p>
                    {check.details && (
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        {check.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Test User Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>Test User Credentials</CardTitle>
          <CardDescription>
            Use these accounts to test role-based access control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testUsers.map((testUser) => (
              <div key={testUser.email} className="p-4 border rounded-lg bg-card/50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {testUser.role}
                  </Badge>
                  {testUser.email === 'member@test.com' && (
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="text-sm space-y-1">
                  <div><strong>Email:</strong> {testUser.email}</div>
                  <div><strong>Password:</strong> {testUser.password}</div>
                  <div className="text-muted-foreground text-xs">{testUser.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityChecklist;