import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { runImageFix } from '@/utils/fixSeriesImages';
import { ImageIcon, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export const ImageFixButton: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFixImages = async () => {
    setIsFixing(true);
    try {
      const result = await runImageFix();
      setLastResult(result);
      
      if (result) {
        toast({
          title: "Images Fixed Successfully",
          description: `Updated ${result.updated} out of ${result.total} series cover images.`,
        });
      } else {
        toast({
          title: "Fix Failed",
          description: "Could not fix series images. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Image fix error:', error);
      toast({
        title: "Error",
        description: "Failed to fix series images. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Fix Series Cover Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>This tool will:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Convert /src/assets/ paths to proper public paths</li>
            <li>Add fallback images for missing covers</li>
            <li>Fix relative path issues</li>
            <li>Replace placeholder.svg with real images</li>
          </ul>
        </div>

        <Button
          onClick={handleFixImages}
          disabled={isFixing}
          className="w-full"
        >
          {isFixing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Fixing Images...
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4 mr-2" />
              Fix All Cover Images
            </>
          )}
        </Button>

        {lastResult && (
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              {lastResult.updated > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <span className="font-medium">Last Fix Result</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Series:</span>
                <Badge variant="outline" className="ml-2">
                  {lastResult.total}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>
                <Badge 
                  variant={lastResult.updated > 0 ? "default" : "secondary"} 
                  className="ml-2"
                >
                  {lastResult.updated}
                </Badge>
              </div>
            </div>
            {lastResult.changes && lastResult.changes.length > 0 && (
              <details className="mt-2">
                <summary className="text-sm font-medium cursor-pointer hover:text-primary">
                  View Changes ({lastResult.changes.length})
                </summary>
                <div className="mt-2 space-y-1 text-xs max-h-32 overflow-y-auto">
                  {lastResult.changes.slice(0, 10).map((change: any, index: number) => (
                    <div key={index} className="p-2 bg-muted/50 rounded text-xs">
                      <div className="font-mono text-red-600">- {change.oldUrl}</div>
                      <div className="font-mono text-green-600">+ {change.newUrl}</div>
                    </div>
                  ))}
                  {lastResult.changes.length > 10 && (
                    <div className="text-center text-muted-foreground">
                      ... and {lastResult.changes.length - 10} more changes
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};