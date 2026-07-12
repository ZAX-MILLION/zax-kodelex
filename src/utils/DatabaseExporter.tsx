import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Download, Database, FileText, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DatabaseExporter = () => {
  const [exporting, setExporting] = useState(false);
  const [mysqlData, setMysqlData] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const tables = [
    'profiles', 'manga_meta', 'chapters', 'comments', 'reading_progress',
    'bookmarks', 'site_settings', 'customers', 'purchases', 'licenses',
    'global_notifications', 'feature_toggles', 'seo_settings',
    'user_activity_logs', 'analytics_config', 'ad_zones', 'admin_actions',
    'donations', 'license_verifications', 'download_logs'
  ] as const;

  const exportToMySQL = async () => {
    setExporting(true);
    let mysqlExport = '';

    try {
      mysqlExport += '-- MySQL Data Export from Supabase\n';
      mysqlExport += '-- Generated on: ' + new Date().toISOString() + '\n\n';
      mysqlExport += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table as any)
            .select('*')
            .limit(1000);

          if (error) {
            console.warn(`Error exporting ${table}:`, error);
            continue;
          }

          if (data && data.length > 0) {
            mysqlExport += `-- Data for table: ${table}\n`;
            mysqlExport += `DELETE FROM ${table};\n`;

            for (const row of data) {
              const columns = Object.keys(row);
              const values = columns.map(col => {
                const value = row[col];
                if (value === null) return 'NULL';
                if (typeof value === 'string') {
                  return `'${value.replace(/'/g, "''")}'`;
                }
                if (typeof value === 'boolean') {
                  return value ? '1' : '0';
                }
                if (typeof value === 'object') {
                  return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
                }
                if (value instanceof Date) {
                  return `'${value.toISOString()}'`;
                }
                return String(value);
              });

              mysqlExport += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
            }
            mysqlExport += '\n';
          }
        } catch (err) {
          console.warn(`Error processing table ${table}:`, err);
        }
      }

      mysqlExport += 'SET FOREIGN_KEY_CHECKS = 1;\n';
      mysqlExport += '\n-- Export completed successfully!\n';

      setMysqlData(mysqlExport);
      toast({
        title: "Export Completed",
        description: "Database export generated successfully!",
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mysqlData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "MySQL export copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSchema = () => {
    fetch('/src/utils/mysql-schema.sql')
      .then(response => response.text())
      .then(data => downloadFile(data, 'mysql-schema.sql'))
      .catch(() => {
        toast({
          title: "Download Failed",
          description: "Could not download schema file.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Migration Tools
          </CardTitle>
          <CardDescription>
            Export your Supabase data to MySQL format for easy migration to traditional hosting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export">Data Export</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={exportToMySQL} 
                  disabled={exporting}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {exporting ? 'Exporting...' : 'Export Data to MySQL'}
                </Button>
                
                {mysqlData && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => downloadFile(mysqlData, 'mysql-data-export.sql')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download SQL File
                    </Button>
                  </>
                )}
              </div>

              {mysqlData && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Generated MySQL Export:</label>
                  <Textarea 
                    value={mysqlData} 
                    readOnly 
                    className="h-64 font-mono text-xs"
                    placeholder="Your MySQL export will appear here..."
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="schema" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download the complete MySQL schema file that matches your current Supabase structure.
                </p>
                
                <Button 
                  onClick={downloadSchema}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download MySQL Schema
                </Button>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Schema Features:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Compatible with MySQL 5.7+ and MariaDB 10.2+</li>
                    <li>All tables with proper indexes and foreign keys</li>
                    <li>Automatic triggers for timestamps and license generation</li>
                    <li>Default admin user and sample data</li>
                    <li>UTF8MB4 character set for full Unicode support</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Migration Instructions</h3>
                
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Step 1: Prepare MySQL Database</h4>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      <li>Create a new MySQL database with UTF8MB4 charset</li>
                      <li>Download and run the MySQL schema file</li>
                      <li>Verify all tables are created successfully</li>
                    </ol>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Step 2: Export and Import Data</h4>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      <li>Use the "Export Data to MySQL" button above</li>
                      <li>Save the generated SQL file</li>
                      <li>Run the SQL file in your MySQL database</li>
                      <li>Verify data integrity after import</li>
                    </ol>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Step 3: Update Configuration</h4>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      <li>Update database connection settings</li>
                      <li>Configure authentication system</li>
                      <li>Test all functionality</li>
                      <li>Update admin credentials</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important Notes:</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      <li>Change default admin password before going live</li>
                      <li>Update license keys and payment configurations</li>
                      <li>Test all features thoroughly after migration</li>
                      <li>Backup your data before starting migration</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseExporter;