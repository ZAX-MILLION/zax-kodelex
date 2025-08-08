import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InstallationStatus {
  isInstalled: boolean;
  isLoading: boolean;
  needsSetup: boolean;
}

export const useInstallationStatus = (): InstallationStatus => {
  const [status, setStatus] = useState<InstallationStatus>({
    isInstalled: false,
    isLoading: true,
    needsSetup: true
  });

  useEffect(() => {
    checkInstallationStatus();
  }, []);

  const checkInstallationStatus = async () => {
    try {
      // Enhanced detection for Lovable containers and preview environments
      const isPreview = window.location.hostname.includes('preview--') || 
                       window.location.hostname.includes('lovable') ||
                       window.location.href.includes('lovable.app/container');
      const isDev = import.meta.env.DEV;
      const skipSetup = localStorage.getItem('skipSetup') === 'true';
      const installationComplete = localStorage.getItem('installation_complete') === 'true';
      
      // Optional global override via environment
      const skipOverride = import.meta.env.VITE_SKIP_SETUP === 'true';

      // If we should skip setup entirely, return as installed
      if (isPreview || skipSetup || skipOverride || installationComplete) {
        setStatus({
          isInstalled: true,
          isLoading: false,
          needsSetup: false
        });
        return;
      }

      // For personal use, always mark as installed
      setStatus({
        isInstalled: true,
        isLoading: false,
        needsSetup: false
      });

    } catch (error) {
      console.error('Installation status check failed:', error);
      setStatus({
        isInstalled: false,
        isLoading: false,
        needsSetup: true
      });
    }
  };

  return status;
};