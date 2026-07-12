import { supabase } from '@/integrations/supabase/client';

export interface CloudflareConfig {
  api_token: string;
  zone_id: string;
  ssl_redirect_enabled?: boolean;
  ip_protection_awareness?: boolean;
  last_cache_purge?: string;
}

export interface CloudflareValidationResult {
  success: boolean;
  zone_name?: string;
  error?: string;
}

export interface CloudflarePurgeResult {
  success: boolean;
  error?: string;
}

/**
 * Detects if the current request is coming through Cloudflare
 */
export const detectCloudflare = (headers?: Headers): boolean => {
  if (typeof window !== 'undefined') {
    // Client-side detection
    const cfRay = document.querySelector('meta[name="cf-ray"]')?.getAttribute('content');
    return !!cfRay;
  }
  
  if (headers) {
    // Server-side detection
    return !!(
      headers.get('cf-ray') ||
      headers.get('cf-connecting-ip') ||
      headers.get('cf-ipcountry')
    );
  }
  
  return false;
};

/**
 * Gets the real client IP, accounting for Cloudflare proxying
 */
export const getRealClientIP = (headers?: Headers): string | null => {
  if (!headers) return null;
  
  // Try Cloudflare headers first
  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP;
  
  // Fallback to standard headers
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  const xRealIP = headers.get('x-real-ip');
  if (xRealIP) return xRealIP;
  
  return null;
};

/**
 * Gets Cloudflare configuration from database
 */
export const getCloudflareConfig = async (): Promise<CloudflareConfig | null> => {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .single();
    
    // Handle cloudflare_config as any since it might not be in the types yet
    return (data as any)?.cloudflare_config || null;
  } catch (error) {
    console.error('Error loading Cloudflare config:', error);
    return null;
  }
};

/**
 * Saves Cloudflare configuration to database
 */
export const saveCloudflareConfig = async (config: CloudflareConfig): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: crypto.randomUUID(),
        cloudflare_config: config
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving Cloudflare config:', error);
    return false;
  }
};

/**
 * Updates last cache purge timestamp
 */
export const updateLastCachePurge = async (): Promise<boolean> => {
  try {
    const config = await getCloudflareConfig();
    if (!config) return false;
    
    const updatedConfig = {
      ...config,
      last_cache_purge: new Date().toISOString()
    };
    
    return await saveCloudflareConfig(updatedConfig);
  } catch (error) {
    console.error('Error updating cache purge timestamp:', error);
    return false;
  }
};

/**
 * Validates Cloudflare credentials and returns zone information
 */
export const validateCloudflareCredentials = async (
  apiToken: string, 
  zoneId: string
): Promise<CloudflareValidationResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('cloudflare-operations', {
      body: {
        action: 'test',
        api_token: apiToken,
        zone_id: zoneId
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Validation request failed'
      };
    }

    return data;
  } catch (error) {
    console.error('Error validating Cloudflare credentials:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Purges all cache from Cloudflare
 */
export const purgeCloudflareCache = async (): Promise<CloudflarePurgeResult> => {
  try {
    const config = await getCloudflareConfig();
    if (!config || !config.api_token || !config.zone_id) {
      return {
        success: false,
        error: 'Cloudflare not configured'
      };
    }

    const { data, error } = await supabase.functions.invoke('cloudflare-operations', {
      body: {
        action: 'purge',
        api_token: config.api_token,
        zone_id: config.zone_id
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Purge request failed'
      };
    }

    if (data.success) {
      await updateLastCachePurge();
    }

    return data;
  } catch (error) {
    console.error('Error purging Cloudflare cache:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Gets Cloudflare status for system checklist
 */
export const getCloudflareStatus = async () => {
  const config = await getCloudflareConfig();
  
  return {
    configured: !!(config?.api_token && config?.zone_id),
    ssl_redirect_enabled: config?.ssl_redirect_enabled || false,
    ip_protection_aware: config?.ip_protection_awareness || false,
    last_cache_purge: config?.last_cache_purge || null,
    api_token_present: !!config?.api_token,
    zone_id_present: !!config?.zone_id
  };
};