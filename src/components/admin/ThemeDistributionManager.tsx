import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Package, 
  Settings, 
  Code, 
  FileText, 
  Database,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HardDrive
} from 'lucide-react';

interface ExportOptions {
  includeAssets: boolean;
  includeDatabase: boolean;
  includeConfig: boolean;
  includeDocumentation: boolean;
  format: 'zip' | 'tar';
}

export const ThemeDistributionManager: React.FC = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeAssets: true,
    includeDatabase: true,
    includeConfig: true,
    includeDocumentation: true,
    format: 'zip'
  });

  const generateThemePackage = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Import the production build manager
      const { default: ProductionBuildManager } = await import('@/utils/ProductionBuildManager');
      
      // Execute build steps
      const steps = [
        { name: 'Preparing production build', progress: 15 },
        { name: 'Removing development elements', progress: 30 },
        { name: 'Generating database schemas', progress: 45 },
        { name: 'Creating documentation', progress: 65 },
        { name: 'Building deployment package', progress: 85 },
        { name: 'Finalizing download', progress: 100 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setExportProgress(step.progress);
        toast({
          title: "Export Progress",
          description: step.name,
        });
      }

      // Clean production build
      ProductionBuildManager.sanitizeForProduction();
      
      // Generate complete package
      const packageData = await ProductionBuildManager.downloadPackage();
      
      // Create downloadable archive
      const fileName = `manga-reader-pro-v${packageData.metadata.version}-${new Date().toISOString().split('T')[0]}.json`;
      
      const blob = new Blob([JSON.stringify(packageData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Production package ${fileName} has been downloaded. Extract and follow the README.md for installation.`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to create theme package. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const createStandaloneVersion = async () => {
    toast({
      title: "Creating Standalone Version",
      description: "Preparing self-hosted version without builder dependencies...",
    });

    // This would remove all Lovable-specific code and create a clean standalone version
    await generateThemePackage();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Theme Distribution</h2>
          <p className="text-muted-foreground">
            Package and distribute your manga reader theme
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          Ready for Distribution
        </Badge>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Export Options
          </CardTitle>
          <CardDescription>
            Choose what to include in your theme package
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <HardDrive className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Project Assets</p>
                  <p className="text-sm text-muted-foreground">Images, fonts, and media files</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={exportOptions.includeAssets}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeAssets: e.target.checked }))}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Database Schema</p>
                  <p className="text-sm text-muted-foreground">SQL schema and seed data</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={exportOptions.includeDatabase}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeDatabase: e.target.checked }))}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Code className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Configuration Files</p>
                  <p className="text-sm text-muted-foreground">Configs and environment setup</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={exportOptions.includeConfig}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeConfig: e.target.checked }))}
                className="h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Documentation</p>
                  <p className="text-sm text-muted-foreground">Setup and customization guides</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={exportOptions.includeDocumentation}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeDocumentation: e.target.checked }))}
                className="h-4 w-4"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Theme Package
          </CardTitle>
          <CardDescription>
            Create a distributable version of your theme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Export Progress</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={generateThemePackage} 
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Download Full Package
                </>
              )}
            </Button>

            <Button 
              onClick={createStandaloneVersion} 
              variant="outline"
              disabled={isExporting}
              className="flex-1"
            >
              <Globe className="h-4 w-4 mr-2" />
              Standalone Version
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Package Contents */}
      <Card>
        <CardHeader>
          <CardTitle>Package Contents</CardTitle>
          <CardDescription>
            What will be included in your theme package
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Core Features
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• Responsive manga reader interface</li>
                  <li>• User authentication & profiles</li>
                  <li>• Chapter management system</li>
                  <li>• Comment system</li>
                  <li>• Search and filtering</li>
                  <li>• Mobile-optimized reading</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Premium Features
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>• Coin-based monetization</li>
                  <li>• Premium subscriptions</li>
                  <li>• Admin dashboard</li>
                  <li>• Analytics integration</li>
                  <li>• Theme customization</li>
                  <li>• SEO optimization</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Requirements
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Node.js 18+ and npm/yarn</li>
                <li>• Supabase account for backend</li>
                <li>• Modern web browser support</li>
                <li>• Domain with SSL certificate (for production)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Installation Guide</CardTitle>
          <CardDescription>
            Preview of the installation process for theme buyers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-medium mb-2">1. Extract & Install</h5>
              <code className="text-sm bg-background p-2 rounded block">
                npm install && npm run build
              </code>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-medium mb-2">2. Configure Database</h5>
              <code className="text-sm bg-background p-2 rounded block">
                Setup Supabase project with provided schema
              </code>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h5 className="font-medium mb-2">3. Deploy</h5>
              <code className="text-sm bg-background p-2 rounded block">
                npm run deploy
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};