import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { runPhase6Cleanup } from '@/utils/phase6Cleanup';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  BookOpen,
  FileText,
  Eye,
  Image
} from 'lucide-react';

export const Phase6CleanupButton: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();

  const handleCleanup = async () => {
    setIsRunning(true);
    try {
      const result = await runPhase6Cleanup();
      setLastResult(result);
      
      if (result?.success) {
        toast({
          title: "Phase 6 Cleanup Complete!",
          description: `Created ${result.mangaCount} manga, ${result.novelCount} novels, and ${result.chapterCount} chapters.`,
        });
      } else {
        toast({
          title: "Cleanup Failed",
          description: "Could not complete Phase 6 cleanup. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Phase 6 cleanup error:', error);
      toast({
        title: "Error",
        description: "Failed to run Phase 6 cleanup. Check console for details.",
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
          Phase 6: Database Cleanup & Seeding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2"><strong>⚠️ Warning:</strong> This will wipe ALL existing data!</p>
          <p>This tool will:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Delete all current series, chapters, and views</li>
            <li>Create 20 manga series with 5 chapters each</li>
            <li>Create 10 novel series with 5 chapters each</li>
            <li>Generate realistic content and working images</li>
            <li>Add view data for trending calculations</li>
          </ul>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
              This action cannot be undone
            </span>
          </div>
        </div>

        <Button
          onClick={handleCleanup}
          disabled={isRunning}
          className="w-full"
          variant="destructive"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Cleanup...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Run Phase 6 Cleanup
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
                {lastResult.success ? 'Cleanup Successful' : 'Cleanup Failed'}
              </span>
            </div>
            
            {lastResult.success && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Manga:</span>
                  <Badge variant="outline">{lastResult.mangaCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Novels:</span>
                  <Badge variant="outline">{lastResult.novelCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-500" />
                  <span className="text-muted-foreground">Chapters:</span>
                  <Badge variant="outline">{lastResult.chapterCount}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">Views:</span>
                  <Badge variant="outline">{lastResult.viewCount}</Badge>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <Image className="h-3 w-3" />
                <span className="font-medium">Image Sources:</span>
              </div>
              <ul className="list-disc list-inside space-y-1">
                <li>Cover images: picsum.photos with deterministic seeds</li>
                <li>Chapter pages: picsum.photos with unique identifiers</li>
                <li>All images are guaranteed to load correctly</li>
                <li>Fallback system in place for any failures</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};