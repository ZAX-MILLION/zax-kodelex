import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { runCuratedReset10x10 } from '@/utils/seed/curatedReset10x10';
import { Database, RefreshCw, CheckCircle, AlertTriangle, BookOpen, FileText, Lock } from 'lucide-react';

export const CuratedReset10x10: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  const handleRun = async () => {
    if (!confirm('⚠️ This will DELETE ALL existing data and create 5 manga + 5 novels with 10 chapters each. Continue?')) return;
    setIsRunning(true);
    try {
      const result = await runCuratedReset10x10();
      if (result.success) {
        setStats(result.stats);
        toast({
          title: 'Curated Reset Complete',
          description: `Created ${result.stats?.seriesCount} series and ${result.stats?.chapterCount} chapters (last 2 locked).`,
        });
        // Small delay then reload to reflect data
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast({ title: 'Reset Failed', description: result.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Unexpected error while resetting', variant: 'destructive' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Curated Reset: 5 Manga + 5 Novels (10 ch each)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2"><strong>⚠️ Warning:</strong> This action wipes all existing content.</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Creates exactly <strong>5 manga</strong> and <strong>5 novels</strong></li>
            <li>Each series has <strong>10 chapters</strong></li>
            <li>Chapters <strong>9 and 10</strong> are locked with pricing</li>
            <li>All pages use reliable image URLs for seamless reading</li>
          </ul>
        </div>

        <Button onClick={handleRun} disabled={isRunning} className="w-full" variant="destructive">
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Resetting...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Reset & Seed Curated Content
            </>
          )}
        </Button>

        {stats && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Series:</span>
              <Badge variant="outline">{stats.seriesCount}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-secondary" />
              <span>Chapters:</span>
              <Badge variant="outline">{stats.chapterCount}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" />
              <span>Locked:</span>
              <Badge variant="outline">{stats.lockedCount}</Badge>
            </div>
            <div className="col-span-2 text-xs text-muted-foreground">Last two chapters of each series are locked (10 coins).</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
