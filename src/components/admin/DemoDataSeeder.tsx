import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { seedEnhancedDemoData } from '@/utils/enhancedSeedData';
import { Database, Sparkles, CheckCircle2 } from 'lucide-react';

export const DemoDataSeeder: React.FC = () => {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const result = await seedEnhancedDemoData();
      if (result.success) {
        setIsSeeded(true);
        toast({
          title: "Demo Data Created",
          description: `Successfully created ${result.stats?.series || 0} series with ${result.stats?.chapters || 0} chapters`,
        });
      } else {
        throw new Error('Seeding failed');
      }
    } catch (error) {
      toast({
        title: "Seeding Failed",
        description: "Failed to create demo data",
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
          Enhanced Demo Data
        </CardTitle>
        <CardDescription>
          Create comprehensive demo content with 15+ series and chapters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleSeedData} 
            disabled={isSeeding || isSeeded}
            className="flex items-center gap-2"
          >
            {isSeeding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Demo Data...
              </>
            ) : isSeeded ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Demo Data Created
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Create Demo Content
              </>
            )}
          </Button>
          
          {isSeeded && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Ready for Distribution
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>This will create:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>15 manga series with rich descriptions</li>
            <li>100+ chapters with realistic content</li>
            <li>Locked chapters with coin pricing</li>
            <li>Sample comments and ratings</li>
            <li>Trending data and view counts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};