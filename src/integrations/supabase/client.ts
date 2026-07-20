import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { hasSupabaseCredentials, resolveSupabaseConfig } from './config';

const config = resolveSupabaseConfig();

export const isSupabaseConfigured = hasSupabaseCredentials();

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(config.url, config.anonKey, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        storage: localStorage,
        persistSession: false,
        autoRefreshToken: false,
      },
    }) as SupabaseClient);

export function createSupabaseClient(url: string, anonKey: string) {
  return createClient(url, anonKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
