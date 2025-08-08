import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { DatabaseSelectionStep } from '@/components/installation/DatabaseSelectionStep';
import { EnvironmentSetupStep } from '@/components/installation/EnvironmentSetupStep';
import { SiteConfigStep } from '@/components/installation/SiteConfigStep';
import { AdminAccountStep } from '@/components/installation/AdminAccountStep';
import { CompletionStep } from '@/components/installation/CompletionStep';
import { useToast } from '@/hooks/use-toast';

export type InstallationData = {
  databaseType: 'supabase' | 'mysql';
  mysqlConfig?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
  };
  supabaseConfig: {
    url: string;
    anonKey: string;
  };
  licenseFile?: File;
  licenseData?: {
    key: string;
    type: 'single-series' | 'multi-series';
    validUntil?: string;
    domains?: string[];
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
  skipLicense?: boolean;
  licenseKey?: string;
};

const Installation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
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
      siteName: 'My Manga Reader',
      contactEmail: '',
      siteDescription: 'A professional manga reading platform'
    }
  });
  const [isInstalling, setIsInstalling] = useState(false);

  const steps = [
    { id: 1, title: 'Database Selection', description: 'Choose your database platform' },
    { id: 2, title: 'Environment Setup', description: 'Configure database connection' },
    { id: 3, title: 'Site Configuration', description: 'Set up your site details' },
    { id: 4, title: 'Admin Account', description: 'Create administrator account' },
    { id: 5, title: 'Complete Setup', description: 'Finalize installation' },
  ];

  const progress = (currentStep / steps.length) * 100;

  const updateInstallationData = (updates: Partial<InstallationData>) => {
    setInstallationData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeInstallation = async () => {
    setIsInstalling(true);

    try {
      // Save installation configuration
      localStorage.setItem('manga_reader_config', JSON.stringify(installationData));
      localStorage.setItem('installation_complete', 'true');

      // Simulate installation process
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Installation Complete!",
        description: "Your manga reader is now ready to use.",
      });

      // Redirect to admin panel
      setTimeout(() => {
        navigate('/admin');
      }, 1000);

    } catch (error) {
      console.error('Installation failed:', error);
      toast({
        title: "Installation Failed",
        description: "Please check your configuration and try again.",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DatabaseSelectionStep
            data={installationData}
            onUpdate={updateInstallationData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <EnvironmentSetupStep
            data={installationData}
            onUpdate={updateInstallationData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <SiteConfigStep
            data={installationData}
            onUpdate={updateInstallationData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <AdminAccountStep
            data={installationData}
            onUpdate={updateInstallationData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 5:
        return (
          <CompletionStep
            data={installationData}
            onUpdate={updateInstallationData}
            onNext={completeInstallation}
            onPrev={prevStep}
            isLast={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Manga Reader Installation
          </h1>
          <p className="text-lg text-muted-foreground">
            Let's get your manga reading platform set up in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep > step.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : currentStep === step.id
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground hidden md:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">
                Step {currentStep}: {steps[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="text-base">
                {steps[currentStep - 1].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCurrentStep()}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Need help? Check out our documentation or contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default Installation;