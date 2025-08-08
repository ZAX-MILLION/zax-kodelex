import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Settings, Globe, Mail } from 'lucide-react';
import type { SetupData } from '@/pages/Setup';

interface BasicSettingsStepProps {
  data: SetupData;
  onUpdate: (updates: Partial<SetupData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const BasicSettingsStep = ({ data, onUpdate, onNext, onPrev }: BasicSettingsStepProps) => {
  const updateBasicSettings = (field: string, value: string) => {
    onUpdate({
      basicSettings: {
        ...data.basicSettings,
        [field]: value
      }
    });
  };

  const isValid = data.basicSettings.siteName && data.basicSettings.contactEmail;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full w-fit">
          <Settings className="h-8 w-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Basic Site Settings</h3>
        <p className="text-muted-foreground">
          Configure your site's basic information and contact details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site Information
          </CardTitle>
          <CardDescription>
            These settings will be displayed throughout your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name *</Label>
            <Input
              id="site-name"
              placeholder="My Manga Reader"
              value={data.basicSettings.siteName}
              onChange={(e) => updateBasicSettings('siteName', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This will appear in the header and browser title
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description</Label>
            <Textarea
              id="site-description"
              placeholder="A professional manga reading platform with high-quality content..."
              value={data.basicSettings.siteDescription}
              onChange={(e) => updateBasicSettings('siteDescription', e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Used for SEO and social media sharing
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Contact details for support and inquiries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact Email *</Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="contact@yoursite.com"
              value={data.basicSettings.contactEmail}
              onChange={(e) => updateBasicSettings('contactEmail', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Used for the contact form and support inquiries
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            Review your basic settings before continuing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Site Name</Label>
              <p className="text-sm">{data.basicSettings.siteName || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Contact Email</Label>
              <p className="text-sm">{data.basicSettings.contactEmail || 'Not set'}</p>
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
              <p className="text-sm">{data.basicSettings.siteDescription || 'Not set'}</p>
            </div>
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
          onClick={onNext}
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