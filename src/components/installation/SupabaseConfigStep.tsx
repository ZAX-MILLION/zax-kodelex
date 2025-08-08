import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, Database, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { SetupData } from '@/pages/Setup';

interface SupabaseConfigStepProps {
  data: SetupData;
  onUpdate: (updates: Partial<SetupData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
}

export const SupabaseConfigStep = ({ data, onUpdate, onNext, onPrev }: SupabaseConfigStepProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const validateSupabaseConnection = async () => {
    if (!data.supabaseConfig.url || !data.supabaseConfig.anonKey) {
      setValidationResult({
        isValid: false,
        message: 'Please enter both Supabase URL and anon key'
      });
      return;
    }

    setIsValidating(true);
    try {
      const testClient = createClient(data.supabaseConfig.url, data.supabaseConfig.anonKey);
      
      // Test the connection by trying to fetch from a simple query
      const { error } = await testClient.from('profiles').select('count').limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 means table doesn't exist, which is ok
        throw error;
      }

      setValidationResult({
        isValid: true,
        message: 'Successfully connected to Supabase!'
      });
    } catch (error) {
      console.error('Supabase validation error:', error);
      setValidationResult({
        isValid: false,
        message: 'Failed to connect to Supabase. Please check your URL and key.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleNext = () => {
    if (validationResult?.isValid) {
      onNext();
    } else {
      validateSupabaseConnection();
    }
  };

  const isValid = validationResult?.isValid;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit">
          <Database className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Configure Supabase Connection</h3>
        <p className="text-muted-foreground">
          Enter your Supabase project credentials to connect your database
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Project Details
          </CardTitle>
          <CardDescription>
            You can find these values in your Supabase project settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supabase-url">Project URL</Label>
            <Input
              id="supabase-url"
              type="url"
              placeholder="https://your-project.supabase.co"
              value={data.supabaseConfig.url}
              onChange={(e) => onUpdate({
                supabaseConfig: {
                  ...data.supabaseConfig,
                  url: e.target.value
                }
              })}
              className={validationResult && !validationResult.isValid ? 'border-red-500' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supabase-anon-key">Anon Public Key</Label>
            <Input
              id="supabase-anon-key"
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={data.supabaseConfig.anonKey}
              onChange={(e) => onUpdate({
                supabaseConfig: {
                  ...data.supabaseConfig,
                  anonKey: e.target.value
                }
              })}
              className={validationResult && !validationResult.isValid ? 'border-red-500' : ''}
            />
          </div>

          <div className="pt-2">
            <Button
              onClick={validateSupabaseConnection}
              disabled={isValidating || !data.supabaseConfig.url || !data.supabaseConfig.anonKey}
              variant="outline"
              className="w-full"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          </div>

          {validationResult && (
            <Alert className={isValid ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
              {isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={isValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                {validationResult.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Find your Supabase credentials in your project dashboard:
          </p>
          <div className="space-y-2">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4" />
              Open Supabase Dashboard
            </a>
            <p className="text-xs text-muted-foreground">
              Go to Settings → API to find your Project URL and anon public key
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!isValid}
          className="flex items-center gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};