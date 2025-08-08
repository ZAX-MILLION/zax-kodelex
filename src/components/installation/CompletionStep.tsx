import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  CheckCircle, 
  Rocket, 
  Settings, 
  BookOpen,
  Upload,
  Users,
  BarChart3,
  ExternalLink,
  Database,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { SetupData } from '@/pages/Setup';

interface CompletionStepProps {
  data: SetupData;
  onUpdate: (updates: Partial<SetupData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isLast: boolean;
}

export const CompletionStep = ({ 
  data, 
  onUpdate,
  onNext, 
  onPrev 
}: CompletionStepProps) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const { toast } = useToast();

  const nextSteps = [
    {
      icon: Upload,
      title: 'Upload Your First Manga',
      description: 'Add chapters and pages to your collection',
      link: '/admin/upload'
    },
    {
      icon: Settings,
      title: 'Customize Site Settings',
      description: 'Fine-tune your site appearance and behavior',
      link: '/admin/settings'
    },
    {
      icon: Users,
      title: 'Manage Users',
      description: 'Set up user roles and permissions',
      link: '/admin/users'
    },
    {
      icon: BarChart3,
      title: 'Configure Analytics',
      description: 'Set up tracking and monitor your site performance',
      link: '/admin/analytics'
    }
  ];

  const quickLinks = [
    { name: 'Admin Dashboard', url: '/admin', icon: Settings },
    { name: 'Site Preview', url: '/', icon: BookOpen },
    { name: 'Documentation', url: '/docs', icon: ExternalLink },
  ];

  const completeInstallation = async () => {
    setIsInstalling(true);
    
    try {
      // Save basic configuration to localStorage
      const config = {
        siteName: data.basicSettings.siteName,
        contactEmail: data.basicSettings.contactEmail,
        siteDescription: data.basicSettings.siteDescription,
        themeMode: data.themeMode,
        
        setupCompleted: true,
        setupDate: new Date().toISOString()
      };

      localStorage.setItem('manga_reader_setup', JSON.stringify(config));
      localStorage.setItem('installation_complete', 'true');


      toast({
        title: "Setup Complete!",
        description: "Your manga reader is now ready to use.",
      });

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);

    } catch (error) {
      console.error('Setup completion failed:', error);
      toast({
        title: "Setup Failed",
        description: "Please check your configuration and try again.",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Ready to Launch!</h3>
        <p className="text-muted-foreground">
          Your manga reader is configured and ready to go
        </p>
      </div>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Installation Summary
          </CardTitle>
          <CardDescription>
            Review your configuration before finalizing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Database</h4>
                <Badge variant="default" className="flex items-center gap-1 w-fit">
                  <Database className="h-3 w-3" />
                  Supabase
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Site Name</h4>
                <p className="text-sm text-muted-foreground">{data.basicSettings.siteName}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Contact Email</h4>
                <p className="text-sm text-muted-foreground">{data.basicSettings.contactEmail}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Theme Mode</h4>
                <Badge variant={data.themeMode === 'multi-series' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                  {data.themeMode === 'multi-series' ? <Shield className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
                  {data.themeMode === 'multi-series' ? 'Multi-Series' : 'Single-Series'}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Admin Email</h4>
                <p className="text-sm text-muted-foreground">{data.adminAccount.email}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Mode</h4>
                <Badge variant="outline" className="w-fit">
                  Development Mode
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            What's Next?
          </CardTitle>
          <CardDescription>
            Recommended steps to get your manga reader up and running
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <step.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>
            Important links for managing your site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickLinks.map((link, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto p-3"
                asChild
              >
                <a href={link.url} className="flex items-center gap-2">
                  <link.icon className="h-4 w-4" />
                  <span className="text-sm">{link.name}</span>
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Before you start:</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Make sure to backup your database configuration</li>
              <li>Test all functionality before going live</li>
              <li>Set up regular backups for your content</li>
              <li>Review security settings and user permissions</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={completeInstallation}
          disabled={isInstalling}
          size="lg"
          className="flex items-center gap-2"
        >
          <Rocket className="h-4 w-4" />
          {isInstalling ? 'Finalizing Setup...' : 'Launch Your Site'}
        </Button>
      </div>
    </div>
  );
};