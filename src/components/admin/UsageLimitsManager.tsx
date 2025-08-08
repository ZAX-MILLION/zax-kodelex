import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Users, Download, Eye, Save, AlertTriangle } from 'lucide-react';

interface UsageLimits {
  enable_limits: boolean;
  daily_downloads: number;
  monthly_downloads: number;
  daily_reads: number;
  requires_captcha_after: number;
  block_after_downloads: number;
  guest_daily_reads: number;
}

const UsageLimitsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [limits, setLimits] = useState<UsageLimits>({
    enable_limits: true,
    daily_downloads: 10,
    monthly_downloads: 100,
    daily_reads: 50,
    requires_captcha_after: 20,
    block_after_downloads: 50,
    guest_daily_reads: 5,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would save to a settings table
      localStorage.setItem('usage_limits_config', JSON.stringify(limits));
      
      toast({
        title: "Settings Saved",
        description: "Usage limits have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load existing config from localStorage
    const stored = localStorage.getItem('usage_limits_config');
    if (stored) {
      try {
        setLimits(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading config:', error);
      }
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Usage Limits Manager</h1>
          <p className="text-muted-foreground">Control user access and prevent abuse</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Limits Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Limits
            </CardTitle>
            <CardDescription>
              Set daily and monthly limits for registered users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-limits">Enable Usage Limits</Label>
              <Switch
                id="enable-limits"
                checked={limits.enable_limits}
                onCheckedChange={(checked) =>
                  setLimits(prev => ({ ...prev, enable_limits: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily-reads">Daily Reading Limit</Label>
              <Input
                id="daily-reads"
                type="number"
                value={limits.daily_reads}
                onChange={(e) =>
                  setLimits(prev => ({ ...prev, daily_reads: parseInt(e.target.value) || 0 }))
                }
                min="1"
                max="1000"
                disabled={!limits.enable_limits}
              />
              <p className="text-sm text-muted-foreground">
                Maximum chapters a user can read per day
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily-downloads">Daily Download Limit</Label>
              <Input
                id="daily-downloads"
                type="number"
                value={limits.daily_downloads}
                onChange={(e) =>
                  setLimits(prev => ({ ...prev, daily_downloads: parseInt(e.target.value) || 0 }))
                }
                min="1"
                max="100"
                disabled={!limits.enable_limits}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-downloads">Monthly Download Limit</Label>
              <Input
                id="monthly-downloads"
                type="number"
                value={limits.monthly_downloads}
                onChange={(e) =>
                  setLimits(prev => ({ ...prev, monthly_downloads: parseInt(e.target.value) || 0 }))
                }
                min="1"
                max="1000"
                disabled={!limits.enable_limits}
              />
            </div>
          </CardContent>
        </Card>

        {/* Anti-Abuse Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Anti-Abuse Settings
            </CardTitle>
            <CardDescription>
              Protect your site from excessive usage and bots
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="guest-reads">Guest Daily Reading Limit</Label>
              <Input
                id="guest-reads"
                type="number"
                value={limits.guest_daily_reads}
                onChange={(e) =>
                  setLimits(prev => ({ ...prev, guest_daily_reads: parseInt(e.target.value) || 0 }))
                }
                min="1"
                max="20"
                disabled={!limits.enable_limits}
              />
              <p className="text-sm text-muted-foreground">
                Maximum chapters guests can read per day
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="captcha-after">Require CAPTCHA After</Label>
              <Input
                id="captcha-after"
                type="number"
                value={limits.requires_captcha_after}
                onChange={(e) =>
                  setLimits(prev => ({ ...prev, requires_captcha_after: parseInt(e.target.value) || 0 }))
                }
                min="1"
                max="100"
                disabled={!limits.enable_limits}
              />
              <p className="text-sm text-muted-foreground">
                Show CAPTCHA after this many actions
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="block-after">Block After Downloads</Label>
              <Input
                id="block-after"
                type="number"
                value={limits.block_after_downloads}
                onChange={(e) =>
                  setLimits(prev => ({ ...prev, block_after_downloads: parseInt(e.target.value) || 0 }))
                }
                min="1"
                max="1000"
                disabled={!limits.enable_limits}
              />
              <p className="text-sm text-muted-foreground">
                Temporarily block user after this many downloads
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Current Configuration
          </CardTitle>
          <CardDescription>
            Overview of active usage limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{limits.daily_reads}</div>
              <div className="text-sm text-muted-foreground">Daily Reads</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{limits.daily_downloads}</div>
              <div className="text-sm text-muted-foreground">Daily Downloads</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{limits.guest_daily_reads}</div>
              <div className="text-sm text-muted-foreground">Guest Reads</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{limits.requires_captcha_after}</div>
              <div className="text-sm text-muted-foreground">CAPTCHA Trigger</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={limits.enable_limits ? "default" : "secondary"}>
                {limits.enable_limits ? 'Limits Enabled' : 'Limits Disabled'}
              </Badge>
            </div>
            
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageLimitsManager;