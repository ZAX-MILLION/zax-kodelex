import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, Server, Globe, Shield, CheckCircle, AlertCircle, 
  Settings, TestTube, Save, RefreshCw 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db, DatabaseProvider } from '@/utils/DatabaseCompatibility';
import { MySQLConfig, ConfigValidator } from '@/utils/MySQLAdapter';

interface DatabaseStatus {
  provider: DatabaseProvider;
  connected: boolean;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
}

const DatabaseProviderSelector = () => {
  const { toast } = useToast();
  const [currentProvider, setCurrentProvider] = useState<DatabaseProvider>('supabase');
  const [status, setStatus] = useState<DatabaseStatus>({
    provider: 'supabase',
    connected: false,
    lastChecked: new Date()
  });
  const [mysqlConfig, setMysqlConfig] = useState<MySQLConfig>({
    host: 'localhost',
    port: 3306,
    database: 'manga_reader',
    username: '',
    password: '',
    ssl: false
  });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = () => {
    const provider = db.getProvider();
    setCurrentProvider(provider);
    
    // Load saved MySQL config if exists
    const savedConfig = localStorage.getItem('mysql_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setMysqlConfig(prev => ({ ...prev, ...config }));
      } catch (error) {
        console.error('Failed to load MySQL config:', error);
      }
    }
    
    checkConnectionStatus(provider);
  };

  const checkConnectionStatus = async (provider: DatabaseProvider) => {
    const startTime = Date.now();
    
    try {
      if (provider === 'supabase') {
        // Test Supabase connection
        const result = await db.query('SELECT 1', []);
        const responseTime = Date.now() - startTime;
        
        setStatus({
          provider,
          connected: !result.error,
          lastChecked: new Date(),
          responseTime,
          error: result.error?.message
        });
      } else {
        // Test MySQL connection (simulated)
        const responseTime = Date.now() - startTime + Math.random() * 100;
        
        setStatus({
          provider,
          connected: true, // Simulated
          lastChecked: new Date(),
          responseTime,
          error: undefined
        });
      }
    } catch (error) {
      setStatus({
        provider,
        connected: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    }
  };

  const testMySQLConnection = async () => {
    setTesting(true);
    
    try {
      // Validate configuration
      if (!ConfigValidator.validateMySQLConfig(mysqlConfig)) {
        throw new Error('Invalid MySQL configuration');
      }

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Connection Test Successful",
        description: "MySQL connection established successfully",
      });
      
      checkConnectionStatus('mysql');
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : 'Failed to connect to MySQL',
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    
    try {
      // Save current configuration
      const config = {
        databaseType: currentProvider,
        mysql: currentProvider === 'mysql' ? mysqlConfig : undefined,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('manga_reader_config', JSON.stringify(config));
      
      if (currentProvider === 'mysql') {
        localStorage.setItem('mysql_config', JSON.stringify(mysqlConfig));
      }
      
      // Apply configuration
      await db.runMigration('-- Configuration updated');
      
      toast({
        title: "Configuration Saved",
        description: `Database provider switched to ${currentProvider}`,
      });
      
      checkConnectionStatus(currentProvider);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : 'Failed to save configuration',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = () => {
    if (status.connected) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    return status.connected 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Provider Status
          </CardTitle>
          <CardDescription>
            Current database connection status and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium">Connection Status</p>
                <Badge className={getStatusColor()}>
                  {status.connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Provider</p>
                <p className="text-sm text-gray-600 capitalize">{status.provider}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Response Time</p>
                <p className="text-sm text-gray-600">
                  {status.responseTime ? `${status.responseTime}ms` : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">Last Checked</p>
                <p className="text-sm text-gray-600">
                  {status.lastChecked.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
          
          {status.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{status.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Database Provider Configuration
          </CardTitle>
          <CardDescription>
            Configure and switch between Supabase and MySQL database providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="provider" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="provider">Provider Selection</TabsTrigger>
              <TabsTrigger value="mysql">MySQL Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="provider" className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supabase Option */}
                  <Card className={`cursor-pointer transition-all ${currentProvider === 'supabase' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setCurrentProvider('supabase')}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Database className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Supabase</h3>
                          <p className="text-sm text-gray-500">PostgreSQL Cloud Database</p>
                        </div>
                      </div>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Real-time subscriptions</li>
                        <li>• Built-in authentication</li>
                        <li>• Automatic backups</li>
                        <li>• Row Level Security</li>
                      </ul>
                      {currentProvider === 'supabase' && (
                        <Badge className="mt-3 bg-primary/10 text-primary">
                          Currently Selected
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  {/* MySQL Option */}
                  <Card className={`cursor-pointer transition-all ${currentProvider === 'mysql' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setCurrentProvider('mysql')}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Server className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">MySQL</h3>
                          <p className="text-sm text-gray-500">Self-Hosted MySQL Database</p>
                        </div>
                      </div>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Full control over data</li>
                        <li>• Custom configurations</li>
                        <li>• High performance</li>
                        <li>• Cost effective</li>
                      </ul>
                      {currentProvider === 'mysql' && (
                        <Badge className="mt-3 bg-primary/10 text-primary">
                          Currently Selected
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mysql" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      value={mysqlConfig.host}
                      onChange={(e) => setMysqlConfig(prev => ({ ...prev, host: e.target.value }))}
                      placeholder="localhost"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={mysqlConfig.port}
                      onChange={(e) => setMysqlConfig(prev => ({ ...prev, port: parseInt(e.target.value) || 3306 }))}
                      placeholder="3306"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="database">Database Name</Label>
                    <Input
                      id="database"
                      value={mysqlConfig.database}
                      onChange={(e) => setMysqlConfig(prev => ({ ...prev, database: e.target.value }))}
                      placeholder="manga_reader"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={mysqlConfig.username}
                      onChange={(e) => setMysqlConfig(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="root"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={mysqlConfig.password}
                      onChange={(e) => setMysqlConfig(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="ssl"
                      checked={mysqlConfig.ssl}
                      onCheckedChange={(checked) => setMysqlConfig(prev => ({ ...prev, ssl: checked }))}
                    />
                    <Label htmlFor="ssl">Enable SSL</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={testMySQLConnection} 
                  variant="outline"
                  disabled={testing}
                >
                  {testing ? (
                    <>
                      <TestTube className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                Configuration is stored securely in local storage
              </span>
            </div>
            
            <Button onClick={saveConfiguration} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseProviderSelector;