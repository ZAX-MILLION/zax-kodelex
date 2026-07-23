import { useState, useEffect } from 'react';
import { hasSupabaseCredentials } from '@/integrations/supabase/config';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

export interface InstallationStatus {
  isInstalled: boolean;
  isLoading: boolean;
  needsSetup: boolean;
}

export const useInstallationStatus = (): InstallationStatus => {
  const [status, setStatus] = useState<InstallationStatus>({
    isInstalled: false,
    isLoading: true,
    needsSetup: true,
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
      const isPublicDemo =
        import.meta.env.VITE_APP_ENV === 'demo' || import.meta.env.VITE_DEMO_MODE === 'true';
      const hasCredentials = hasSupabaseCredentials();

      // Public demo builds are fully local — never prompt for Supabase setup.
      if (isPublicDemo || isPreview || skipSetup || skipOverride) {
        setStatus({
          isInstalled: true,
          isLoading: false,
          needsSetup: false,
        });
        return;
      }

      if (!hasCredentials) {
        setStatus({
          isInstalled: false,
          isLoading: false,
          needsSetup: true,
        });
        return;
      }

      if (installationComplete) {
        setStatus({
          isInstalled: true,
          isLoading: false,
          needsSetup: false,
        });
        return;
      }

      if (!isSupabaseConfigured) {
        setStatus({
          isInstalled: false,
          isLoading: false,
          needsSetup: true,
        });
        return;
      }

      const { data, error } = await supabase
        .from('install_status')
        .select('is_installed')
        .maybeSingle();

      if (error) {
        console.warn('Could not read install_status:', error.message);
        setStatus({
          isInstalled: false,
          isLoading: false,
          needsSetup: !installationComplete,
        });
        return;
      }

      const installed = data?.is_installed === true || installationComplete;
      if (installed) {
        localStorage.setItem('installation_complete', 'true');
      }

      setStatus({
        isInstalled: installed,
        isLoading: false,
        needsSetup: !installed,
      });
    } catch (error) {
      console.error('Installation status check failed:', error);
      setStatus({
        isInstalled: false,
        isLoading: false,
        needsSetup: true,
      });
    }
  };

  return status;
};
