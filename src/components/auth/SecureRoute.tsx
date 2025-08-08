import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Crown, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SecureRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'author' | 'editor' | 'member' | 'user';
  requiresPremium?: boolean;
  requiresAuth?: boolean;
  fallbackPath?: string;
}

// Security logging function
const logSecurityEvent = (event: string, details: any) => {
  console.warn(`[SECURITY] ${event}:`, details);
  // In production, send to monitoring service
};

const NotAuthorizedScreen = ({ 
  reason, 
  requiredRole, 
  requiresPremium, 
  currentRole 
}: {
  reason: string;
  requiredRole?: string;
  requiresPremium?: boolean;
  currentRole?: string;
}) => {
  const location = useLocation();
  
  // Log security event
  logSecurityEvent('Access Denied', {
    path: location.pathname,
    reason,
    requiredRole,
    currentRole,
    requiresPremium,
    timestamp: new Date().toISOString()
  });

  const getIcon = () => {
    if (requiresPremium) return <Crown className="h-12 w-12 text-amber-500" />;
    if (requiredRole === 'admin') return <Shield className="h-12 w-12 text-red-500" />;
    return <Lock className="h-12 w-12 text-muted-foreground" />;
  };

  const getTitle = () => {
    if (requiresPremium) return "Premium Access Required";
    if (requiredRole === 'admin') return "Administrative Access Required";
    if (requiredRole === 'author') return "Author Access Required";
    return "Authentication Required";
  };

  const getDescription = () => {
    if (requiresPremium) return "This feature is available exclusively for Premium subscribers.";
    if (requiredRole === 'admin') return "You need administrator privileges to access this area.";
    if (requiredRole === 'author') return "This area is restricted to content authors only.";
    return "You need to sign in to access this content.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-xl">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="font-medium">Access Details:</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              <div>Required: {requiredRole || 'Authentication'}</div>
              {currentRole && <div>Current: {currentRole}</div>}
              <div>Path: {location.pathname}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {requiresPremium ? (
              <Button asChild className="w-full">
                <Link to="/subscribe">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Link>
              </Button>
            ) : !currentRole ? (
              <Button className="w-full" onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}>
                <Lock className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link to="/">
                  <Shield className="h-4 w-4 mr-2" />
                  Return Home
                </Link>
              </Button>
            )}
            
            <Button asChild variant="ghost" className="w-full">
              <Link to="/support">Contact Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SecureRoute = ({ 
  children, 
  requiredRole, 
  requiresPremium = false,
  requiresAuth = true,
  fallbackPath 
}: SecureRouteProps) => {
  const { user, userProfile, isLoading } = useAuth();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const location = useLocation();

  // Show loading while auth is being determined
  if (isLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check authentication requirement
  if (requiresAuth && !user) {
    if (fallbackPath) {
      return <Navigate to={fallbackPath} state={{ from: location.pathname }} replace />;
    }
    return (
      <NotAuthorizedScreen 
        reason="Authentication required"
        currentRole={userProfile?.role}
      />
    );
  }

  // Check premium requirement
  if (requiresPremium && !isPremium) {
    if (fallbackPath) {
      return <Navigate to={fallbackPath} state={{ from: location.pathname }} replace />;
    }
    return (
      <NotAuthorizedScreen 
        reason="Premium subscription required"
        requiresPremium={true}
        currentRole={userProfile?.role}
      />
    );
  }

  // Check role requirement
  if (requiredRole && userProfile?.role !== requiredRole) {
    // Special case: admin can access author routes
    if (requiredRole === 'author' && userProfile?.role === 'admin') {
      return <>{children}</>;
    }
    
    if (fallbackPath) {
      return <Navigate to={fallbackPath} state={{ from: location.pathname }} replace />;
    }
    
    return (
      <NotAuthorizedScreen 
        reason="Insufficient role privileges"
        requiredRole={requiredRole}
        currentRole={userProfile?.role}
      />
    );
  }

  // Access granted
  return <>{children}</>;
};

// Convenience components for common use cases
export const AdminRoute = ({ children, fallbackPath }: { children: ReactNode; fallbackPath?: string }) => (
  <SecureRoute requiredRole="admin" fallbackPath={fallbackPath}>
    {children}
  </SecureRoute>
);

export const AuthorRoute = ({ children, fallbackPath }: { children: ReactNode; fallbackPath?: string }) => (
  <SecureRoute requiredRole="author" fallbackPath={fallbackPath}>
    {children}
  </SecureRoute>
);

export const PremiumRoute = ({ children, fallbackPath }: { children: ReactNode; fallbackPath?: string }) => (
  <SecureRoute requiresPremium={true} fallbackPath={fallbackPath}>
    {children}
  </SecureRoute>
);

export const AuthenticatedRoute = ({ children, fallbackPath }: { children: ReactNode; fallbackPath?: string }) => (
  <SecureRoute requiresAuth={true} fallbackPath={fallbackPath}>
    {children}
  </SecureRoute>
);