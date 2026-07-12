import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CloudflareRequest {
  action: 'test' | 'purge';
  api_token: string;
  zone_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, api_token, zone_id }: CloudflareRequest = await req.json();

    if (!action || !api_token || !zone_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: action, api_token, zone_id' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const cloudflareHeaders = {
      'Authorization': `Bearer ${api_token}`,
      'Content-Type': 'application/json',
    };

    if (action === 'test') {
      // Test credentials by fetching zone information
      console.log(`Testing Cloudflare credentials for zone: ${zone_id}`);
      
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zone_id}`,
        {
          method: 'GET',
          headers: cloudflareHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Cloudflare API error:', data);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: data.errors?.[0]?.message || 'Invalid credentials' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`Successfully validated zone: ${data.result?.name}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          zone_name: data.result?.name,
          zone_status: data.result?.status
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else if (action === 'purge') {
      // Purge all cache for the zone
      console.log(`Purging cache for zone: ${zone_id}`);
      
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zone_id}/purge_cache`,
        {
          method: 'POST',
          headers: cloudflareHeaders,
          body: JSON.stringify({ purge_everything: true }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Cloudflare cache purge error:', data);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: data.errors?.[0]?.message || 'Cache purge failed' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Cache purge successful:', data);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          purge_id: data.result?.id,
          message: 'Cache purged successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid action. Use "test" or "purge"' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in cloudflare-operations function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});