import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Zap, Globe, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface CloudflareConfig {
  id?: string;
  api_token?: string;
  zone_id?: string;
  ssl_redirect_enabled?: boolean;
  ip_protection_awareness?: boolean;
  last_cache_purge?: string;
}

export const CloudflarePanel = () => {
  const [config, setConfig] = useState<CloudflareConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [purging, setPurging] = useState(false);
  const [credentials, setCredentials] = useState({ api_token: '', zone_id: '' });
  const [isCloudflareDetected, setIsCloudflareDetected] = useState(false);
  const [clientIP, setClientIP] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
    detectCloudflare();
  }, []);

  const loadConfig = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      // Handle cloudflare_config as any since it might not be in the types yet
      const cloudflareConfig = (data as any)?.cloudflare_config;
      if (cloudflareConfig) {
        setConfig({ ...cloudflareConfig, id: data?.id });
        setCredentials({
          api_token: cloudflareConfig.api_token || '',
          zone_id: cloudflareConfig.zone_id || ''
        });
      }
    } catch (error) {
      console.error('Error loading Cloudflare config:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectCloudflare = () => {
    // Check for Cloudflare headers
    const cfRay = document.querySelector('meta[name="cf-ray"]');
    const cfConnecting = window.location.hostname.includes('cloudflare');
    
    // Try to detect if we're behind Cloudflare
    fetch('/api/ip-check')
      .then(response => response.json())
      .then(data => {
        setClientIP(data.ip || 'Unknown');
        setIsCloudflareDetected(data.cloudflare || false);
      })
      .catch(() => {
        setIsCloudflareDetected(!!cfRay || cfConnecting);
      });
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const updatedConfig = {
        ...config,
        api_token: credentials.api_token,
        zone_id: credentials.zone_id
      };

      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: config.id || crypto.randomUUID(),
          cloudflare_config: updatedConfig
        });

      if (error) throw error;

      setConfig(updatedConfig);
      toast({
        title: "Settings Saved",
        description: "Cloudflare configuration has been updated successfully."
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save Cloudflare settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testCredentials = async () => {
    if (!credentials.api_token || !credentials.zone_id) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both API token and Zone ID.",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('cloudflare-operations', {
        body: {
          action: 'test',
          api_token: credentials.api_token,
          zone_id: credentials.zone_id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Credentials Valid",
          description: `Connected to zone: ${data.zone_name}`
        });
      } else {
        throw new Error(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error testing credentials:', error);
      toast({
        title: "Test Failed",
        description: error.message || "Invalid Cloudflare credentials.",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const purgeCache = async () => {
    if (!config.api_token || !config.zone_id) {
      toast({
        title: "Missing Configuration",
        description: "Please configure and save your Cloudflare credentials first.",
        variant: "destructive"
      });
      return;
    }

    setPurging(true);
    try {
      const { data, error } = await supabase.functions.invoke('cloudflare-operations', {
        body: {
          action: 'purge',
          api_token: config.api_token,
          zone_id: config.zone_id
        }
      });

      if (error) throw error;

      if (data.success) {
        const updatedConfig = {
          ...config,
          last_cache_purge: new Date().toISOString()
        };
        
        await supabase
          .from('site_settings')
          .upsert({
            id: config.id || crypto.randomUUID(),
            cloudflare_config: updatedConfig
          });

        setConfig(updatedConfig);
        toast({
          title: "Cache Purged",
          description: "Cloudflare cache has been cleared successfully."
        });
      } else {
        throw new Error(data.error || 'Cache purge failed');
      }
    } catch (error) {
      console.error('Error purging cache:', error);
      toast({
        title: "Purge Failed",
        description: error.message || "Failed to purge Cloudflare cache.",
        variant: "destructive"
      });
    } finally {
      setPurging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Cloudflare Integration</h1>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {isCloudflareDetected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Cloudflare Detection</span>
              <Badge variant={isCloudflareDetected ? "default" : "destructive"}>
                {isCloudflareDetected ? "Active" : "Not Detected"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {config.api_token && config.zone_id ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>API Configured</span>
              <Badge variant={config.api_token && config.zone_id ? "default" : "destructive"}>
                {config.api_token && config.zone_id ? "Yes" : "No"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {config.ssl_redirect_enabled ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
              <span>SSL Redirect</span>
              <Badge variant={config.ssl_redirect_enabled ? "default" : "secondary"}>
                {config.ssl_redirect_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>

          {config.last_cache_purge && (
            <div className="text-sm text-muted-foreground">
              Last cache purge: {new Date(config.last_cache_purge).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* IP Protection Warning */}
      {config.ip_protection_awareness && isCloudflareDetected && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            IP Protection is enabled. Real client IPs may be masked. Current detected IP: {clientIP}
          </AlertDescription>
        </Alert>
      )}

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure your Cloudflare API token and zone ID for cache management and SSL controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api_token">API Token</Label>
            <Input
              id="api_token"
              type="password"
              placeholder="Enter Cloudflare API Token"
              value={credentials.api_token}
              onChange={(e) => setCredentials(prev => ({ ...prev, api_token: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zone_id">Zone ID</Label>
            <Input
              id="zone_id"
              placeholder="Enter Cloudflare Zone ID"
              value={credentials.zone_id}
              onChange={(e) => setCredentials(prev => ({ ...prev, zone_id: e.target.value }))}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={testCredentials} disabled={testing} variant="outline">
              {testing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Test Credentials
            </Button>
            <Button onClick={saveConfig} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Protection Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IP Protection Awareness</Label>
              <p className="text-sm text-muted-foreground">
                Display warnings when client IPs may be masked by Cloudflare
              </p>
            </div>
            <Switch
              checked={config.ip_protection_awareness || false}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ip_protection_awareness: checked }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SSL Redirect Enforcement</Label>
              <p className="text-sm text-muted-foreground">
                Automatically redirect HTTP requests to HTTPS
              </p>
            </div>
            <Switch
              checked={config.ssl_redirect_enabled || false}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ssl_redirect_enabled: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Cache Management
          </CardTitle>
          <CardDescription>
            Manage Cloudflare cache for your website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={purgeCache} 
            disabled={purging || !config.api_token || !config.zone_id}
            variant="destructive"
          >
            {purging && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Purge All Cache
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            This will clear all cached content on Cloudflare. Use with caution.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};