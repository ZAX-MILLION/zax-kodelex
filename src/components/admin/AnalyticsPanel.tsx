import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Target, 
  DollarSign, 
  Search,
  Save,
  ExternalLink,
  TrendingUp,
  Users,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsConfig {
  id?: string;
  provider: string;
  tracking_id: string;
  config_data: any;
  is_active: boolean;
}

interface SiteSettings {
  analytics_code?: string;
  custom_js?: string;
}

interface AdZone {
  id?: string;
  zone_name: string;
  position: string;
  size_specs: string;
  ad_code: string;
  is_active: boolean;
  priority: number;
}

const ANALYTICS_PROVIDERS = [
  { value: 'ga4', label: 'Google Analytics 4' },
  { value: 'gtm', label: 'Google Tag Manager' },
  { value: 'plausible', label: 'Plausible Analytics' },
  { value: 'fathom', label: 'Fathom Analytics' },
];

const AD_POSITIONS = [
  { value: 'header', label: 'Header Banner' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'before-reader', label: 'Before Reader' },
  { value: 'after-reader', label: 'After Reader' },
  { value: 'between-pages', label: 'Between Pages' },
  { value: 'footer', label: 'Footer Banner' },
];

const AD_SIZES = [
  '728x90 (Leaderboard)',
  '300x250 (Medium Rectangle)',
  '320x50 (Mobile Banner)',
  '160x600 (Wide Skyscraper)',
  '300x600 (Half Page)',
  'Responsive',
];

