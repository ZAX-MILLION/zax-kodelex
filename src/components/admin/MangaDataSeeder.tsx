import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { seedComprehensiveMangaData } from '@/utils/seedComprehensiveMangaData';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Database, Trash2, BookOpen, Eye } from 'lucide-react';

export const MangaDataSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [stats, setStats] = useState<{
    seriesCount: number;
    chapterCount: number;
    viewsCount: number;
  } | null>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const result = await seedComprehensiveMangaData();
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message || "Manga data seeded successfully",
        });
        await fetchStats();
      } else {
        throw new Error(result.error?.message || 'Failed to seed data');
      }
    } catch (error) {
      console.error('Seeding error:', error);
      toast({
        title: "Error",
        description: "Failed to seed manga data",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear ALL manga data? This cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      // Clear in reverse order due to foreign key constraints
      await supabase.from('series_views').delete().neq('id', '');
      await supabase.from('chapters').delete().neq('id', '');
      await supabase.from('manga_meta').delete().neq('id', '');

      toast({
        title: "Success!",
        description: "All manga data cleared successfully",
      });
      await fetchStats();
    } catch (error) {
      console.error('Clearing error:', error);
      toast({
        title: "Error",
        description: "Failed to clear manga data",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [seriesResult, chaptersResult, viewsResult] = await Promise.all([
        supabase.from('manga_meta').select('id', { count: 'exact' }),
        supabase.from('chapters').select('id', { count: 'exact' }),
        supabase.from('series_views').select('id', { count: 'exact' })
      ]);

      setStats({
        seriesCount: seriesResult.count || 0,
        chapterCount: chaptersResult.count || 0,
        viewsCount: viewsResult.count || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Fetch stats on component mount
  useState(() => {
    fetchStats();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Manga Test Data Seeder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.seriesCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <BookOpen className="h-3 w-3" />
                Series
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{stats.chapterCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <BookOpen className="h-3 w-3" />
                Chapters
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{stats.viewsCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Eye className="h-3 w-3" />
                Views
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSeedData}
            disabled={isSeeding || isClearing}
            className="flex-1"
            size="lg"
          >
            {isSeeding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Seeding Data...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Seed Test Data
              </>
            )}
          </Button>

          <Button
            onClick={handleClearData}
            disabled={isSeeding || isClearing}
            variant="destructive"
            className="flex-1"
            size="lg"
          >
            {isClearing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </>
            )}
          </Button>
        </div>

        {/* Description */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Seed Data:</strong> Creates 6 manga series with comprehensive metadata, multiple chapters per series (both image and text-based), and sample view data for trending calculations.</p>
          <p><strong>Features:</strong> Real cover images, detailed descriptions, chapter navigation, reading progress, and both manga-style (image) and light novel-style (text) content.</p>
          
          <div className="flex flex-wrap gap-1 mt-3">
            <Badge variant="outline">6 Series</Badge>
            <Badge variant="outline">50+ Chapters</Badge>
            <Badge variant="outline">Mixed Content Types</Badge>
            <Badge variant="outline">Sample Views</Badge>
            <Badge variant="outline">Complete Metadata</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};