import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { runComprehensiveProductionReset } from '@/utils/comprehensiveProductionReset';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  BookOpen,
  FileText,
  Eye,
  Image,
  Trash2
} from 'lucide-react';

export const ComprehensiveDataResetButton: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();

  const handleReset = async () => {
    if (!confirm('⚠️ WARNING: This will DELETE ALL existing manga/novel data and replace it with fresh content. This action CANNOT be undone. Continue?')) {
      return;
    }

    setIsRunning(true);
    try {
      const result = await runComprehensiveProductionReset();
      setLastResult(result);
      
      if (result?.success) {
        toast({
          title: "Database Reset Complete!",
          description: `Created ${result.stats.seriesCount} series (${result.stats.mangaCount} manga + ${result.stats.novelCount} novels) with ${result.stats.chapterCount} chapters.`,
        });
      } else {
        toast({
          title: "Reset Failed",
          description: "Could not complete database reset. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Database reset error:', error);
      toast({
        title: "Error",
        description: "Failed to run database reset. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Comprehensive Database Reset
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2"><strong>⚠️ WARNING:</strong> This will completely wipe and recreate ALL manga/novel data!</p>
          <p className="mb-3">This comprehensive reset will:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Delete ALL existing data:</strong> series, chapters, pages, views, ratings</li>
            <li><strong>Create 20 manga series</strong> with 20-100 chapters each</li>
            <li><strong>Create 10 novel series</strong> with 20-100 chapters each</li>
            <li><strong>Generate realistic content:</strong> proper descriptions, genres, ratings</li>
            <li><strong>Use consistent images:</strong> picsum.photos with deterministic seeds</li>
            <li><strong>Mixed chapter pricing:</strong> 70% free, 30% locked (5-25 coins)</li>
            <li><strong>Realistic release dates:</strong> spread over time with 1-3 day intervals</li>
            <li><strong>View data generation:</strong> for trending calculations</li>
            <li><strong>Chapter pages:</strong> 10-20 images for manga, text content for novels</li>
          </ul>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              This action is IRREVERSIBLE and will destroy all current content
            </span>
          </div>
        </div>

        <Button
          onClick={handleReset}
          disabled={isRunning}
          className="w-full"
          variant="destructive"
          size="lg"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Resetting Database...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              RESET & REPOPULATE DATABASE
            </>
          )}
        </Button>

        {lastResult && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">
                {lastResult.success ? 'Database Reset Successful' : 'Reset Failed'}
              </span>
            </div>
            
            {lastResult.success && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Manga:</span>
                  <Badge variant="outline">{lastResult.stats.mangaCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Novels:</span>
                  <Badge variant="outline">{lastResult.stats.novelCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-500" />
                  <span className="text-muted-foreground">Chapters:</span>
                  <Badge variant="outline">{lastResult.stats.chapterCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">Views:</span>
                  <Badge variant="outline">{lastResult.stats.viewCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-indigo-500" />
                  <span className="text-muted-foreground">Pages:</span>
                  <Badge variant="outline">{lastResult.stats.pageCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-cyan-500" />
                  <span className="text-muted-foreground">Total Series:</span>
                  <Badge variant="outline">{lastResult.stats.seriesCount}</Badge>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <Image className="h-3 w-3" />
                <span className="font-medium">Image Sources & Features:</span>
              </div>
              <ul className="list-disc list-inside space-y-1">
                <li>All cover images: picsum.photos with consistent seeds (manga-1, novel-1, etc.)</li>
                <li>Chapter pages: 800x1200 images for manga, text content for novels</li>
                <li>Thumbnails: 300x450 and 200x300 variants for responsive display</li>
                <li>Fallback system ensures all images load correctly</li>
                <li>Realistic release dates spread over time for each series</li>
                <li>Mixed chapter pricing: 70% free, 30% premium (5-25 coins)</li>
                <li>Generated view data for trending calculations</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};