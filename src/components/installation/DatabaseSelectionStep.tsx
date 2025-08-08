import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Cloud, Server, CheckCircle, ArrowRight } from 'lucide-react';
import type { InstallationData } from '@/pages/Installation';

interface DatabaseSelectionStepProps {
  data: InstallationData;
  onUpdate: (updates: Partial<InstallationData>) => void;
  onNext: () => void;
}

export const DatabaseSelectionStep = ({ data, onUpdate, onNext }: DatabaseSelectionStepProps) => {
  const selectDatabase = (type: 'supabase' | 'mysql') => {
    onUpdate({ databaseType: type });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Choose Your Database Platform</h3>
        <p className="text-muted-foreground">
          Select the database solution that best fits your hosting environment
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Supabase Option */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            data.databaseType === 'supabase' 
              ? 'ring-2 ring-primary border-primary' 
              : 'hover:border-primary/50'
          }`}
          onClick={() => selectDatabase('supabase')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Cloud className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Supabase
              <Badge variant="secondary">Recommended</Badge>
            </CardTitle>
            <CardDescription>
              Modern PostgreSQL backend with built-in features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Built-in authentication & authorization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Real-time features</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Automatic API generation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">File storage included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">No server maintenance</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-300">
                <strong>Best for:</strong> Modern hosting, quick setup, and full-featured applications
              </p>
            </div>
          </CardContent>
        </Card>

        {/* MySQL Option */}
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
            data.databaseType === 'mysql' 
              ? 'ring-2 ring-primary border-primary' 
              : 'hover:border-primary/50'
          }`}
          onClick={() => selectDatabase('mysql')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full w-fit">
              <Server className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              MySQL
              <Badge variant="outline">Traditional</Badge>
            </CardTitle>
            <CardDescription>
              Traditional database for shared hosting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Compatible with shared hosting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Familiar to most developers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Cost-effective hosting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Full control over data</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Export/import tools included</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <p className="text-xs text-orange-700 dark:text-orange-300">
                <strong>Best for:</strong> Traditional hosting, client projects, and CodeCanyon sales
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4">Quick Comparison</h4>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Feature</th>
                <th className="text-center p-3 font-medium">Supabase</th>
                <th className="text-center p-3 font-medium">MySQL</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3">Setup Complexity</td>
                <td className="text-center p-3">
                  <Badge variant="secondary">Easy</Badge>
                </td>
                <td className="text-center p-3">
                  <Badge variant="outline">Moderate</Badge>
                </td>
              </tr>
              <tr>
                <td className="p-3">Hosting Compatibility</td>
                <td className="text-center p-3">Modern</td>
                <td className="text-center p-3">Universal</td>
              </tr>
              <tr>
                <td className="p-3">Authentication</td>
                <td className="text-center p-3">Built-in</td>
                <td className="text-center p-3">Custom</td>
              </tr>
              <tr>
                <td className="p-3">File Storage</td>
                <td className="text-center p-3">Included</td>
                <td className="text-center p-3">Separate</td>
              </tr>
              <tr>
                <td className="p-3">Real-time Features</td>
                <td className="text-center p-3">Yes</td>
                <td className="text-center p-3">No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleNext}
          className="flex items-center gap-2"
          size="lg"
        >
          Continue Setup
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};