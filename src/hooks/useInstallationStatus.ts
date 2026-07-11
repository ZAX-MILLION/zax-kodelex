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
      const isPreview = window.location.hostname.includes('preview--');
      const skipSetup = localStorage.getItem('skipSetup') === 'true';
      const installationComplete = localStorage.getItem('installation_complete') === 'true';
      const skipOverride = import.meta.env.VITE_SKIP_SETUP === 'true';

      if (isPreview || skipSetup || skipOverride || installationComplete) {
        setStatus({
          isInstalled: true,
          isLoading: false,
          needsSetup: false
        });
        return;
      }

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
