import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SecretStatus {
  name: string;
  displayName: string;
  configured: boolean;
  required: boolean;
}

const PayPalSecretsChecker = () => {
  const [secrets, setSecrets] = useState<SecretStatus[]>([
    { name: 'PAYPAL_CLIENT_ID', displayName: 'PayPal Client ID', configured: false, required: true },
    { name: 'PAYPAL_CLIENT_SECRET', displayName: 'PayPal Client Secret', configured: false, required: true },
    { name: 'PAYPAL_ENVIRONMENT', displayName: 'PayPal Environment', configured: false, required: true },
  ]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkSecrets = async () => {
    setLoading(true);
    try {
      // Test the PayPal configuration by calling our edge function
      const { data, error } = await supabase.functions.invoke('paypal-subscribe', {
        body: { test: true }
      });

      // Update secret status based on response
      const updatedSecrets = secrets.map(secret => ({
        ...secret,
        configured: !error || !error.message?.includes(secret.name)
      }));
      
      setSecrets(updatedSecrets);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking secrets:', error);
      // If there's a network error, assume secrets might not be configured
      setSecrets(prev => prev.map(s => ({ ...s, configured: false })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSecrets();
  }, []);

  const allConfigured = secrets.every(s => s.configured || !s.required);
  const missingRequired = secrets.filter(s => s.required && !s.configured);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              PayPal Configuration Status
              {allConfigured ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardTitle>
            <CardDescription>
              Monitor PayPal edge function secrets configuration
            </CardDescription>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkSecrets} 
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Check Status
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!allConfigured && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              PayPal monetization is not fully configured. Missing secrets will prevent subscription functionality.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-3">
          {secrets.map((secret) => (
            <div key={secret.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {secret.configured ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <div>
                  <p className="font-medium">{secret.displayName}</p>
                  <p className="text-sm text-muted-foreground">{secret.name}</p>
                </div>
              </div>
              
              <Badge variant={secret.configured ? "default" : "destructive"}>
                {secret.configured ? 'Configured' : 'Missing'}
              </Badge>
            </div>
          ))}
        </div>

        {missingRequired.length > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-sm">Required Actions:</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Go to Supabase Edge Functions settings</li>
              <li>Add the missing environment variables</li>
              <li>Get your PayPal credentials from PayPal Developer Dashboard</li>
              <li>Set PAYPAL_ENVIRONMENT to "sandbox" or "live"</li>
            </ol>
            
            <Button asChild variant="outline" size="sm" className="w-full">
              <a 
                href="https://supabase.com/dashboard/project/eslcxgomsaizesekdvcc/settings/functions"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Supabase Functions Settings
              </a>
            </Button>
          </div>
        )}

        {lastChecked && (
          <p className="text-xs text-muted-foreground">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PayPalSecretsChecker;