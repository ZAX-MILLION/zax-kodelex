import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WelcomeStep } from '@/components/setup/installation/WelcomeStep';
import { DatabaseSelectionStep } from '@/components/setup/installation/DatabaseSelectionStep';
import { EnvironmentSetupStep } from '@/components/setup/installation/EnvironmentSetupStep';
import { SiteConfigStep } from '@/components/setup/installation/SiteConfigStep';
import { AdminAccountStep } from '@/components/setup/installation/AdminAccountStep';
import { CompletionStep } from '@/components/setup/installation/CompletionStep';
import { createSupabaseClient } from '@/integrations/supabase/client';
import { persistSupabaseCredentials } from '@/integrations/supabase/config';
import type { InstallationData } from '@/types/installation';

export const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [installationData, setInstallationData] = useState<InstallationData>({
    databaseType: 'supabase',
    supabaseConfig: {
      url: '',
      anonKey: '',
    },
    adminAccount: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    themeMode: 'multi-series',
    basicSettings: {
      siteName: 'Zax Million',
      contactEmail: 'contact@zaxmillion.com',
      siteDescription: 'Premium manga reading platform by Zax Million',
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const isPreview = window.location.hostname.includes('preview--');

      if (isPreview) {
        localStorage.setItem('skipSetup', 'true');
        window.location.href = '/';
        return;
      }

      const { url, anonKey } = installationData.supabaseConfig;
      if (!url || !anonKey) {
        console.error('Missing Supabase credentials');
        return;
      }

      persistSupabaseCredentials(url, anonKey);
      const setupClient = createSupabaseClient(url, anonKey);

      const { email, password } = installationData.adminAccount;
      const username = email.split('@')[0] || 'admin';

      const { data: signUpData, error: signUpError } = await setupClient.auth.signUp({
        email,
        password,
        options: {
          data: { username, name: username },
        },
      });

      if (signUpError) {
        console.error('Failed to create admin account:', signUpError);
        return;
      }

      if (signUpData.user && signUpData.session) {
        await setupClient
          .from('profiles')
          .update({ role: 'admin', username })
          .eq('user_id', signUpData.user.id);
      }

      await setupClient.from('install_status').upsert({
        is_installed: true,
        installed_at: new Date().toISOString(),
        installed_by: signUpData.user?.id ?? null,
        license_key: installationData.licenseKey || null,
        domain: window.location.hostname,
      });

      localStorage.setItem('installation_complete', 'true');
      localStorage.setItem('installation_data', JSON.stringify(installationData));

      if (installationData.basicSettings.siteName) {
        localStorage.setItem(
          'seo_settings',
          JSON.stringify({
            siteTitle: installationData.basicSettings.siteName,
            siteDescription: installationData.basicSettings.siteDescription,
          })
        );
      }

      window.location.href = signUpData.session ? '/admin' : '/';
    } catch (error) {
      console.error('Installation completion failed:', error);
    }
  };

  const updateData = (data: Partial<InstallationData>) => {
    setInstallationData((prev) => ({ ...prev, ...data }));
  };

  const steps = [
    { title: 'Welcome', component: WelcomeStep },
    { title: 'Database', component: DatabaseSelectionStep },
    { title: 'Environment', component: EnvironmentSetupStep },
    { title: 'Site Config', component: SiteConfigStep },
    { title: 'Admin Account', component: AdminAccountStep },
    { title: 'Complete', component: CompletionStep },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Zax Million Setup</h1>
          <p className="text-muted-foreground">Configure your manga reading platform</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </CardTitle>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            {currentStep === 0 && <WelcomeStep onNext={handleNext} />}
            {currentStep === 1 && (
              <DatabaseSelectionStep data={installationData} onUpdate={updateData} onNext={handleNext} />
            )}
            {currentStep === 2 && (
              <EnvironmentSetupStep
                data={installationData}
                onUpdate={updateData}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}
            {currentStep === 3 && (
              <SiteConfigStep
                data={installationData}
                onUpdate={updateData}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}
            {currentStep === 4 && (
              <AdminAccountStep
                data={installationData}
                onUpdate={updateData}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}
            {currentStep === 5 && (
              <CompletionStep
                data={installationData}
                onUpdate={updateData}
                onNext={handleComplete}
                onPrev={handlePrev}
                isLast
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
