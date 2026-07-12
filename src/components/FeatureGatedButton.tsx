import { Button } from '@/components/ui/button';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { WithFeatureFlag } from '@/contexts/FeatureFlagContext';

interface FeatureGatedButtonProps {
  flagKey: string;
  children: React.ReactNode;
  fallbackText?: string;
  [key: string]: any;
}

export const FeatureGatedButton = ({ 
  flagKey, 
  children, 
  fallbackText, 
  ...buttonProps 
}: FeatureGatedButtonProps) => {
  const { isEnabled, isLoading } = useFeatureFlag(flagKey);

  if (isLoading) {
    return (
      <Button disabled {...buttonProps}>
        Loading...
      </Button>
    );
  }

  if (!isEnabled) {
    if (fallbackText) {
      return (
        <Button disabled variant="outline" {...buttonProps}>
          {fallbackText}
        </Button>
      );
    }
    return null;
  }

  return (
    <Button {...buttonProps}>
      {children}
    </Button>
  );
};

// Example usage components for different UI modes
export const PremiumUploadButton = () => (
  <FeatureGatedButton 
    flagKey="upload_access"
    fallbackText="Upload (Premium Only)"
  >
    Upload Content
  </FeatureGatedButton>
);

export const BetaFeaturesAccess = ({ children }: { children: React.ReactNode }) => (
  <WithFeatureFlag flagKey="beta_features">
    {children}
  </WithFeatureFlag>
);

export const AdvancedAnalyticsAccess = ({ children }: { children: React.ReactNode }) => (
  <WithFeatureFlag flagKey="advanced_analytics">
    {children}
  </WithFeatureFlag>
);