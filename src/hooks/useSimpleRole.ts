import { useAuth } from '@/contexts/AuthContext';

export const useSimpleRole = () => {
  const { userProfile } = useAuth();

  const hasPermission = (route: string, action: string = 'read'): boolean => {
    const role = userProfile?.role;
    
    // Admin always has access
    if (role === 'admin') return true;
    
    // Role-based permissions for new structure
    switch (role) {
      case 'author':
        return route.includes('series') || route.includes('chapters') || route.includes('upload') || 
               route.includes('series-analytics') || route.includes('comments');
      case 'uploader':
        return route.includes('upload') || route.includes('uploads') || route.includes('chapters') || 
               route.includes('series');
      case 'seo_manager':
        return route.includes('analytics') || route.includes('performance') || 
               route.includes('user-analytics') || !route.includes('admin');
      case 'editor':
        return route.includes('comments') || route.includes('chapters') || route.includes('users');
      case 'member':
        return !route.includes('admin') && !route.includes('author') && !route.includes('monetization') &&
               !route.includes('system') && !route.includes('developer');
      case 'user':
      default:
        return !route.includes('admin') && !route.includes('author') && !route.includes('editor') &&
               !route.includes('monetization') && !route.includes('system') && !route.includes('developer');
    }
  };

  return {
    hasPermission,
    isAdmin: userProfile?.role === 'admin',
    isAuthor: userProfile?.role === 'author' || userProfile?.role === 'admin',
    isUploader: userProfile?.role === 'uploader' || userProfile?.role === 'admin',
    isSeoManager: userProfile?.role === 'seo_manager' || userProfile?.role === 'admin',
    isEditor: userProfile?.role === 'editor' || userProfile?.role === 'admin',
    isMember: userProfile?.role === 'member' || userProfile?.role === 'admin',
    currentRole: userProfile?.role
  };
};