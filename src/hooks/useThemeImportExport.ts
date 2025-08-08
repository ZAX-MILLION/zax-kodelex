import { useState } from 'react';
import { ChildTheme } from './useChildTheme';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

interface ThemeBundle {
  theme: Omit<ChildTheme, 'id' | 'created_at' | 'updated_at'>;
  components: {
    [componentName: string]: string; // Component code/config
  };
  assets?: {
    [filename: string]: string; // Base64 encoded assets
  };
  metadata: {
    exportedAt: string;
    exportedBy?: string;
    version: string;
    dependencies?: string[];
  };
}

export const useThemeImportExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Enhancement 4: Import/Export system for theme bundles
  const exportTheme = async (theme: ChildTheme): Promise<void> => {
    try {
      setIsExporting(true);

      const bundle: ThemeBundle = {
        theme: {
          name: theme.name,
          display_name: theme.display_name,
          description: theme.description,
          version: theme.version,
          author: theme.author,
          is_active: false, // Don't export as active
          is_default: false,
          theme_config: theme.theme_config,
          custom_css: theme.custom_css,
          homepage_component: theme.homepage_component,
          layout_overrides: theme.layout_overrides,
          preview_image_url: theme.preview_image_url
        },
        components: {
          // Extract component definitions
          homepage: theme.homepage_component || '',
          header: theme.layout_overrides?.header || '',
          footer: theme.layout_overrides?.footer || ''
        },
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
          dependencies: ['react', '@radix-ui/react-*', 'lucide-react']
        }
      };

      // Create downloadable file
      const dataStr = JSON.stringify(bundle, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${theme.name}-theme-bundle.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Theme Exported",
        description: `${theme.display_name} has been exported successfully.`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export theme bundle.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importTheme = async (file: File): Promise<void> => {
    try {
      setIsImporting(true);
      
      const fileText = await file.text();
      const bundle: ThemeBundle = JSON.parse(fileText);

      // Enhancement 6 & 7: Dependency and compatibility checks
      if (!validateThemeBundle(bundle)) {
        throw new Error('Invalid theme bundle format');
      }

      // Check dependencies
      const missingDeps = checkDependencies(bundle.metadata.dependencies || []);
      if (missingDeps.length > 0) {
        toast({
          title: "Missing Dependencies",
          description: `Some dependencies are missing: ${missingDeps.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      // Import to database
      const { error } = await supabase
        .from('child_themes')
        .insert({
          ...bundle.theme,
          is_active: false,
          is_default: false,
          theme_config: bundle.theme.theme_config as any
        });

      if (error) throw error;

      toast({
        title: "Theme Imported",
        description: `${bundle.theme.display_name} has been imported successfully.`
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import theme bundle.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const validateThemeBundle = (bundle: ThemeBundle): boolean => {
    // Enhancement 7: Theme validation
    try {
      // Check required fields
      if (!bundle.theme || !bundle.theme.name || !bundle.theme.display_name) {
        return false;
      }

      // Validate theme config structure
      if (!bundle.theme.theme_config || !bundle.theme.theme_config.colors) {
        return false;
      }

      // Check version compatibility
      const bundleVersion = bundle.metadata.version || '1.0.0';
      if (!isVersionCompatible(bundleVersion)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  };

  const checkDependencies = (dependencies: string[]): string[] => {
    // Mock dependency check - in real implementation, check against package.json
    const availableDeps = ['react', '@radix-ui/react-*', 'lucide-react', 'tailwindcss'];
    return dependencies.filter(dep => !availableDeps.some(available => 
      available.includes('*') ? dep.startsWith(available.replace('*', '')) : available === dep
    ));
  };

  const isVersionCompatible = (version: string): boolean => {
    // Enhancement 5: Version compatibility check
    const [major] = version.split('.').map(Number);
    const currentMajor = 1; // Current system version
    
    return major <= currentMajor;
  };

  return {
    exportTheme,
    importTheme,
    isExporting,
    isImporting,
    validateThemeBundle
  };
};