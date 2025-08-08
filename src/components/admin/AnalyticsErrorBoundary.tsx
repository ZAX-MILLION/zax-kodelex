import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';

interface AnalyticsErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

const AnalyticsErrorFallback = ({ onRetry }: { onRetry?: () => void }) => (
  <Card className="p-6 text-center space-y-4">
    <div className="flex justify-center">
      <AlertTriangle className="h-8 w-8 text-destructive" />
    </div>
    
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-foreground">
        Analytics Dashboard Error
      </h3>
      <p className="text-sm text-muted-foreground">
        Unable to load analytics data. This could be due to a network issue or server error.
      </p>
    </div>

    <div className="flex flex-col gap-2 pt-2">
      <Button 
        onClick={onRetry}
        variant="default"
        size="sm"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry Loading
      </Button>
      
      <p className="text-xs text-muted-foreground">
        If this problem persists, please check your connection and try again later.
      </p>
    </div>
  </Card>
);

export const AnalyticsErrorBoundary: React.FC<AnalyticsErrorBoundaryProps> = ({ 
  children, 
  onRetry 
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Analytics dashboard error:', error, errorInfo);
    
    // Track analytics-specific errors
    if (typeof window !== 'undefined' && (window as any).trackError) {
      (window as any).trackError(
        'analytics_dashboard_error',
        error.message,
        error.stack
      );
    }
  };

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={<AnalyticsErrorFallback onRetry={onRetry} />}
    >
      {children}
    </ErrorBoundary>
  );
};