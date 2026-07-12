import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { seedChapterData } from '@/utils/seed/seedChapterData';
import { Database, Loader2, Plus, Trash2 } from 'lucide-react';

const ChapterDataSeeder = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSeedData = async () => {
    setLoading(true);
    try {
      await seedChapterData();
      toast({
        title: "Success",
        description: "Chapter data has been seeded successfully!",
      });
    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Error",
        description: "Failed to seed chapter data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>Chapter Data Seeder</CardTitle>
        </div>
        <CardDescription>
          Generate test chapter data with mixed lock states for development and testing
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">Free</div>
            <div className="text-sm text-muted-foreground">Chapters 1, 2, 4, 5, 7, 8, 10, 11</div>
          </div>
          <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">Locked</div>
            <div className="text-sm text-muted-foreground">Chapters 3, 6, 9, 12</div>
          </div>
          <div className="text-center p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">5-25</div>
            <div className="text-sm text-muted-foreground">Coins to unlock</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">What this seeder creates:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 12 chapters per series with varied release dates</li>
            <li>• Mix of free and locked chapters (every 3rd chapter locked)</li>
            <li>• Random coin costs between 5-25 for locked chapters</li>
            <li>• Proper chapter numbering and titles</li>
            <li>• Thumbnail images and page data</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSeedData}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Seeding Data...' : 'Seed Chapter Data'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
          <strong>Note:</strong> This will replace existing chapter data. Make sure to backup any important data before running.
        </div>
      </CardContent>
    </Card>
  );
};

export default ChapterDataSeeder;