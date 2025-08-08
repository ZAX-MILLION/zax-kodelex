import { createContext, useContext, ReactNode } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useAuth } from '@/contexts/AuthContext';

interface FeatureFlagContextType {
  hasFeature: (flagKey: string) => boolean;
  isLoading: (flagKey: string) => boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const useFeatureFlagContext = () => {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlagContext must be used within a FeatureFlagProvider');
  }
  return context;
};

interface FeatureFlagProviderProps {
  children: ReactNode;
}

export const FeatureFlagProvider = ({ children }: FeatureFlagProviderProps) => {
  const { userProfile } = useAuth();
  
  // Cache for feature flag results
  const flagCache = new Map<string, { isEnabled: boolean; isLoading: boolean }>();

  const hasFeature = (flagKey: string): boolean => {
    const cached = flagCache.get(flagKey);
    return cached?.isEnabled || false;
  };

  const isLoading = (flagKey: string): boolean => {
    const cached = flagCache.get(flagKey);
    return cached?.isLoading || false;
  };

  const value = {
    hasFeature,
    isLoading,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

// Higher-order component for conditional rendering based on feature flags
interface WithFeatureFlagProps {
  flagKey: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export const WithFeatureFlag = ({ flagKey, fallback = null, children }: WithFeatureFlagProps) => {
  const { isEnabled, isLoading } = useFeatureFlag(flagKey);
  
  if (isLoading) {
    return null; // or a loading spinner
  }
  
  if (!isEnabled) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Hook for role-based UI modes
export const useRoleBasedUI = () => {
  const { userProfile, isAdmin } = useAuth();
  const { hasFeature } = useFeatureFlagContext();
  
  const uiMode = {
    isAdmin: isAdmin,
    isAuthor: userProfile?.role === 'author' || isAdmin,
    isEditor: userProfile?.role === 'editor' || isAdmin,
    isPremiumUser: hasFeature('premium_themes'),
    isFreeUser: !hasFeature('premium_themes') && !!userProfile,
    isGuest: !userProfile,
  };
  
  const capabilities = {
    canUploadContent: hasFeature('upload_access'),
    canAccessAuthorDashboard: hasFeature('author_dashboard'),
    canViewAdvancedAnalytics: hasFeature('advanced_analytics'),
    canUseBetaFeatures: hasFeature('beta_features'),
    canModeratComments: hasFeature('comment_moderation'),
    canUsePremiumReaderMode: hasFeature('premium_reader_mode'),
    canUseMultiLanguage: hasFeature('multi_language'),
  };
  
  const getUIVariant = (component: string): string => {
    switch (component) {
      case 'navigation':
        if (uiMode.isAdmin) return 'admin';
        if (uiMode.isAuthor) return 'author';
        if (uiMode.isPremiumUser) return 'premium';
        return 'default';
        
      case 'reader':
        if (capabilities.canUsePremiumReaderMode) return 'premium';
        return 'default';
        
      case 'dashboard':
        if (uiMode.isAdmin) return 'admin';
        if (capabilities.canAccessAuthorDashboard) return 'author';
        return 'user';
        
      default:
        return 'default';
    }
  };
  
  return {
    uiMode,
    capabilities,
    getUIVariant,
  };
};