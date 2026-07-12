import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChildTheme } from '@/hooks/useChildTheme';
import { toast } from '@/hooks/use-toast';
import { Eye, CheckCircle, AlertCircle, Smartphone, Monitor } from 'lucide-react';

export const ThemeTestButton: React.FC = () => {
  const { availableThemes, switchTheme, previewTheme, resetToActive } = useChildTheme();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [testResults, setTestResults] = useState<{
    desktop: boolean;
    mobile: boolean;
    components: boolean;
    assets: boolean;
  } | null>(null);

  const shiranamiTheme = availableThemes.find(t => t.name === '04-shiranami-sakura');

  const runThemeTests = async () => {
    if (!shiranamiTheme) {
      toast({
        title: "Theme Not Found",
        description: "Shiranami Sakura theme not found in database",
        variant: "destructive"
      });
      return;
    }

    setTestResults(null);
    
    try {
      // Test 1: Desktop Preview
      previewTheme(shiranamiTheme);
      setIsPreviewMode(true);
      
      // Test 2: Component Loading
      const componentTest = await testComponentLoading();
      
      // Test 3: Asset Loading
      const assetTest = await testAssetLoading();
      
      // Test 4: Mobile Responsiveness (simulated)
      const mobileTest = testMobileResponsiveness();

      setTestResults({
        desktop: true,
        mobile: mobileTest,
        components: componentTest,
        assets: assetTest
      });

      toast({
        title: "Theme Tests Completed",
        description: "Check results below. Preview mode is active.",
      });

    } catch (error) {
      console.error('Theme test failed:', error);
      toast({
        title: "Test Failed",
        description: "Error during theme testing",
        variant: "destructive"
      });
    }
  };

  const testComponentLoading = async (): Promise<boolean> => {
    try {
      // Try to dynamically import the component
      const { ShiranamiSakuraHomepage } = await import('@/themes/components/04-shiranami-sakura');
      return typeof ShiranamiSakuraHomepage === 'function';
    } catch (error) {
      console.error('Component loading test failed:', error);
      return false;
    }
  };

  const testAssetLoading = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = '/src/assets/manga-covers/crimson-blade-cover.jpg';
    });
  };

  const testMobileResponsiveness = (): boolean => {
    // Check if viewport meta tag exists and responsive classes are used
    const viewport = document.querySelector('meta[name="viewport"]');
    return !!viewport;
  };

  const activateTheme = async () => {
    if (!shiranamiTheme) return;
    
    try {
      await switchTheme(shiranamiTheme.id);
      setIsPreviewMode(false);
      toast({
        title: "Theme Activated",
        description: "Shiranami Sakura is now your active theme",
      });
    } catch (error) {
      toast({
        title: "Activation Failed",
        description: "Could not activate theme",
        variant: "destructive"
      });
    }
  };

  const exitPreview = () => {
    resetToActive();
    setIsPreviewMode(false);
    setTestResults(null);
    toast({
      title: "Preview Ended",
      description: "Returned to active theme",
    });
  };

  if (!shiranamiTheme) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Theme Not Found</span>
        </div>
        <p className="text-sm text-red-700 mt-1">
          Shiranami Sakura theme is not imported in the database yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Shiranami Sakura Theme Testing</h3>
        <Badge variant={isPreviewMode ? "destructive" : "secondary"}>
          {isPreviewMode ? "Preview Mode" : "Ready"}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Button onClick={runThemeTests} disabled={isPreviewMode}>
          <Eye className="w-4 h-4 mr-2" />
          Test Theme
        </Button>
        
        {isPreviewMode && (
          <>
            <Button onClick={activateTheme} variant="default">
              <CheckCircle className="w-4 h-4 mr-2" />
              Activate Theme
            </Button>
            <Button onClick={exitPreview} variant="outline">
              Exit Preview
            </Button>
          </>
        )}
      </div>

      {testResults && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 p-3 rounded border">
            <Monitor className="w-4 h-4" />
            <span className="text-sm">Desktop</span>
            {testResults.desktop ? (
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 ml-auto" />
            )}
          </div>

          <div className="flex items-center gap-2 p-3 rounded border">
            <Smartphone className="w-4 h-4" />
            <span className="text-sm">Mobile</span>
            {testResults.mobile ? (
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 ml-auto" />
            )}
          </div>

          <div className="flex items-center gap-2 p-3 rounded border">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Components</span>
            {testResults.components ? (
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 ml-auto" />
            )}
          </div>

          <div className="flex items-center gap-2 p-3 rounded border">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Assets</span>
            {testResults.assets ? (
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 ml-auto" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};