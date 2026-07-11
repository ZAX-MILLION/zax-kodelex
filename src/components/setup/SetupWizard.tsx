import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WelcomeStep } from '@/components/installation/WelcomeStep';
import { DatabaseSelectionStep } from '@/components/installation/DatabaseSelectionStep';
import { EnvironmentSetupStep } from '@/components/installation/EnvironmentSetupStep';
import { SiteConfigStep } from '@/components/installation/SiteConfigStep';
import { AdminAccountStep } from '@/components/installation/AdminAccountStep';
import { CompletionStep } from '@/components/installation/CompletionStep';
import { supabase } from '@/integrations/supabase/client';
import type { InstallationData } from '@/pages/Installation';

export const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [installationData, setInstallationData] = useState<InstallationData>({
    databaseType: 'supabase',
    supabaseConfig: {
      url: '',
      anonKey: ''
    },
    adminAccount: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    themeMode: 'single-series',
    basicSettings: {
      siteName: 'MangaReader Pro',
      contactEmail: '',
      siteDescription: 'Professional manga reading platform'
    }
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
        // In preview mode, just set local skip flag
        localStorage.setItem('skipSetup', 'true');
        window.location.href = '/';
        return;
      }

      // For real installations, save to Supabase
      const { error } = await supabase
        .from('install_status')
        .upsert({
          is_installed: true,
          installed_at: new Date().toISOString(),
          installed_by: null, // Will be set when auth is implemented
          license_key: installationData.licenseKey || null,
          domain: window.location.hostname
        });

      if (error) {
        console.error('Failed to complete installation:', error);
        return;
      }

      // Set local skip flag and redirect
      localStorage.setItem('skipSetup', 'true');
      localStorage.setItem('installation_data', JSON.stringify(installationData));
      
      window.location.href = '/admin';
    } catch (error) {
      console.error('Installation completion failed:', error);
    }
  };

  const updateData = (data: Partial<InstallationData>) => {
    setInstallationData(prev => ({ ...prev, ...data }));
  };

  const steps = [
    { title: 'Welcome', component: WelcomeStep },
    { title: 'Database', component: DatabaseSelectionStep },
    { title: 'Environment', component: EnvironmentSetupStep },
    { title: 'Site Config', component: SiteConfigStep },
    { title: 'Admin Account', component: AdminAccountStep },
    { title: 'Complete', component: CompletionStep }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Setup Wizard</h1>
          <p className="text-muted-foreground">Configure your manga reader platform</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="mt-2" />
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            {currentStep === 0 && (
              <WelcomeStep onNext={handleNext} />
            )}
            {currentStep === 1 && (
              <DatabaseSelectionStep 
                data={installationData} 
                onUpdate={updateData} 
                onNext={handleNext} 
              />
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
                isLast={true}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};