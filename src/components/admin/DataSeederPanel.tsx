import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';
import { executeDataReset } from '@/utils/dbSeederTool';
import { useToast } from '@/hooks/use-toast';

export const DataSeederPanel = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingProgress, setSeedingProgress] = useState(0);
  const [lastSeedTime, setLastSeedTime] = useState<string | null>(
    localStorage.getItem('last-seed-time')
  );
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    try {
      setIsSeeding(true);
      setSeedingProgress(10);
      
      toast({
        title: "Database Seeding Started",
        description: "Creating production-quality data...",
      });

      setSeedingProgress(30);
      const success = await executeDataReset();
      setSeedingProgress(80);

      if (success) {
        setSeedingProgress(100);
        const now = new Date().toISOString();
        setLastSeedTime(now);
        localStorage.setItem('last-seed-time', now);
        
        toast({
          title: "Database Seeded Successfully",
          description: "30 series with thousands of chapters created",
        });

        // Reload the page to show new data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Seeding process failed');
      }
    } catch (error) {
      console.error('Seeding error:', error);
      toast({
        title: "Seeding Failed",
        description: "Check console for error details",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
      setSeedingProgress(0);
    }
  };

  const handleForceReset = () => {
    localStorage.setItem('force-db-reset', 'true');
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Seeder
        </CardTitle>
        <CardDescription>
          Populate the database with production-quality manga and novel data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Database Status</span>
            <Badge variant={lastSeedTime ? "default" : "secondary"}>
              {lastSeedTime ? "Populated" : "Empty"}
            </Badge>
          </div>
          
          {lastSeedTime && (
            <p className="text-xs text-muted-foreground">
              Last seeded: {new Date(lastSeedTime).toLocaleString()}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {isSeeding && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Seeding Progress</span>
              <span className="text-sm">{seedingProgress}%</span>
            </div>
            <Progress value={seedingProgress} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={handleSeedDatabase} 
            disabled={isSeeding}
            className="w-full"
          >
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Seeding Database...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Seed Database
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={handleForceReset}
            disabled={isSeeding}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Force Reset & Reload
          </Button>
        </div>

        {/* Info Section */}
        <div className="rounded-lg bg-muted p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">What this creates:</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 20 manga series with 20-100 chapters each</li>
            <li>• 10 novel series with 20-100 chapters each</li>
            <li>• Realistic view counts, ratings, and pricing</li>
            <li>• Working image URLs from picsum.photos</li>
            <li>• Monetization data (coin costs, premium content)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};