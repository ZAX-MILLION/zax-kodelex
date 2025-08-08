import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, 
  ArrowLeft, 
  Settings
} from 'lucide-react';
import type { InstallationData } from '@/pages/Installation';

interface SiteConfigStepProps {
  data: InstallationData;
  onUpdate: (updates: Partial<InstallationData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const SiteConfigStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev 
}: SiteConfigStepProps) => {
  const [formData, setFormData] = useState({
    siteName: data.basicSettings.siteName,
    siteDescription: data.basicSettings.siteDescription,
    contactEmail: data.basicSettings.contactEmail || '',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    onUpdate({
      basicSettings: {
        ...data.basicSettings,
        ...formData
      }
    });
    onNext();
  };

  const isValid = formData.siteName && 
                 formData.siteDescription && 
                 formData.contactEmail;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit">
          <Settings className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Site Configuration</h3>
        <p className="text-muted-foreground">
          Configure your basic site settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
          <CardDescription>
            Configure your site name, description, and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name *</Label>
            <Input
              id="siteName"
              value={formData.siteName}
              onChange={(e) => updateFormData('siteName', e.target.value)}
              placeholder="My Manga Reader"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description *</Label>
            <Textarea
              id="siteDescription"
              value={formData.siteDescription}
              onChange={(e) => updateFormData('siteDescription', e.target.value)}
              placeholder="A professional manga reading platform"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => updateFormData('contactEmail', e.target.value)}
              placeholder="contact@yourdomain.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!isValid}
          className="flex items-center gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};