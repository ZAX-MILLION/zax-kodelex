/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: 'demo' | 'staging' | 'production';
  readonly VITE_DEMO_MODE?: string;
  readonly VITE_SKIP_SETUP?: string;
  readonly VITE_DISABLE_PAYMENTS?: string;
  readonly VITE_DISABLE_ADMIN?: string;
  readonly VITE_ALLOW_SIMULATED_BUY?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_PAYPAL_CLIENT_ID?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_BASE?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
