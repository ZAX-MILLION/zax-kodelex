import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cleanupDemoData, confirmAndCleanup } from '@/utils/seed/cleanupDemoData';
import { seedDemoLibrary } from '@/utils/seed/seedDemoLibrary';
import { 
  Database, 
  Trash2, 
  Sprout, 
  BookOpen, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

export const ContentSeederPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [operation, setOperation] = useState<string>('');
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setIsLoading(true);
    setOperation('Cleaning up demo data...');
    
    try {
      const success = await confirmAndCleanup();
      setLastResult({
        success,
        message: success ? 'Demo data cleaned successfully' : 'Cleanup cancelled or failed'
      });
      
      if (success) {
        toast({
          title: "Cleanup Complete",
          description: "All demo data has been removed successfully.",
        });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      setLastResult({
        success: false,
        message: 'Error during cleanup operation'
      });
      toast({
        title: "Cleanup Failed",
        description: "An error occurred during cleanup. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setOperation('');
    }
  };

  const handleSeedContent = async () => {
    setIsLoading(true);
    setOperation('Seeding demo library (20 series × 20 chapters)...');
    
    try {
      const result = await seedDemoLibrary();
      const summary = result.stats
        ? `${result.stats.series} series, ${result.stats.chapters} chapters (${result.stats.lockedChapters} locked)`
        : (result.success ? 'Success' : 'Failed');
      setLastResult({
        success: result.success,
        message: summary
      });
      
      if (result.success) {
        toast({
          title: "Content Seeded",
          description: `Demo library created: ${summary}`,
        });
      } else {
        toast({
          title: "Seeding Failed",
          description: "Failed to seed content. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Seeding error:', error);
      setLastResult({
        success: false,
        message: 'Error during content seeding'
      });
      toast({
        title: "Seeding Failed",
        description: "An error occurred during content seeding.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setOperation('');
    }
  };

  const handleCompleteReset = async () => {
    const confirmed = window.confirm(
      'This will delete ALL existing content and replace it with 20 demo series (400 chapters). This action cannot be undone. Continue?'
    );
    
    if (!confirmed) return;

    setIsLoading(true);
    setOperation('Performing complete reset...');
    
    try {
      // First cleanup
      const cleanupResult = await cleanupDemoData();
      if (!cleanupResult.success) {
        throw new Error('Cleanup phase failed');
      }

      // Then seed new content
      const seedResult = await seedDemoLibrary();
      setLastResult({
        success: seedResult.success,
        message: seedResult.success
          ? `Created ${seedResult.stats?.series ?? 20} series with ${seedResult.stats?.chapters ?? 400} chapters`
          : 'Failed'
      });
      
      if (seedResult.success) {
        toast({
          title: "Complete Reset Successful",
          description: `Demo library seeded: ${seedResult.stats?.series ?? 20} series, ${seedResult.stats?.chapters ?? 400} chapters.`,
        });
      } else {
        toast({
          title: "Reset Failed",
          description: "Failed during content seeding phase.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Complete reset error:', error);
      setLastResult({
        success: false,
        message: 'Error during complete reset operation'
      });
      toast({
        title: "Reset Failed",
        description: "An error occurred during the complete reset.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setOperation('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Content Management & Seeding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Display */}
          {isLoading && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                {operation}
              </AlertDescription>
            </Alert>
          )}

          {lastResult && !isLoading && (
            <Alert variant={lastResult.success ? "default" : "destructive"}>
              {lastResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                {lastResult.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Cleanup Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">1. Cleanup Demo Data</h3>
            <p className="text-sm text-muted-foreground">
              Remove all existing manga, novels, chapters, and related demo content.
            </p>
            <Button
              variant="destructive"
              onClick={handleCleanup}
              disabled={isLoading}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clean Up All Demo Data
            </Button>
          </div>

          <Separator />

          {/* Seeding Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">2. Seed Realistic Content</h3>
            <p className="text-sm text-muted-foreground">
              Add high-quality, realistic manga and novel content with proper chapters.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-semibold">20 Manga Series</div>
                <div className="text-xs text-muted-foreground">With 5-24 chapters each</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-secondary" />
                <div className="font-semibold">10 Novel Series</div>
                <div className="text-xs text-muted-foreground">With full text content</div>
              </div>
            </div>

            <Button
              onClick={handleSeedContent}
              disabled={isLoading}
              className="gap-2 w-full"
            >
              <Sprout className="h-4 w-4" />
              Seed Realistic Content
            </Button>
          </div>

          <Separator />

          {/* Complete Reset Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">3. Complete Reset</h3>
            <p className="text-sm text-muted-foreground">
              Perform both cleanup and seeding in one operation for a fresh start.
            </p>
            
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will permanently delete ALL existing content and replace it with new data.
              </AlertDescription>
            </Alert>

            <Button
              variant="destructive"
              onClick={handleCompleteReset}
              disabled={isLoading}
              className="gap-2 w-full"
            >
              <Database className="h-4 w-4" />
              Complete Reset (Cleanup + Seed)
            </Button>
          </div>

          {/* Features Info */}
          <Separator />
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">New Features Included</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Badge variant="outline" className="justify-start p-2">
                <BookOpen className="h-3 w-3 mr-2" />
                Linked Manga/Novel Series
              </Badge>
              <Badge variant="outline" className="justify-start p-2">
                <FileText className="h-3 w-3 mr-2" />
                Full Text Novel Content
              </Badge>
              <Badge variant="outline" className="justify-start p-2">
                <Database className="h-3 w-3 mr-2" />
                Realistic View Counts
              </Badge>
              <Badge variant="outline" className="justify-start p-2">
                <CheckCircle className="h-3 w-3 mr-2" />
                Proper Chapter Ordering
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};