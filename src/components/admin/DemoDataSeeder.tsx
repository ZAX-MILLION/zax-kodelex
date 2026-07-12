import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { seedDemoLibrary } from '@/utils/seed/seedDemoLibrary';
import { Database, Sparkles, CheckCircle2, Lock } from 'lucide-react';

export const DemoDataSeeder: React.FC = () => {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDemoLibrary();
      if (result.success && result.stats) {
        setIsSeeded(true);
        const { series, chapters, lockedChapters, lockDistribution } = result.stats;
        toast({
          title: "Demo Library Created",
          description: `${series} series, ${chapters} chapters (${lockedChapters} locked). Locks: 1×${lockDistribution[1]}, 2×${lockDistribution[2]}, 3×${lockDistribution[3]}, 5×${lockDistribution[5]}`,
        });
      } else {
        throw new Error('Seeding failed');
      }
    } catch (error) {
      toast({
        title: "Seeding Failed",
        description: "Failed to create demo library. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Demo Library Seeder
        </CardTitle>
        <CardDescription>
          Create 20 manga, manhwa, manhua, and novel series — 20 chapters each with varied premium locks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">20</div>
            <div className="text-xs text-muted-foreground">Series</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">400</div>
            <div className="text-xs text-muted-foreground">Chapters</div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 flex items-center justify-center gap-1">
              <Lock className="h-4 w-4" /> Mixed
            </div>
            <div className="text-xs text-muted-foreground">Latest 1/2/3/5 locked</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">4</div>
            <div className="text-xs text-muted-foreground">Formats</div>
          </div>
        </div>

        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 8 manga, 5 manhwa, 4 manhua, 4 novels</li>
          <li>• 20 chapters per series with weekly release dates</li>
          <li>• 5 series lock latest 1, 5 lock latest 2, 5 lock latest 3, 5 lock latest 5</li>
          <li>• Coin costs (8–30) on locked chapters via chapter_prices</li>
        </ul>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="flex items-center gap-2"
          >
            {isSeeding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Seeding Library...
              </>
            ) : isSeeded ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Library Seeded — Run Again to Reset
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Seed Demo Library
              </>
            )}
          </Button>

          {isSeeded && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Ready
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
