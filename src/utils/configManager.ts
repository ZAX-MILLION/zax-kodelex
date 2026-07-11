interface SiteConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  themeColor: string;
  logoUrl: string;
  heroImageUrl: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: 'user' | 'author';
  maxUploadSize: number;
  enableComments: boolean;
  enableBookmarks: boolean;
  enableAnalytics: boolean;
  analyticsId?: string;
  monetizationEnabled: boolean;
  premiumPricing: {
    monthly: number;
    yearly: number;
  };
  coinPricing: {
    [amount: number]: number;
  };
}

interface DatabaseConfig {
  type: 'supabase' | 'mysql';
  supabase?: {
    url: string;
    anonKey: string;
  };
  mysql?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
}

interface AppConfig {
  site: SiteConfig;
  database: DatabaseConfig;
  features: {
    [key: string]: boolean;
  };
  version: string;
  installedAt: string;
}

class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig | null = null;

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async loadConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem('app_config');
      if (stored) {
        this.config = JSON.parse(stored);
        return this.config!;
      }

      // Default configuration
      this.config = this.getDefaultConfig();
      return this.config;
    } catch (error) {
      console.error('Failed to load config:', error);
      this.config = this.getDefaultConfig();
      return this.config;
    }
  }

  async saveConfig(config: Partial<AppConfig>): Promise<void> {
    try {
      this.config = { ...this.config!, ...config };
      localStorage.setItem('app_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save config:', error);
      throw new Error('Configuration save failed');
    }
  }

  getSiteConfig(): SiteConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.site;
  }

  getDatabaseConfig(): DatabaseConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded');
    }
    return this.config.database;
  }

  getFeatureFlag(flagName: string): boolean {
    if (!this.config) {
      return false;
    }
    return this.config.features[flagName] ?? false;
  }

  async updateSiteConfig(updates: Partial<SiteConfig>): Promise<void> {
    if (!this.config) {
      await this.loadConfig();
    }
    
    const updatedConfig = {
      ...this.config!,
      site: { ...this.config!.site, ...updates }
    };
    
    await this.saveConfig(updatedConfig);
  }

  async updateFeatureFlag(flagName: string, enabled: boolean): Promise<void> {
    if (!this.config) {
      await this.loadConfig();
    }
    
    const updatedConfig = {
      ...this.config!,
      features: { ...this.config!.features, [flagName]: enabled }
    };
    
    await this.saveConfig(updatedConfig);
  }

  isInstallationComplete(): boolean {
    return localStorage.getItem('installation_complete') === 'true';
  }

  markInstallationComplete(): void {
    localStorage.setItem('installation_complete', 'true');
  }

  private getDefaultConfig(): AppConfig {
    return {
      site: {
        siteName: 'Zax Million',
        siteDescription: 'Professional manga reading platform',
        siteUrl: window.location.origin,
        adminEmail: '',
        themeColor: '#3b82f6',
        logoUrl: '',
        heroImageUrl: '',
        allowRegistration: true,
        requireEmailVerification: false,
        defaultUserRole: 'user',
        maxUploadSize: 10 * 1024 * 1024, // 10MB
        enableComments: true,
        enableBookmarks: true,
        enableAnalytics: false,
        monetizationEnabled: false,
        premiumPricing: {
          monthly: 9.99,
          yearly: 99.99
        },
        coinPricing: {
          100: 0.99,
          500: 4.99,
          1000: 9.99,
          2500: 19.99
        }
      },
      database: {
        type: 'supabase'
      },
      features: {
        premium_chapters: false,
        coin_system: false,
        contests: false,
        analytics: false,
        theming: true,
        comments: true,
        bookmarks: true,
        user_profiles: true,
        admin_panel: true
      },
      version: '2.0.0',
      installedAt: new Date().toISOString()
    };
  }
}

export const configManager = ConfigManager.getInstance();
export type { SiteConfig, DatabaseConfig, AppConfig };