import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Database, Settings, Eye, RefreshCw } from 'lucide-react';
import { useMultiSeriesMode } from '@/hooks/useMultiSeriesMode';
import { seedMultiSeriesData, validateMultiSeriesData } from '@/utils/seedMultiSeriesData';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const MultiSeriesControls = () => {
  const { config, updateConfig, toggleMultiSeriesMode, setContentType, resetToDefaults } = useMultiSeriesMode();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const result = await seedMultiSeriesData();
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Multi-series data seeded successfully!",
        });
      } else {
        throw new Error('Seeding failed');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Error",
        description: "Failed to seed multi-series data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleValidateData = async () => {
    setIsValidating(true);
    try {
      const result = await validateMultiSeriesData();
      if (result.success) {
        setValidationResults(result.validation);
        toast({
          title: "Validation Complete",
          description: `Found ${result.validation.seriesCount} series and ${result.validation.chapterCount} chapters`,
        });
      } else {
        throw new Error('Validation failed');
      }
    } catch (error) {
      console.error('Error validating data:', error);
      toast({
        title: "Error",
        description: "Failed to validate multi-series data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Multi-Series Configuration
          </CardTitle>
          <CardDescription>
            Configure how your platform handles multiple series content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="multi-series-enabled">Enable Multi-Series Mode</Label>
              <p className="text-sm text-muted-foreground">
                Allow multiple manga/novel series on your platform
              </p>
            </div>
            <Switch
              id="multi-series-enabled"
              checked={config.enabled}
              onCheckedChange={toggleMultiSeriesMode}
            />
          </div>

          {config.enabled && (
            <>
              <div className="space-y-2">
                <Label>Default Content Type</Label>
                <Select 
                  value={config.defaultContentType} 
                  onValueChange={(value: 'manga' | 'novel' | 'both') => setContentType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both Manga & Novels</SelectItem>
                    <SelectItem value="manga">Manga Only</SelectItem>
                    <SelectItem value="novel">Novels Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-content-filter">Show Content Type Filter</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to filter by manga/novel type
                  </p>
                </div>
                <Switch
                  id="show-content-filter"
                  checked={config.showContentTypeFilter}
                  onCheckedChange={(checked) => updateConfig({ showContentTypeFilter: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-single-mode">Allow Single-Series Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Show option to switch to single-series display
                  </p>
                </div>
                <Switch
                  id="allow-single-mode"
                  checked={config.allowSingleSeriesMode}
                  onCheckedChange={(checked) => updateConfig({ allowSingleSeriesMode: checked })}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Test Data Management
          </CardTitle>
          <CardDescription>
            Manage test series data for development and testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleSeedData}
              disabled={isSeeding}
              className="gap-2"
            >
              {isSeeding ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {isSeeding ? 'Seeding...' : 'Seed 20 Test Series'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleValidateData}
              disabled={isValidating}
              className="gap-2"
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {isValidating ? 'Validating...' : 'Validate Data'}
            </Button>
          </div>

          {/* Validation Results */}
          {validationResults && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <h4 className="font-medium">Validation Results</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold">{validationResults.seriesCount}</div>
                  <div className="text-xs text-muted-foreground">Total Series</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{validationResults.chapterCount}</div>
                  <div className="text-xs text-muted-foreground">Total Chapters</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{validationResults.seriesByStatus.ongoing}</div>
                  <div className="text-xs text-muted-foreground">Ongoing</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{validationResults.seriesByStatus.completed}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
              
              {validationResults.genreDistribution && (
                <div>
                  <div className="text-sm font-medium mb-2">Genres:</div>
                  <div className="flex flex-wrap gap-1">
                     {Object.entries(validationResults.genreDistribution).map(([genre, count]) => (
                       <Badge key={genre} variant="secondary" className="text-xs">
                         {genre} ({String(count)})
                       </Badge>
                     ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Multi-Series Mode:</span>
              <Badge variant={config.enabled ? 'default' : 'secondary'}>
                {config.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Content Type:</span>
              <Badge variant="outline">
                {config.defaultContentType.charAt(0).toUpperCase() + config.defaultContentType.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Content Filter:</span>
              <Badge variant={config.showContentTypeFilter ? 'default' : 'secondary'}>
                {config.showContentTypeFilter ? 'Shown' : 'Hidden'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};