export type InstallationData = {
  databaseType: 'supabase' | 'mysql';
  mysqlConfig?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
  };
  supabaseConfig: {
    url: string;
    anonKey: string;
  };
  licenseFile?: File;
  licenseData?: {
    key: string;
    type: 'single-series' | 'multi-series';
    validUntil?: string;
    domains?: string[];
  };
  adminAccount: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  themeMode: 'single-series' | 'multi-series';
  basicSettings: {
    siteName: string;
    contactEmail: string;
    siteDescription: string;
  };
  skipLicense?: boolean;
  licenseKey?: string;
};
