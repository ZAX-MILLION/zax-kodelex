import { Navigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstallationStatus } from '@/hooks/useInstallationStatus';
import { SetupWizard } from './SetupWizard';

interface InstallationGateProps {
  children: React.ReactNode;
}

export const InstallationGate = ({ children }: InstallationGateProps) => {
  const { isInstalled, isLoading, needsSetup } = useInstallationStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking installation status...</p>
        </div>
      </div>
    );
  }


  // Show setup wizard if not installed
  if (needsSetup) {
    const isPreview = window.location.hostname.includes('preview--');
    
    return (
      <div className="min-h-screen">
        {isPreview && (
          <div className="bg-blue-100 dark:bg-blue-900/20 border-b border-blue-200 p-3 text-center space-y-1">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              Preview Mode: Setup changes will not be saved permanently
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              To skip this wizard in preview, run: <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">localStorage.setItem("skipSetup", "true")</code> in browser console
            </p>
          </div>
        )}
        <SetupWizard />
      </div>
    );
  }

  // All checks passed, show main app
  return <>{children}</>;
};