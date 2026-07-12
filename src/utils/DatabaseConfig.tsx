import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Settings, TestTube, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DatabaseFactory, ConfigValidator, type MySQLConfig } from './MySQLAdapter';

const DatabaseConfig = () => {
  const [useMySQL, setUseMySQL] = useState(false);
  const [mysqlConfig, setMysqlConfig] = useState<MySQLConfig>({
    host: 'localhost',
    port: 3306,
    database: 'manga_reader',
    username: 'root',
    password: '',
    ssl: false
  });
  const [testing, setTesting] = useState(false);
  const [configValid, setConfigValid] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load configuration from localStorage
    const savedConfig = localStorage.getItem('db_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setUseMySQL(config.useMySQL || false);
        setMysqlConfig({ ...mysqlConfig, ...config.mysql });
      } catch (error) {
        console.error('Failed to load database config:', error);
      }
    }
  }, []);

  useEffect(() => {
    setConfigValid(ConfigValidator.validateMySQLConfig(mysqlConfig));
  }, [mysqlConfig]);

  const saveConfiguration = () => {
    try {
      const config = {
        useMySQL,
        mysql: mysqlConfig
      };
      
      localStorage.setItem('db_config', JSON.stringify(config));
      DatabaseFactory.configure(useMySQL, useMySQL ? mysqlConfig : undefined);
      
      toast({
        title: "Configuration Saved",
        description: `Database configured for ${useMySQL ? 'MySQL' : 'Supabase'}`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save database configuration",
        variant: "destructive",
      });
    }
  };

  const testConnection = async () => {
    setTesting(true);
    
    try {
      if (useMySQL) {
        // In production, this would test actual MySQL connection
        if (!configValid) {
          throw new Error('Invalid MySQL configuration');
        }
        
        // Simulate connection test
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Connection Test",
          description: "MySQL connection test passed! (Simulated)",
        });
      } else {
        // Test Supabase connection
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) throw error;
        
        toast({
          title: "Connection Test",
          description: "Supabase connection test passed!",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Connection test failed",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const updateMySQLConfig = (field: keyof MySQLConfig, value: string | number | boolean) => {
    setMysqlConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Configuration
          </CardTitle>
          <CardDescription>
            Configure your database connection for production deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="test">Connection Test</TabsTrigger>
              <TabsTrigger value="info">Information</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-mysql"
                    checked={useMySQL}
                    onCheckedChange={setUseMySQL}
                  />
                  <Label htmlFor="use-mysql">Use MySQL Database</Label>
                </div>

                {!useMySQL && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Currently using Supabase (PostgreSQL). This is recommended for development and can be easily migrated to MySQL for production.
                    </AlertDescription>
                  </Alert>
                )}

                {useMySQL && (
                  <div className="space-y-4">
                    <Alert>
                      <Settings className="h-4 w-4" />
                      <AlertDescription>
                        MySQL mode is for production deployment. Make sure your MySQL server is set up with the schema file.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="host">Host</Label>
                        <Input
                          id="host"
                          value={mysqlConfig.host}
                          onChange={(e) => updateMySQLConfig('host', e.target.value)}
                          placeholder="localhost"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input
                          id="port"
                          type="number"
                          value={mysqlConfig.port}
                          onChange={(e) => updateMySQLConfig('port', parseInt(e.target.value) || 3306)}
                          placeholder="3306"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="database">Database</Label>
                        <Input
                          id="database"
                          value={mysqlConfig.database}
                          onChange={(e) => updateMySQLConfig('database', e.target.value)}
                          placeholder="manga_reader"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={mysqlConfig.username}
                          onChange={(e) => updateMySQLConfig('username', e.target.value)}
                          placeholder="root"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={mysqlConfig.password}
                          onChange={(e) => updateMySQLConfig('password', e.target.value)}
                          placeholder="Enter database password"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="ssl"
                          checked={mysqlConfig.ssl}
                          onCheckedChange={(checked) => updateMySQLConfig('ssl', checked)}
                        />
                        <Label htmlFor="ssl">Use SSL Connection</Label>
                      </div>
                    </div>

                    {!configValid && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          Please fill in all required fields with valid values.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button 
                    onClick={saveConfiguration}
                    disabled={useMySQL && !configValid}
                  >
                    Save Configuration
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test your database connection to ensure everything is configured correctly.
                </p>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Current Configuration:</h4>
                  <ul className="text-sm space-y-1">
                    <li><strong>Database Type:</strong> {useMySQL ? 'MySQL' : 'Supabase (PostgreSQL)'}</li>
                    {useMySQL && (
                      <>
                        <li><strong>Host:</strong> {mysqlConfig.host}:{mysqlConfig.port}</li>
                        <li><strong>Database:</strong> {mysqlConfig.database}</li>
                        <li><strong>Username:</strong> {mysqlConfig.username}</li>
                        <li><strong>SSL:</strong> {mysqlConfig.ssl ? 'Enabled' : 'Disabled'}</li>
                      </>
                    )}
                  </ul>
                </div>

                <Button 
                  onClick={testConnection}
                  disabled={testing || (useMySQL && !configValid)}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  {testing ? 'Testing Connection...' : 'Test Connection'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Database Options</h3>
                
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Supabase (Current)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p className="mb-2">PostgreSQL-based backend-as-a-service</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Built-in authentication and authorization</li>
                        <li>Real-time subscriptions</li>
                        <li>Automatic API generation</li>
                        <li>File storage and edge functions</li>
                        <li>Perfect for development and modern hosting</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">MySQL</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p className="mb-2">Traditional relational database</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Widely supported by shared hosting</li>
                        <li>Familiar to most developers</li>
                        <li>Cost-effective for traditional hosting</li>
                        <li>Requires custom authentication implementation</li>
                        <li>Best for CodeCanyon sales and client projects</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recommendation:</strong> Keep Supabase for development and provide MySQL migration tools for buyers. This gives the best of both worlds - a working demo with easy migration options.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseConfig;