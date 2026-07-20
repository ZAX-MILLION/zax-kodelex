import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { hasSupabaseCredentials, resolveSupabaseConfig } from './config';

const config = resolveSupabaseConfig();

export const isSupabaseConfigured = hasSupabaseCredentials();

function createOfflineDemoClient(): SupabaseClient {
  const client = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      storage: localStorage,
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  // Demo hosts must never open a realtime socket.
  try {
    client.realtime.disconnect();
  } catch {
    /* ignore */
  }
  return client as SupabaseClient;
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(config.url, config.anonKey, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createOfflineDemoClient();

export function createSupabaseClient(url: string, anonKey: string) {
  return createClient(url, anonKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
