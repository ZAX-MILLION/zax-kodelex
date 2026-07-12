const DEV_FALLBACK_URL = 'https://eslcxgomsaizesekdvcc.supabase.co';
const DEV_FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbGN4Z29tc2FpemVzZWtkdmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODQ4ODAsImV4cCI6MjA2ODk2MDg4MH0.1MeKBV8__kEK06kOlj9VlNnLwtm9BWJfOv_dLlnNRnM';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  source: 'env' | 'localStorage' | 'dev-fallback' | 'none';
}

export function resolveSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey, source: 'env' };
  }

  if (typeof localStorage !== 'undefined') {
    const storedUrl = localStorage.getItem('supabase_url')?.trim();
    const storedKey = localStorage.getItem('supabase_anon')?.trim();
    if (storedUrl && storedKey) {
      return { url: storedUrl, anonKey: storedKey, source: 'localStorage' };
    }
  }

  const globalUrl = (globalThis as { __SUPABASE_URL__?: string }).__SUPABASE_URL__?.trim();
  const globalKey = (globalThis as { __SUPABASE_ANON_KEY__?: string }).__SUPABASE_ANON_KEY__?.trim();
  if (globalUrl && globalKey) {
    return { url: globalUrl, anonKey: globalKey, source: 'localStorage' };
  }

  if (import.meta.env.DEV) {
    return { url: DEV_FALLBACK_URL, anonKey: DEV_FALLBACK_ANON_KEY, source: 'dev-fallback' };
  }

  return { url: '', anonKey: '', source: 'none' };
}

export function hasSupabaseCredentials(): boolean {
  const config = resolveSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

export function persistSupabaseCredentials(url: string, anonKey: string) {
  localStorage.setItem('supabase_url', url.trim());
  localStorage.setItem('supabase_anon', anonKey.trim());
}
