import React, { ComponentType, lazy, Suspense } from 'react';
import { toast } from '@/hooks/use-toast';
import { ChildTheme } from '@/hooks/useChildTheme';

interface ComponentOverride {
  id: string;
  name: string;
  component: ComponentType<any>;
  theme: string;
  validated: boolean;
  error?: string;
}

class ComponentRegistryManager {
  private registry = new Map<string, ComponentOverride>();
  private loadedThemes = new Set<string>();
  private errorLog: { theme: string; component: string; error: string; timestamp: Date }[] = [];

  // Register a component override for a theme
  registerComponent(themeId: string, componentName: string, component: ComponentType<any>): boolean {
    try {
      const id = `${themeId}-${componentName}`;
      const override: ComponentOverride = {
        id,
        name: componentName,
        component,
        theme: themeId,
        validated: this.validateComponent(component),
      };

      if (!override.validated) {
        throw new Error(`Component validation failed for ${componentName} in theme ${themeId}`);
      }

      this.registry.set(id, override);
      console.log(`✅ Registered component override: ${componentName} for theme ${themeId}`);
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logError(themeId, componentName, errorMsg);
      console.error(`❌ Failed to register component ${componentName} for theme ${themeId}:`, error);
      return false;
    }
  }

  // Get a component override
  getComponent(themeId: string, componentName: string): ComponentType<any> | null {
    const id = `${themeId}-${componentName}`;
    const override = this.registry.get(id);
    return override?.component || null;
  }

  // Validate component structure
  private validateComponent(component: ComponentType<any>): boolean {
    try {
      // Basic validation - ensure it's a function/component
      if (typeof component !== 'function') return false;
      
      // Allow both class and functional components
      return true;
    } catch (error) {
      console.warn('Component validation failed:', error);
      return false;
    }
  }

  // Load theme components dynamically
  async loadThemeComponents(theme: ChildTheme): Promise<void> {
    if (this.loadedThemes.has(theme.id)) return;

    try {
      // Try to dynamically import theme components
      if (theme.homepage_component) {
        await this.loadHomepageComponent(theme);
      }

      this.loadedThemes.add(theme.id);
      console.log(`🎨 Loaded components for theme: ${theme.display_name}`);
    } catch (error) {
      console.error(`Failed to load components for theme ${theme.display_name}:`, error);
      this.logError(theme.id, 'homepage', error instanceof Error ? error.message : 'Load failed');
    }
  }

  // Load homepage component specifically
  private async loadHomepageComponent(theme: ChildTheme): Promise<void> {
    try {
      // Try to load specific theme components first
      let homepageComponent: ComponentType<any> | null = null;

      // Check for specific theme components
      if (theme.name === '02-cyberpunk-neon' || theme.homepage_component === 'CyberpunkNeonHomepage') {
        try {
          const { CyberpunkNeonHomepage } = await import('@/themes/components/02-cyberpunk-neon');
          homepageComponent = CyberpunkNeonHomepage;
        } catch (importError) {
          console.warn('Could not import CyberpunkNeonHomepage:', importError);
        }
      } else if (theme.name === '03-zen-minimalist' || theme.homepage_component === 'ZenMinimalistHomepage') {
        try {
          const { ZenMinimalistHomepage } = await import('@/themes/components/03-zen-minimalist');
          homepageComponent = ZenMinimalistHomepage;
        } catch (importError) {
          console.warn('Could not import ZenMinimalistHomepage:', importError);
        }
      } else if (theme.name === '04-shiranami-sakura' || theme.homepage_component === 'ShiranamiSakuraHomepage') {
        try {
          const { ShiranamiSakuraHomepage } = await import('@/themes/components/04-shiranami-sakura');
          homepageComponent = ShiranamiSakuraHomepage;
        } catch (importError) {
          console.warn('Could not import ShiranamiSakuraHomepage:', importError);
        }
      }

      // Fallback to secure component factory
      if (!homepageComponent) {
        homepageComponent = this.createSecureHomepageComponent(theme);
      }

      // Register both "Homepage" and the specific homepage component name
      this.registerComponent(theme.id, 'Homepage', homepageComponent);
      if (theme.homepage_component) {
        this.registerComponent(theme.id, theme.homepage_component, homepageComponent);
      }
    } catch (error) {
      throw new Error(`Failed to create homepage component: ${error}`);
    }
  }

