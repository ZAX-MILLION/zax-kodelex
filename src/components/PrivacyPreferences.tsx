import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Mail, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PrivacyPreferencesData {
  analytics_opt_out: boolean;
  marketing_opt_out: boolean;
}

export const PrivacyPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<PrivacyPreferencesData>({
    analytics_opt_out: false,
    marketing_opt_out: false
  });

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_privacy_preferences')
        .select('analytics_opt_out, marketing_opt_out')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setPreferences({
          analytics_opt_out: data.analytics_opt_out,
          marketing_opt_out: data.marketing_opt_out
        });
      }
    } catch (error) {
      console.error('Error loading privacy preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('user_privacy_preferences')
        .upsert({
          user_id: user.id,
          analytics_opt_out: preferences.analytics_opt_out,
          marketing_opt_out: preferences.marketing_opt_out,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your privacy preferences have been updated.",
      });

    } catch (error) {
      console.error('Error saving privacy preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save privacy preferences.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof PrivacyPreferencesData, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Privacy Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Control how your data is used to improve your experience
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        {/* Analytics Tracking */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <Label htmlFor="analytics-opt-out" className="text-base font-medium">
                Analytics Tracking
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow us to collect anonymous usage data to improve the platform. 
                This includes page views, feature usage, and performance metrics.
              </p>
              <div className="text-xs text-muted-foreground mt-2">
                <strong>What we collect:</strong> Page visits, reading patterns, feature usage, error reports
                <br />
                <strong>What we don't collect:</strong> Personal content, private messages, or identifiable information
              </div>
            </div>
          </div>
          <Switch
            id="analytics-opt-out"
            checked={!preferences.analytics_opt_out}
            onCheckedChange={(checked) => updatePreference('analytics_opt_out', !checked)}
          />
        </div>

        <Separator />

        {/* Marketing Communications */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <Label htmlFor="marketing-opt-out" className="text-base font-medium">
                Marketing Communications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features, content, and special offers via email.
                You can unsubscribe at any time.
              </p>
              <div className="text-xs text-muted-foreground mt-2">
                <strong>Includes:</strong> Feature announcements, new manga releases, premium offers
                <br />
                <strong>Frequency:</strong> Weekly updates, special announcements (max 2-3 emails/month)
              </div>
            </div>
          </div>
          <Switch
            id="marketing-opt-out"
            checked={!preferences.marketing_opt_out}
            onCheckedChange={(checked) => updatePreference('marketing_opt_out', !checked)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Changes take effect immediately and apply to future data collection only.
          </div>
          <Button 
            onClick={savePreferences} 
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <strong>Data Rights:</strong> You have the right to access, update, or delete your personal data at any time. 
          Contact our support team if you need assistance with your privacy rights or have questions about our data practices.
        </div>
      </div>
    </Card>
  );
};