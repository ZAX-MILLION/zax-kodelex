import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { UpdateChapterButton } from './UpdateChapterButton';
import { CuratedReset10x10 } from './CuratedReset10x10';
import { 
  Code2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Shield, 
  Crown, 
  RefreshCw,
  Info
} from 'lucide-react';

export const DeveloperToolsPanel = () => {
  const {
    isEnabled,
    settings,
    toggleDeveloperMode,
    updateSettings,
    resetSettings,
    isDevelopment
  } = useDeveloperMode();

  if (!isDevelopment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Developer Tools
          </CardTitle>
          <CardDescription>
            Developer tools are only available in development mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Switch to development mode to access these tools. In production, these features are automatically disabled for security.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Developer Tools
            {isEnabled && (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Override premium features and bypass restrictions for development testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Enable Developer Mode</h3>
              <p className="text-sm text-muted-foreground">
                Activate development overrides and testing tools
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={toggleDeveloperMode}
            />
          </div>

          {isEnabled && (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                Developer mode is active. Some security features and premium gates are bypassed.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {isEnabled && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Premium Feature Overrides
              </CardTitle>
              <CardDescription>
                Bypass premium restrictions for testing purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Disable Premium Gating</h3>
                  <p className="text-sm text-muted-foreground">
                    Show all premium content without subscription
                  </p>
                </div>
                <Switch
                  checked={settings.disablePremiumGating}
                  onCheckedChange={(checked) => 
                    updateSettings({ disablePremiumGating: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Disable Ads</h3>
                  <p className="text-sm text-muted-foreground">
                    Hide all advertisements across the platform
                  </p>
                </div>
                <Switch
                  checked={settings.disableAds}
                  onCheckedChange={(checked) => 
                    updateSettings({ disableAds: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Overrides
              </CardTitle>
              <CardDescription>
                Bypass security checks for development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Bypass License Check</h3>
                  <p className="text-sm text-muted-foreground">
                    Skip license validation for testing
                  </p>
                </div>
                <Switch
                  checked={settings.bypassLicenseCheck}
                  onCheckedChange={(checked) => 
                    updateSettings({ bypassLicenseCheck: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Bypass Theme License</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock multi-series features without license
                  </p>
                </div>
                <Switch
                  checked={settings.bypassThemeLicense}
                  onCheckedChange={(checked) => 
                    updateSettings({ bypassThemeLicense: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Show Debug Info</h3>
                  <p className="text-sm text-muted-foreground">
                    Display debug information in components
                  </p>
                </div>
                <Switch
                  checked={settings.showDebugInfo}
                  onCheckedChange={(checked) => 
                    updateSettings({ showDebugInfo: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

            <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CuratedReset10x10 />
              
              <UpdateChapterButton />
              
              <Button
                onClick={() => {
                  updateSettings({ 
                    bypassLicenseCheck: true, 
                    bypassThemeLicense: true,
                    disablePremiumGating: true
                  });
                }}
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Unlock All Features
              </Button>
              
              <Button
                variant="outline"
                onClick={resetSettings}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset All Settings
              </Button>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Environment Variables:</strong></p>
                <p>• VITE_BYPASS_PREMIUM=true - Global premium bypass</p>
                <p>• VITE_BYPASS_LICENSE=true - Global license bypass</p>
                <p>• VITE_SKIP_SETUP=true - Skip installation wizard</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};