export const AnalyticsPanel = () => {
  const { toast } = useToast();
  const [analyticsConfigs, setAnalyticsConfigs] = useState<AnalyticsConfig[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [adZones, setAdZones] = useState<AdZone[]>([]);
  const [newAnalytics, setNewAnalytics] = useState<AnalyticsConfig>({
    provider: 'ga4',
    tracking_id: '',
    config_data: {},
    is_active: true,
  });
  const [newAdZone, setNewAdZone] = useState<AdZone>({
    zone_name: '',
    position: 'header',
    size_specs: '728x90 (Leaderboard)',
    ad_code: '',
    is_active: true,
    priority: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [analyticsResult, settingsResult, adZonesResult] = await Promise.all([
        supabase.from('analytics_config').select('*').order('created_at'),
        supabase.from('site_settings').select('analytics_code, custom_js').maybeSingle(),
        supabase.from('ad_zones').select('*').order('priority'),
      ]);

      if (analyticsResult.error) throw analyticsResult.error;
      if (adZonesResult.error) throw adZonesResult.error;

      setAnalyticsConfigs(analyticsResult.data || []);
      setSiteSettings(settingsResult.data || {});
      setAdZones(adZonesResult.data || []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast({
        title: "Error loading analytics data",
        description: "Failed to load analytics configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalytics = async () => {
    try {
      setSaving(true);
      
      if (newAnalytics.id) {
        const { error } = await supabase
          .from('analytics_config')
          .update({
            provider: newAnalytics.provider,
            tracking_id: newAnalytics.tracking_id,
            config_data: newAnalytics.config_data,
            is_active: newAnalytics.is_active,
          })
          .eq('id', newAnalytics.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('analytics_config')
          .insert({
            provider: newAnalytics.provider,
            tracking_id: newAnalytics.tracking_id,
            config_data: newAnalytics.config_data,
            is_active: newAnalytics.is_active,
          });

        if (error) throw error;
      }

      await loadAnalyticsData();
      setNewAnalytics({
        provider: 'ga4',
        tracking_id: '',
        config_data: {},
        is_active: true,
      });

      toast({
        title: "Analytics saved!",
        description: "Analytics configuration has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving analytics:', error);
      toast({
        title: "Error saving analytics",
        description: "Failed to save analytics configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdZone = async () => {
    try {
      setSaving(true);
      
      if (newAdZone.id) {
        const { error } = await supabase
          .from('ad_zones')
          .update({
            zone_name: newAdZone.zone_name,
            position: newAdZone.position,
            size_specs: newAdZone.size_specs,
            ad_code: newAdZone.ad_code,
            is_active: newAdZone.is_active,
            priority: newAdZone.priority,
          })
          .eq('id', newAdZone.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ad_zones')
          .insert({
            zone_name: newAdZone.zone_name,
            position: newAdZone.position,
            size_specs: newAdZone.size_specs,
            ad_code: newAdZone.ad_code,
            is_active: newAdZone.is_active,
            priority: newAdZone.priority,
          });

        if (error) throw error;
      }

      await loadAnalyticsData();
      setNewAdZone({
        zone_name: '',
        position: 'header',
        size_specs: '728x90 (Leaderboard)',
        ad_code: '',
        is_active: true,
        priority: 0,
      });

      toast({
        title: "Ad zone saved!",
        description: "Ad zone configuration has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving ad zone:', error);
      toast({
        title: "Error saving ad zone",
        description: "Failed to save ad zone configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAnalyticsStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('analytics_config')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      await loadAnalyticsData();
    } catch (error) {
      console.error('Error updating analytics status:', error);
      toast({
        title: "Error updating status",
        description: "Failed to update analytics status.",
        variant: "destructive",
      });
    }
  };

  const generateAnalyticsCode = (provider: string, trackingId: string) => {
    switch (provider) {
      case 'ga4':
        return `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${trackingId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${trackingId}');
</script>`;
      case 'gtm':
        return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${trackingId}');</script>`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Monetization</h2>
          <p className="text-muted-foreground">Configure tracking, analytics, and ad zones for your site</p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="search-console">Search Console</TabsTrigger>
          <TabsTrigger value="ads">Ad Zones</TabsTrigger>
          <TabsTrigger value="user-insights">User Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Configuration
                </CardTitle>
                <CardDescription>
                  Add and manage analytics tracking services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Analytics Provider</Label>
                  <Select 
                    value={newAnalytics.provider} 
                    onValueChange={(value) => setNewAnalytics(prev => ({ ...prev, provider: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ANALYTICS_PROVIDERS.map(provider => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tracking ID</Label>
                  <Input
                    value={newAnalytics.tracking_id}
                    onChange={(e) => setNewAnalytics(prev => ({ ...prev, tracking_id: e.target.value }))}
                    placeholder="G-XXXXXXXXXX or GTM-XXXXXXX"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newAnalytics.is_active}
                    onCheckedChange={(checked) => setNewAnalytics(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Enable tracking</Label>
                </div>

                <Button onClick={handleSaveAnalytics} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Add Analytics"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Analytics</CardTitle>
                <CardDescription>Currently configured analytics services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsConfigs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${config.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium">{ANALYTICS_PROVIDERS.find(p => p.value === config.provider)?.label}</p>
                          <p className="text-sm text-muted-foreground">{config.tracking_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.is_active}
                          onCheckedChange={(checked) => toggleAnalyticsStatus(config.id!, checked)}
                        />
                        <Badge variant={config.is_active ? "default" : "secondary"}>
                          {config.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {analyticsConfigs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No analytics services configured yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {analyticsConfigs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Tracking Code</CardTitle>
                <CardDescription>Copy this code to your site header (automatically applied)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={analyticsConfigs
                    .filter(config => config.is_active)
                    .map(config => generateAnalyticsCode(config.provider, config.tracking_id))
                    .join('\n\n')}
                  readOnly
                  rows={8}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="search-console" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Google Search Console
              </CardTitle>
              <CardDescription>
                Verify your site with Google Search Console for better SEO insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Verification Meta Tag</Label>
                <Input
                  placeholder="google-site-verification=xxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground">
                  Get this from Google Search Console → Settings → Ownership verification
                </p>
              </div>

              <div className="space-y-2">
                <Label>Bing Webmaster Tools</Label>
                <Input
                  placeholder="msvalidate.01=xxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              <Button className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Search Console
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Ad Zone Configuration
                </CardTitle>
                <CardDescription>
                  Configure ad placements throughout your site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Zone Name</Label>
                  <Input
                    value={newAdZone.zone_name}
                    onChange={(e) => setNewAdZone(prev => ({ ...prev, zone_name: e.target.value }))}
                    placeholder="Header Banner, Sidebar Ad, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select 
                      value={newAdZone.position} 
                      onValueChange={(value) => setNewAdZone(prev => ({ ...prev, position: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AD_POSITIONS.map(position => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Select 
                      value={newAdZone.size_specs} 
                      onValueChange={(value) => setNewAdZone(prev => ({ ...prev, size_specs: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AD_SIZES.map(size => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ad Code</Label>
                  <Textarea
                    value={newAdZone.ad_code}
                    onChange={(e) => setNewAdZone(prev => ({ ...prev, ad_code: e.target.value }))}
                    placeholder="Paste your AdSense or ad network code here..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newAdZone.is_active}
                    onCheckedChange={(checked) => setNewAdZone(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Enable ad zone</Label>
                </div>

                <Button onClick={handleSaveAdZone} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Add Ad Zone"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Ad Zones</CardTitle>
                <CardDescription>Currently configured ad placements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adZones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{zone.zone_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {AD_POSITIONS.find(p => p.value === zone.position)?.label} • {zone.size_specs}
                        </p>
                      </div>
                      <Badge variant={zone.is_active ? "default" : "secondary"}>
                        {zone.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                  {adZones.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No ad zones configured yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Page Views Today</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <Eye className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">89</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Session</p>
                    <p className="text-2xl font-bold">5:32</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Content
              </CardTitle>
              <CardDescription>Most viewed chapters and pages</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Analytics data will appear here once tracking is configured and data is collected.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};