  // Create secure homepage component from theme config
  private createSecureHomepageComponent(theme: ChildTheme): ComponentType<any> {
    return React.memo(() => {
      try {
        // Instead of eval, we'll create components based on theme configuration
        // This is a secure approach that builds components from safe templates
        
        if (theme.homepage_component) {
          // Parse the component configuration safely
          const config = this.parseComponentConfig(theme.homepage_component);
          return this.renderFromConfig(config, theme);
        }

        // Fallback to default template - graceful degradation
        console.warn(`No valid homepage component found for theme ${theme.display_name}, using default`);
        return this.renderFromConfig({ template: 'default' }, theme);
      } catch (error) {
        console.warn(`Theme component error for ${theme.display_name}:`, error);
        // Return safe fallback component instead of throwing
        return this.renderFromConfig({ template: 'default' }, theme);
      }
    });
  }

  // Parse component configuration safely
  private parseComponentConfig(componentStr: string): any {
    try {
      // Only allow JSON configuration, no executable code
      return JSON.parse(componentStr);
    } catch {
      // If not JSON, treat as template name or return default config
      return {
        template: 'custom',
        layout: componentStr,
        styles: {}
      };
    }
  }

  // Render component from safe configuration
  private renderFromConfig(config: any, theme: ChildTheme): JSX.Element {
    const { template = 'default', layout, styles = {} } = config;

    // Use predefined safe templates
    switch (template) {
      case 'hero-centered':
        return (
          <div className="min-h-screen flex items-center justify-center" style={styles}>
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-bold text-foreground">{theme.display_name}</h1>
              <p className="text-xl text-muted-foreground">
                {theme.description || 'Welcome to our manga reading platform'}
              </p>
            </div>
          </div>
        );
      
      case 'split-layout':
        return (
          <div className="min-h-screen grid md:grid-cols-2" style={styles}>
            <div className="flex items-center justify-center bg-primary/5">
              <h1 className="text-3xl font-bold text-primary">{theme.display_name}</h1>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-lg text-muted-foreground max-w-md">
                {theme.description || 'Discover amazing manga stories'}
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="container mx-auto py-16" style={styles}>
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-foreground">
                {theme.display_name}
              </h1>
              <p className="text-muted-foreground">
                {theme.description || 'Custom theme homepage'}
              </p>
            </div>
          </div>
        );
    }
  }

  // Log errors for admin panel
  private logError(theme: string, component: string, error: string): void {
    this.errorLog.push({
      theme,
      component,
      error,
      timestamp: new Date()
    });

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }

  // Get error log for admin panel
  getErrorLog(): typeof this.errorLog {
    return [...this.errorLog];
  }

  // Clear a specific theme from registry
  clearTheme(themeId: string): void {
    const keys = Array.from(this.registry.keys()).filter(key => key.startsWith(`${themeId}-`));
    keys.forEach(key => this.registry.delete(key));
    this.loadedThemes.delete(themeId);
    console.log(`🧹 Cleared components for theme: ${themeId}`);
  }

  // Hot reload a theme's components
  async hotReload(theme: ChildTheme): Promise<void> {
    this.clearTheme(theme.id);
    await this.loadThemeComponents(theme);
    
    toast({
      title: "Theme Reloaded",
      description: `Components for ${theme.display_name} have been reloaded.`,
    });
  }
}

// Global registry instance
export const componentRegistry = new ComponentRegistryManager();

// React component for using registered overrides
interface ComponentOverrideProps {
  themeId: string;
  componentName: string;
  fallback: ComponentType<any>;
  fallbackProps?: any;
  [key: string]: any;
}

export const ComponentOverride: React.FC<ComponentOverrideProps> = ({
  themeId,
  componentName,
  fallback: FallbackComponent,
  fallbackProps = {},
  ...props
}) => {
  const OverrideComponent = componentRegistry.getComponent(themeId, componentName);

  if (OverrideComponent) {
    return (
      <Suspense fallback={<div className="animate-pulse bg-muted h-32 rounded-lg" />}>
        <OverrideComponent {...props} />
      </Suspense>
    );
  }

  return <FallbackComponent {...fallbackProps} {...props} />;
};
