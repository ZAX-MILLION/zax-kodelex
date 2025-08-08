import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileText, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface PricingRule {
  id: string;
  user_id?: string;
  user_email?: string;
  region?: string;
  coin_package: number;
  original_price: number;
  custom_price: number;
  discount_percent: number;
  is_active: boolean;
  created_at: string;
}

const PricingRulesImportExport = () => {
  const [importData, setImportData] = useState('');
  const [validationResults, setValidationResults] = useState<{ valid: number; invalid: number; errors: string[] }>({ valid: 0, invalid: 0, errors: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mock existing pricing rules
  const mockRules: PricingRule[] = [
    {
      id: '1',
      user_email: 'premium@example.com',
      coin_package: 100,
      original_price: 9.99,
      custom_price: 7.99,
      discount_percent: 20,
      is_active: true,
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      region: 'EU',
      coin_package: 500,
      original_price: 39.99,
      custom_price: 34.99,
      discount_percent: 12.5,
      is_active: true,
      created_at: '2024-01-10T00:00:00Z'
    },
    {
      id: '3',
      user_email: 'vip@example.com',
      coin_package: 1000,
      original_price: 79.99,
      custom_price: 59.99,
      discount_percent: 25,
      is_active: true,
      created_at: '2024-01-08T00:00:00Z'
    }
  ];

  const exportToJSON = () => {
    const exportData = {
      export_date: new Date().toISOString(),
      total_rules: mockRules.length,
      rules: mockRules
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pricing-rules-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `${mockRules.length} pricing rules exported to JSON`
    });
  };

  const exportToCSV = () => {
    const headers = ['ID', 'User Email', 'Region', 'Coin Package', 'Original Price', 'Custom Price', 'Discount %', 'Active', 'Created At'];
    const csvData = [
      headers.join(','),
      ...mockRules.map(rule => [
        rule.id,
        rule.user_email || '',
        rule.region || '',
        rule.coin_package,
        rule.original_price,
        rule.custom_price,
        rule.discount_percent,
        rule.is_active,
        rule.created_at
      ].join(','))
    ].join('\n');

    const dataBlob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pricing-rules-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: `${mockRules.length} pricing rules exported to CSV`
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      validateImportData(content, file.type);
    };
    reader.readAsText(file);
  };

  const validateImportData = (data: string, fileType: string) => {
    setIsProcessing(true);
    
    try {
      let parsedRules: any[] = [];
      const errors: string[] = [];

      if (fileType.includes('json') || data.trim().startsWith('{')) {
        const jsonData = JSON.parse(data);
        parsedRules = jsonData.rules || jsonData;
      } else {
        // CSV parsing
        const lines = data.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        parsedRules = lines.slice(1).map((line, index) => {
          const values = line.split(',');
          const rule: any = {};
          headers.forEach((header, i) => {
            rule[header.trim()] = values[i]?.trim() || '';
          });
          return rule;
        });
      }

      let valid = 0;
      let invalid = 0;

      parsedRules.forEach((rule, index) => {
        if (!rule.coin_package || !rule.original_price || !rule.custom_price) {
          invalid++;
          errors.push(`Row ${index + 1}: Missing required fields (coin_package, original_price, custom_price)`);
        } else if (isNaN(Number(rule.coin_package)) || isNaN(Number(rule.original_price)) || isNaN(Number(rule.custom_price))) {
          invalid++;
          errors.push(`Row ${index + 1}: Invalid number format in pricing fields`);
        } else {
          valid++;
        }
      });

      setValidationResults({ valid, invalid, errors: errors.slice(0, 10) }); // Show max 10 errors
    } catch (error) {
      setValidationResults({ 
        valid: 0, 
        invalid: 1, 
        errors: ['Invalid file format. Please check JSON structure or CSV format.'] 
      });
    }
    
    setIsProcessing(false);
  };

  const processImport = () => {
    if (validationResults.invalid > 0) {
      toast({
        title: "Import Failed",
        description: "Please fix validation errors before importing",
        variant: "destructive"
      });
      return;
    }

    // Simulate import process
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Import Complete",
        description: `${validationResults.valid} pricing rules imported successfully`
      });
      setImportData('');
      setValidationResults({ valid: 0, invalid: 0, errors: [] });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Pricing Rules Import/Export
          </CardTitle>
          <CardDescription>
            Import and export pricing rules in JSON or CSV format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export">Export Rules</TabsTrigger>
              <TabsTrigger value="import">Import Rules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="export" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <FileText className="h-12 w-12 mx-auto text-blue-600" />
                      <h3 className="font-semibold">Export as JSON</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete data with metadata and structure
                      </p>
                      <Button onClick={exportToJSON} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <FileText className="h-12 w-12 mx-auto text-green-600" />
                      <h3 className="font-semibold">Export as CSV</h3>
                      <p className="text-sm text-muted-foreground">
                        Spreadsheet-friendly format for Excel
                      </p>
                      <Button onClick={exportToCSV} variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Current Data Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Rules:</span>
                    <Badge className="ml-2">{mockRules.length}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active Rules:</span>
                    <Badge variant="outline" className="ml-2">
                      {mockRules.filter(r => r.is_active).length}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Discount:</span>
                    <Badge variant="secondary" className="ml-2">
                      {Math.round(mockRules.reduce((sum, r) => sum + r.discount_percent, 0) / mockRules.length)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="import" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Upload File (JSON or CSV)</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="import-data">Or Paste Data Directly</Label>
                  <Textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => {
                      setImportData(e.target.value);
                      if (e.target.value.trim()) {
                        validateImportData(e.target.value, 'text/json');
                      }
                    }}
                    placeholder="Paste JSON or CSV data here..."
                    rows={8}
                    className="mt-1 font-mono text-sm"
                  />
                </div>
                
                {(validationResults.valid > 0 || validationResults.invalid > 0) && (
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      {validationResults.valid > 0 && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            {validationResults.valid} valid rules found
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {validationResults.invalid > 0 && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {validationResults.invalid} invalid rules found
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    
                    {validationResults.errors.length > 0 && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">Validation Errors:</h4>
                        <ul className="text-sm text-red-600 space-y-1">
                          {validationResults.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={processImport}
                    disabled={!importData.trim() || validationResults.invalid > 0 || isProcessing}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Import Rules'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImportData('');
                      setValidationResults({ valid: 0, invalid: 0, errors: [] });
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingRulesImportExport;