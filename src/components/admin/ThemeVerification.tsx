import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChildTheme } from '@/hooks/useChildTheme';
import { componentRegistry } from '@/components/themes/ComponentRegistry';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ThemeComponentStatus {
  themeId: string;
  themeName: string;
  homepageComponent: string | null;
  componentLoaded: boolean;
  error: string | null;
}

export const ThemeVerification: React.FC = () => {
  const { availableThemes, currentTheme, switchTheme } = useChildTheme();
  const [verification, setVerification] = useState<ThemeComponentStatus[]>([]);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    verifyThemes();
  }, [availableThemes]);

  const verifyThemes = async () => {
    const results: ThemeComponentStatus[] = [];
    
    for (const theme of availableThemes) {
      try {
        // Load theme components
        await componentRegistry.loadThemeComponents(theme);
        
        // Check if homepage component exists
        const homepageComponent = componentRegistry.getComponent(theme.id, 'Homepage') || 
                                componentRegistry.getComponent(theme.id, theme.homepage_component || '');
        
        results.push({
          themeId: theme.id,
          themeName: theme.display_name,
          homepageComponent: theme.homepage_component,
          componentLoaded: !!homepageComponent,
          error: null
        });
      } catch (error) {
        results.push({
          themeId: theme.id,
          themeName: theme.display_name,
          homepageComponent: theme.homepage_component,
          componentLoaded: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    setVerification(results);
  };

  const testTheme = async (themeId: string) => {
    setTesting(themeId);
    try {
      await switchTheme(themeId);
      setTimeout(() => setTesting(null), 2000);
    } catch (error) {
      console.error('Theme test failed:', error);
      setTesting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Theme Verification</h2>
          <p className="text-muted-foreground">
            Verify that all themes are properly loaded and functional
          </p>
        </div>
        <Button onClick={verifyThemes} variant="outline">
          Re-verify
        </Button>
      </div>

      <div className="grid gap-4">
        {verification.map((result) => (
          <Card key={result.themeId} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{result.themeName}</h3>
                  {result.componentLoaded ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  {currentTheme?.id === result.themeId && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Theme ID: <code className="bg-muted px-1 rounded">{result.themeId}</code></div>
                  <div>Homepage Component: <code className="bg-muted px-1 rounded">{result.homepageComponent || 'None'}</code></div>
                  <div>Status: 
                    <span className={`ml-1 ${result.componentLoaded ? 'text-green-600' : 'text-red-600'}`}>
                      {result.componentLoaded ? 'Component Loaded' : 'Component Missing'}
                    </span>
                  </div>
                  {result.error && (
                    <div className="text-red-600">Error: {result.error}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testTheme(result.themeId)}
                  disabled={testing === result.themeId || !result.componentLoaded}
                >
                  {testing === result.themeId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    'Test Theme'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Error Summary */}
      {verification.some(v => !v.componentLoaded) && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Issues Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
              {verification
                .filter(v => !v.componentLoaded)
                .map(v => (
                  <div key={v.themeId}>
                    <strong>{v.themeName}:</strong> {v.error || 'Component not loaded'}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};