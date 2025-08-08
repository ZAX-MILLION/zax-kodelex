import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useInstallationStatus } from '@/hooks/useInstallationStatus';
import { WelcomeStep } from '@/components/installation/WelcomeStep';
import { SupabaseConfigStep } from '@/components/installation/SupabaseConfigStep';

import { AdminAccountStep } from '@/components/installation/AdminAccountStep';
import { ThemeModeStep } from '@/components/installation/ThemeModeStep';
import { BasicSettingsStep } from '@/components/installation/BasicSettingsStep';
import { CompletionStep } from '@/components/installation/CompletionStep';

export interface SetupData {
  supabaseConfig: {
    url: string;
    anonKey: string;
  };
  adminAccount: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  themeMode: 'single-series' | 'multi-series';
  basicSettings: {
    siteName: string;
    contactEmail: string;
    siteDescription: string;
  };
}

const Setup = () => {
  const { isInstalled } = useInstallationStatus();
  const [currentStep, setCurrentStep] = useState(0);
  const [setupData, setSetupData] = useState<SetupData>({
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
      siteName: 'My Manga Reader',
      contactEmail: '',
      siteDescription: 'A professional manga reading platform'
    }
  });

  // Redirect if already installed (unless dev mode)
  if (isInstalled && !import.meta.env.DEV) {
    return <Navigate to="/admin" replace />;
  }

  const steps = [
    { title: 'Welcome', component: WelcomeStep },
    { title: 'Supabase Config', component: SupabaseConfigStep },
    { title: 'Admin Account', component: AdminAccountStep },
    { title: 'Theme Mode', component: ThemeModeStep },
    { title: 'Basic Settings', component: BasicSettingsStep },
    { title: 'Complete', component: CompletionStep }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

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

  const updateData = (data: Partial<SetupData>) => {
    setSetupData(prev => ({ ...prev, ...data }));
  };

  const stepProps = {
    data: setupData,
    onUpdate: updateData,
    onNext: handleNext,
    onPrev: handlePrev,
    isFirst: currentStep === 0,
    isLast: currentStep === steps.length - 1
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Setup Your Manga Reader</h1>
          <p className="text-muted-foreground">
            Let's configure your professional manga reading platform
          </p>
        </div>

        {/* Progress */}
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

        {/* Current Step */}
        <Card>
          <CardContent className="p-6">
            {currentStep === 0 && <WelcomeStep {...stepProps} />}
            {currentStep === 1 && <SupabaseConfigStep {...stepProps} />}
            {currentStep === 2 && <AdminAccountStep {...stepProps} />}
            {currentStep === 3 && <ThemeModeStep {...stepProps} />}
            {currentStep === 4 && <BasicSettingsStep {...stepProps} />}
            {currentStep === 5 && <CompletionStep {...stepProps} />}
          </CardContent>
        </Card>

        {/* Development Mode Notice */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Development Mode:</strong> Setup data will be saved locally. 
              Use production environment for permanent installation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Setup;