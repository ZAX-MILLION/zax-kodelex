import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { 
  Gauge, 
  Clock, 
  Zap, 
  MemoryStick, 
  HardDrive, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

const PerformancePanel: React.FC = () => {
  const { metrics, score, recommendations } = usePerformanceMonitor();

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatSize = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1024)}KB`;
    return `${mb.toFixed(2)}MB`;
  };

  const getScoreIcon = (score: string | null) => {
    switch (score) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'poor':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Gauge className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getScoreBadgeVariant = (score: string | null) => {
    switch (score) {
      case 'good':
        return 'default';
      case 'needs-improvement':
        return 'secondary';
      case 'poor':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Gauge className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Collecting performance metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Performance Score
            </div>
            <div className="flex items-center gap-2">
              {getScoreIcon(score)}
              <Badge variant={getScoreBadgeVariant(score)}>
                {score?.replace('-', ' ').toUpperCase() || 'ANALYZING'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.map((rec, index) => (
            <Alert key={index} className="mb-3 last:mb-0">
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>{rec}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              First Contentful Paint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatTime(metrics.firstContentfulPaint)}
            </div>
            <Progress 
              value={Math.min((metrics.firstContentfulPaint / 3000) * 100, 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Good: &lt;1.8s, Poor: ≥3s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Largest Contentful Paint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {metrics.largestContentfulPaint > 0 
                ? formatTime(metrics.largestContentfulPaint)
                : 'N/A'
              }
            </div>
            {metrics.largestContentfulPaint > 0 && (
              <>
                <Progress 
                  value={Math.min((metrics.largestContentfulPaint / 4000) * 100, 100)} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Good: &lt;2.5s, Poor: ≥4s
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Bundle Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatSize(metrics.bundleSize)}
            </div>
            <Progress 
              value={Math.min((metrics.bundleSize / 3) * 100, 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Good: &lt;1MB, Poor: ≥3MB
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Load Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatTime(metrics.loadTime)}
            </div>
            <Progress 
              value={Math.min((metrics.loadTime / 5000) * 100, 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Target: &lt;3s for good user experience
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MemoryStick className="h-4 w-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.memoryUsage.total > 0 ? (
              <>
                <div className="text-2xl font-bold mb-2">
                  {formatSize(metrics.memoryUsage.used)}
                </div>
                <Progress 
                  value={(metrics.memoryUsage.used / metrics.memoryUsage.total) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formatSize(metrics.memoryUsage.used)} / {formatSize(metrics.memoryUsage.total)}
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">
                Memory info not available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cumulative Layout Shift */}
      {metrics.cumulativeLayoutShift > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cumulative Layout Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {metrics.cumulativeLayoutShift.toFixed(3)}
            </div>
            <Progress 
              value={Math.min((metrics.cumulativeLayoutShift / 0.25) * 100, 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Good: &lt;0.1, Poor: ≥0.25
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformancePanel;