import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Settings, DollarSign, Users, TrendingUp, AlertTriangle, Save } from 'lucide-react';
import PatreonCoinRulesManager from './PatreonCoinRulesManager';
import PricingRulesImportExport from './PricingRulesImportExport';

interface FeatureFlags {
  EnablePatreonIntegration: boolean;
  EnableCoinPurchases: boolean;
  EnablePremiumUnlocks: boolean;
  EnableRegionalPricing: boolean;
  EnableBulkDiscounts: boolean;
  EnableVIPTiers: boolean;
}

const MonetizationControlPanel = () => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    EnablePatreonIntegration: true,
    EnableCoinPurchases: true,
    EnablePremiumUnlocks: true,
    EnableRegionalPricing: false,
    EnableBulkDiscounts: true,
    EnableVIPTiers: false
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const toggleFeature = (feature: keyof FeatureFlags) => {
    setFeatureFlags(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
    setHasUnsavedChanges(true);
  };

  const saveAllSettings = () => {
    // Simulate API call
    setTimeout(() => {
      setHasUnsavedChanges(false);
      toast({
        title: "Settings Saved",
        description: "All monetization settings have been updated successfully"
      });
    }, 1000);
  };

  const resetToDefaults = () => {
    setFeatureFlags({
      EnablePatreonIntegration: true,
      EnableCoinPurchases: true,
      EnablePremiumUnlocks: true,
      EnableRegionalPricing: false,
      EnableBulkDiscounts: true,
      EnableVIPTiers: false
    });
    setHasUnsavedChanges(true);
    toast({
      title: "Reset to Defaults",
      description: "All settings have been reset to default values"
    });
  };

  const getFeatureDescription = (feature: keyof FeatureFlags): string => {
    const descriptions = {
      EnablePatreonIntegration: "Connect with Patreon API and grant monthly coins to supporters",
      EnableCoinPurchases: "Allow users to purchase coins through PayPal and Stripe",
      EnablePremiumUnlocks: "Enable coin-based chapter unlocking and premium content",
      EnableRegionalPricing: "Apply different pricing based on user location",
      EnableBulkDiscounts: "Offer discounts for larger coin package purchases",
      EnableVIPTiers: "Enable special pricing and perks for VIP users"
    };
    return descriptions[feature];
  };

  const getFeatureImpact = (feature: keyof FeatureFlags): { type: 'high' | 'medium' | 'low'; description: string } => {
    const impacts = {
      EnablePatreonIntegration: { type: 'high' as const, description: 'Affects all Patreon supporters and monthly rewards' },
      EnableCoinPurchases: { type: 'high' as const, description: 'Core monetization feature - affects all purchases' },
      EnablePremiumUnlocks: { type: 'high' as const, description: 'Controls access to premium content' },
      EnableRegionalPricing: { type: 'medium' as const, description: 'Affects pricing for different countries' },
      EnableBulkDiscounts: { type: 'medium' as const, description: 'Affects coin package pricing strategy' },
      EnableVIPTiers: { type: 'low' as const, description: 'Advanced feature for select users' }
    };
    return impacts[feature];
  };

  return (
    <div className="space-y-6">
      {/* Header with Save Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Monetization Control Panel
              </CardTitle>
              <CardDescription>
                Manage feature flags, integrations, and monetization settings
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
              <Button variant="outline" onClick={resetToDefaults}>
                Reset Defaults
              </Button>
              <Button onClick={saveAllSettings} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save All Settings
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="feature-flags" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feature-flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="patreon-rules">Patreon Rules</TabsTrigger>
          <TabsTrigger value="pricing-tools">Pricing Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="feature-flags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Monetization Features</CardTitle>
              <CardDescription>
                Toggle key monetization features on/off globally
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(featureFlags).map(([feature, isEnabled]) => {
                const impact = getFeatureImpact(feature as keyof FeatureFlags);
                return (
                  <div key={feature} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Label htmlFor={feature} className="font-medium">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Badge 
                          variant={impact.type === 'high' ? 'destructive' : impact.type === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {impact.type} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {getFeatureDescription(feature as keyof FeatureFlags)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Impact:</strong> {impact.description}
                      </p>
                    </div>
                    <Switch
                      id={feature}
                      checked={isEnabled}
                      onCheckedChange={() => toggleFeature(feature as keyof FeatureFlags)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">$2,847</div>
                <div className="text-xs text-muted-foreground">Monthly Revenue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">143</div>
                <div className="text-xs text-muted-foreground">Active Subscribers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">28.5%</div>
                <div className="text-xs text-muted-foreground">Conversion Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">
                  {Object.values(featureFlags).filter(Boolean).length}/{Object.keys(featureFlags).length}
                </div>
                <div className="text-xs text-muted-foreground">Features Enabled</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patreon-rules">
          <PatreonCoinRulesManager />
        </TabsContent>

        <TabsContent value="pricing-tools">
          <PricingRulesImportExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonetizationControlPanel;