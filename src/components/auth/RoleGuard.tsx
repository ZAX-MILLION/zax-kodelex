import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: Array<'admin' | 'author' | 'editor' | 'member' | 'user'>;
  requiresPremium?: boolean;
  requiresAuth?: boolean;
  fallback?: ReactNode;
  hideWhenUnauthorized?: boolean;
}

/**
 * RoleGuard component for conditional rendering based on user permissions
 * Use this for UI elements that should be hidden/shown based on user role
 */
export const RoleGuard = ({ 
  children, 
  allowedRoles,
  requiresPremium = false,
  requiresAuth = false,
  fallback = null,
  hideWhenUnauthorized = false
}: RoleGuardProps) => {
  const { user, userProfile } = useAuth();
  const { isPremium } = useSubscription();

  // Check authentication
  if (requiresAuth && !user) {
    return hideWhenUnauthorized ? null : fallback;
  }

  // Check premium requirement
  if (requiresPremium && !isPremium) {
    return hideWhenUnauthorized ? null : fallback;
  }

  // Check role requirement
  if (allowedRoles && allowedRoles.length > 0) {
    const hasValidRole = allowedRoles.includes(userProfile?.role as any);
    // Special case: admin can access author content
    const isAdminAccessingAuthor = userProfile?.role === 'admin' && allowedRoles.includes('author');
    
    if (!hasValidRole && !isAdminAccessingAuthor) {
      return hideWhenUnauthorized ? null : fallback;
    }
  }

  return <>{children}</>;
};

// Convenience components
export const AdminOnly = ({ children, fallback, hide = false }: { 
  children: ReactNode; 
  fallback?: ReactNode; 
  hide?: boolean;
}) => (
  <RoleGuard 
    allowedRoles={['admin']} 
    fallback={fallback} 
    hideWhenUnauthorized={hide}
  >
    {children}
  </RoleGuard>
);

export const AuthorOnly = ({ children, fallback, hide = false }: { 
  children: ReactNode; 
  fallback?: ReactNode; 
  hide?: boolean;
}) => (
  <RoleGuard 
    allowedRoles={['author', 'admin']} 
    fallback={fallback} 
    hideWhenUnauthorized={hide}
  >
    {children}
  </RoleGuard>
);

export const PremiumOnly = ({ children, fallback, hide = false }: { 
  children: ReactNode; 
  fallback?: ReactNode; 
  hide?: boolean;
}) => (
  <RoleGuard 
    requiresPremium={true} 
    fallback={fallback} 
    hideWhenUnauthorized={hide}
  >
    {children}
  </RoleGuard>
);

export const AuthenticatedOnly = ({ children, fallback, hide = false }: { 
  children: ReactNode; 
  fallback?: ReactNode; 
  hide?: boolean;
}) => (
  <RoleGuard 
    requiresAuth={true} 
    fallback={fallback} 
    hideWhenUnauthorized={hide}
  >
    {children}
  </RoleGuard>
);