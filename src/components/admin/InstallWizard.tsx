import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, Settings, User, Palette, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InstallConfig {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
  primaryColor: string;
  darkMode: boolean;
  storageProvider: 'supabase' | 'local';
  enableRegistration: boolean;
  enableComments: boolean;
  enableCoins: boolean;
}

export const InstallWizard = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [config, setConfig] = useState<InstallConfig>({
    siteName: 'KODELEX Manga Reader',
    siteDescription: 'Professional manga and novel reading platform',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    primaryColor: '#3b82f6',
    darkMode: false,
    storageProvider: 'supabase',
    enableRegistration: true,
    enableComments: true,
    enableCoins: true
  });

  const steps = [
    { id: 0, title: 'Site Configuration', icon: Settings },
    { id: 1, title: 'Admin Account', icon: User },
    { id: 2, title: 'Appearance', icon: Palette },
    { id: 3, title: 'Features', icon: Database }
  ];

  const updateConfig = (field: keyof InstallConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return config.siteName.trim() && config.siteDescription.trim();
      case 1:
        return config.adminEmail.includes('@') && 
               config.adminPassword.length >= 8 && 
               config.adminPassword === config.confirmPassword;
      case 2:
        return true; // Appearance always valid
      case 3:
        return true; // Features always valid
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeInstallation = async () => {
    if (!validateCurrentStep()) return;

    setIsInstalling(true);
    try {
      // Save installation config
      const installData = {
        is_installed: true,
        installed_at: new Date().toISOString(),
        domain: window.location.hostname,
        config: config
      };

      const { error } = await supabase
        .from('install_status')
        .upsert(installData);

      if (error) throw error;

      // Create admin profile if auth is available
      if (config.adminEmail && config.adminPassword) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: config.adminEmail,
            password: config.adminPassword
          });

          if (authData.user && !authError) {
            await supabase
              .from('profiles')
              .upsert({
                user_id: authData.user.id,
                email: config.adminEmail,
                role: 'admin'
              });
          }
        } catch (authError) {
          console.warn('Auth setup failed, but installation continued:', authError);
        }
      }

      // Set local completion flag
      localStorage.setItem('installation_complete', 'true');
      localStorage.setItem('install_config', JSON.stringify(config));

      toast({
        title: "Installation Complete!",
        description: "Your manga platform is now ready to use.",
      });

      // Redirect to admin dashboard
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);

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

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Setup Your Manga Platform</h1>
          <p className="text-muted-foreground">
            Configure your professional manga reading platform in just a few steps
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

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground text-muted-foreground'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className="ml-2 text-sm font-medium hidden md:block">{step.title}</span>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-16 mx-4 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Settings className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="text-xl font-semibold">Site Configuration</h3>
                  <p className="text-muted-foreground">Set up your basic site information</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Site Name *</Label>
                    <Input
                      id="siteName"
                      value={config.siteName}
                      onChange={(e) => updateConfig('siteName', e.target.value)}
                      placeholder="My Manga Reader"
                    />
                  </div>

                  <div>
                    <Label htmlFor="siteDescription">Site Description *</Label>
                    <Textarea
                      id="siteDescription"
                      value={config.siteDescription}
                      onChange={(e) => updateConfig('siteDescription', e.target.value)}
                      placeholder="Professional manga reading platform..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="storageProvider">Storage Provider</Label>
                    <Select value={config.storageProvider} onValueChange={(value) => updateConfig('storageProvider', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supabase">Supabase Storage</SelectItem>
                        <SelectItem value="local">Local Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <User className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="text-xl font-semibold">Admin Account</h3>
                  <p className="text-muted-foreground">Create your administrator account</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adminEmail">Admin Email *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={config.adminEmail}
                      onChange={(e) => updateConfig('adminEmail', e.target.value)}
                      placeholder="admin@yourdomain.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adminPassword">Password * (min 8 characters)</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={config.adminPassword}
                      onChange={(e) => updateConfig('adminPassword', e.target.value)}
                      placeholder="Strong password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={config.confirmPassword}
                      onChange={(e) => updateConfig('confirmPassword', e.target.value)}
                      placeholder="Confirm password"
                    />
                    {config.adminPassword !== config.confirmPassword && config.confirmPassword && (
                      <Alert className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>Passwords do not match</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Palette className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="text-xl font-semibold">Appearance</h3>
                  <p className="text-muted-foreground">Customize your site's appearance</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        value={config.primaryColor}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="darkMode"
                      checked={config.darkMode}
                      onChange={(e) => updateConfig('darkMode', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="darkMode">Enable Dark Mode by Default</Label>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Database className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="text-xl font-semibold">Features</h3>
                  <p className="text-muted-foreground">Choose which features to enable</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enableRegistration"
                      checked={config.enableRegistration}
                      onChange={(e) => updateConfig('enableRegistration', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="enableRegistration">Enable User Registration</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enableComments"
                      checked={config.enableComments}
                      onChange={(e) => updateConfig('enableComments', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="enableComments">Enable Comments System</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enableCoins"
                      checked={config.enableCoins}
                      onChange={(e) => updateConfig('enableCoins', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="enableCoins">Enable Coin Monetization</Label>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    You can enable or disable these features later from the admin panel.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              onClick={nextStep}
              disabled={!validateCurrentStep()}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={completeInstallation}
              disabled={!validateCurrentStep() || isInstalling}
            >
              {isInstalling ? 'Installing...' : 'Complete Installation'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};