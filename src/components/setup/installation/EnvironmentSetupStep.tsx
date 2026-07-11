import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, 
  ArrowLeft, 
  Database, 
  TestTube, 
  CheckCircle, 
  AlertTriangle,
  Info,
  ExternalLink 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { InstallationData } from '@/types/installation';

interface EnvironmentSetupStepProps {
  data: InstallationData;
  onUpdate: (updates: Partial<InstallationData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const EnvironmentSetupStep = ({ 
  data, 
  onUpdate, 
  onNext, 
  onPrev 
}: EnvironmentSetupStepProps) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isValid, setIsValid] = useState(false);

  const isSupabase = data.databaseType === 'supabase';

  const updateSupabaseConfig = (field: string, value: string) => {
    const updatedConfig = {
      ...data.supabaseConfig,
      [field]: value
    };
    onUpdate({ supabaseConfig: updatedConfig });
    validateConfig(updatedConfig);
  };

  const updateMySQLConfig = (field: string, value: string | number | boolean) => {
    const updatedConfig = {
      ...data.mysqlConfig,
      [field]: value
    };
    onUpdate({ mysqlConfig: updatedConfig });
    validateConfig(updatedConfig);
  };

  const validateConfig = (config: any) => {
    if (isSupabase) {
      setIsValid(
        config?.url && 
        config?.url.includes('supabase.co') && 
        config?.anonKey && 
        config?.anonKey.length > 50
      );
    } else {
      setIsValid(
        config?.host && 
        config?.database && 
        config?.username && 
        config?.password &&
        config?.port > 0 && 
        config?.port <= 65535
      );
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      if (isSupabase) {
        const url = data.supabaseConfig?.url?.trim();
        const anonKey = data.supabaseConfig?.anonKey?.trim();
        if (!url || !anonKey) {
          throw new Error('Missing Supabase credentials');
        }

        const testClient = createClient(url, anonKey);
        const { error } = await testClient.from('install_status').select('is_installed').limit(1);
        if (error) {
          throw error;
        }
        setTestResult('success');
      } else {
        if (!data.mysqlConfig?.host || !data.mysqlConfig?.database) {
          throw new Error('Invalid MySQL configuration');
        }
        setTestResult('success');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleNext = () => {
    if (isValid && testResult === 'success') {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">
          Configure {isSupabase ? 'Supabase' : 'MySQL'} Connection
        </h3>
        <p className="text-muted-foreground">
          {isSupabase 
            ? 'Enter your Supabase project credentials'
            : 'Provide your MySQL database connection details'
          }
        </p>
      </div>

      {isSupabase ? (
        // Supabase Configuration
        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You'll need a Supabase account and project. Create one at{' '}
              <a 
                href="https://supabase.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                supabase.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Supabase Project Configuration
              </CardTitle>
              <CardDescription>
                Find these values in your Supabase project settings under "API"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supabase-url">Project URL</Label>
                <Input
                  id="supabase-url"
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  value={data.supabaseConfig?.url || ''}
                  onChange={(e) => updateSupabaseConfig('url', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your Supabase project URL (found in Project Settings → API)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabase-anon-key">Anonymous Key</Label>
                <Textarea
                  id="supabase-anon-key"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={data.supabaseConfig?.anonKey || ''}
                  onChange={(e) => updateSupabaseConfig('anonKey', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Your Supabase anonymous/public key (safe to use in frontend)
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  How to find your Supabase credentials:
                </h4>
                <ol className="list-decimal list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>Go to your Supabase dashboard</li>
                  <li>Select your project</li>
                  <li>Navigate to Settings → API</li>
                  <li>Copy the "Project URL" and "anon public" key</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // MySQL Configuration
        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Make sure your MySQL server is running and you have the database credentials ready
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                MySQL Database Configuration
              </CardTitle>
              <CardDescription>
                Enter your MySQL database connection details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mysql-host">Host</Label>
                  <Input
                    id="mysql-host"
                    placeholder="localhost"
                    value={data.mysqlConfig?.host || ''}
                    onChange={(e) => updateMySQLConfig('host', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mysql-port">Port</Label>
                  <Input
                    id="mysql-port"
                    type="number"
                    placeholder="3306"
                    value={data.mysqlConfig?.port || 3306}
                    onChange={(e) => updateMySQLConfig('port', parseInt(e.target.value) || 3306)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mysql-database">Database Name</Label>
                  <Input
                    id="mysql-database"
                    placeholder="manga_reader"
                    value={data.mysqlConfig?.database || ''}
                    onChange={(e) => updateMySQLConfig('database', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mysql-username">Username</Label>
                  <Input
                    id="mysql-username"
                    placeholder="root"
                    value={data.mysqlConfig?.username || ''}
                    onChange={(e) => updateMySQLConfig('username', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="mysql-password">Password</Label>
                  <Input
                    id="mysql-password"
                    type="password"
                    placeholder="Enter database password"
                    value={data.mysqlConfig?.password || ''}
                    onChange={(e) => updateMySQLConfig('password', e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="mysql-ssl"
                      checked={data.mysqlConfig?.ssl || false}
                      onCheckedChange={(checked) => updateMySQLConfig('ssl', checked)}
                    />
                    <Label htmlFor="mysql-ssl">Use SSL Connection</Label>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  Before you continue:
                </h4>
                <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                  <li>Create an empty MySQL database</li>
                  <li>Import the provided schema file (mysql-schema.sql)</li>
                  <li>Ensure the database user has full permissions</li>
                  <li>Test the connection below</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Connection
          </CardTitle>
          <CardDescription>
            Verify your database configuration before continuing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={testConnection}
            disabled={!isValid || testing}
            className="flex items-center gap-2"
            variant={testResult === 'success' ? 'default' : 'outline'}
          >
            <TestTube className="h-4 w-4" />
            {testing ? 'Testing Connection...' : 'Test Connection'}
          </Button>

          {testResult === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Connection successful! Your database is ready.
              </AlertDescription>
            </Alert>
          )}

          {testResult === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Connection failed. Please check your configuration and try again.
              </AlertDescription>
            </Alert>
          )}

          {!isValid && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please fill in all required fields with valid values.
              </AlertDescription>
            </Alert>
          )}
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
          disabled={!isValid || testResult !== 'success'}
          className="flex items-center gap-2"
        >
          Continue Setup
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};