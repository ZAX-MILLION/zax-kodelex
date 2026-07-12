import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  bundleSize: number;
  memoryUsage: {
    used: number;
    total: number;
  };
}

interface PerformanceMonitorResult {
  metrics: PerformanceMetrics | null;
  score: 'good' | 'needs-improvement' | 'poor' | null;
  recommendations: string[];
}

export const usePerformanceMonitor = (): PerformanceMonitorResult => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [score, setScore] = useState<'good' | 'needs-improvement' | 'poor' | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const collectMetrics = async () => {
      try {
        // Basic performance metrics
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

        // Core Web Vitals
        let fcp = 0;
        let lcp = 0;
        let cls = 0;
        const fid = 0;

        // First Contentful Paint
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
          fcp = fcpEntry.startTime;
        }

        // Largest Contentful Paint
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcp = lastEntry.startTime;
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP not supported');
        }

        // Cumulative Layout Shift
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
              }
            }
          });
          observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('CLS not supported');
        }

        // Memory usage (if available)
        let memoryUsage = { used: 0, total: 0 };
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          memoryUsage = {
            used: memory.usedJSHeapSize / (1024 * 1024), // MB
            total: memory.totalJSHeapSize / (1024 * 1024) // MB
          };
        }

        // Bundle size estimation
        const bundleSize = navigation.transferSize / (1024 * 1024); // MB

        const performanceMetrics: PerformanceMetrics = {
          loadTime,
          firstContentfulPaint: fcp,
          largestContentfulPaint: lcp,
          cumulativeLayoutShift: cls,
          firstInputDelay: fid,
          bundleSize,
          memoryUsage
        };

        setMetrics(performanceMetrics);

        // Calculate score and recommendations
        const { score: calculatedScore, recommendations: recs } = calculateScore(performanceMetrics);
        setScore(calculatedScore);
        setRecommendations(recs);

      } catch (error) {
        console.error('Error collecting performance metrics:', error);
      }
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      setTimeout(collectMetrics, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(collectMetrics, 1000);
      });
    }
  }, []);

  return { metrics, score, recommendations };
};

const calculateScore = (metrics: PerformanceMetrics): { score: 'good' | 'needs-improvement' | 'poor'; recommendations: string[] } => {
  const recommendations: string[] = [];
  let scorePoints = 0;
  let totalChecks = 0;

  // FCP scoring (good: <1.8s, needs improvement: <3s, poor: >=3s)
  totalChecks++;
  if (metrics.firstContentfulPaint < 1800) {
    scorePoints++;
  } else if (metrics.firstContentfulPaint >= 3000) {
    recommendations.push('Improve First Contentful Paint by optimizing critical resources');
  }

  // LCP scoring (good: <2.5s, needs improvement: <4s, poor: >=4s)
  if (metrics.largestContentfulPaint > 0) {
    totalChecks++;
    if (metrics.largestContentfulPaint < 2500) {
      scorePoints++;
    } else if (metrics.largestContentfulPaint >= 4000) {
      recommendations.push('Optimize Largest Contentful Paint by compressing images and reducing server response times');
    }
  }

  // CLS scoring (good: <0.1, needs improvement: <0.25, poor: >=0.25)
  if (metrics.cumulativeLayoutShift > 0) {
    totalChecks++;
    if (metrics.cumulativeLayoutShift < 0.1) {
      scorePoints++;
    } else if (metrics.cumulativeLayoutShift >= 0.25) {
      recommendations.push('Reduce Cumulative Layout Shift by setting dimensions for images and ads');
    }
  }

  // Bundle size scoring (good: <1MB, needs improvement: <3MB, poor: >=3MB)
  totalChecks++;
  if (metrics.bundleSize < 1) {
    scorePoints++;
  } else if (metrics.bundleSize >= 3) {
    recommendations.push('Reduce bundle size by implementing code splitting and removing unused dependencies');
  }

  // Memory usage scoring
  if (metrics.memoryUsage.total > 0) {
    totalChecks++;
    const memoryUsagePercent = (metrics.memoryUsage.used / metrics.memoryUsage.total) * 100;
    if (memoryUsagePercent < 70) {
      scorePoints++;
    } else {
      recommendations.push('Optimize memory usage by implementing proper cleanup and avoiding memory leaks');
    }
  }

  // Load time scoring (good: <3s, needs improvement: <5s, poor: >=5s)
  totalChecks++;
  if (metrics.loadTime < 3000) {
    scorePoints++;
  } else if (metrics.loadTime >= 5000) {
    recommendations.push('Improve load time by optimizing assets and implementing caching strategies');
  }

  const scorePercentage = (scorePoints / totalChecks) * 100;

  let score: 'good' | 'needs-improvement' | 'poor';
  if (scorePercentage >= 80) {
    score = 'good';
  } else if (scorePercentage >= 50) {
    score = 'needs-improvement';
  } else {
    score = 'poor';
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('Performance is good! Consider implementing advanced optimizations like service workers for offline support.');
  }

  return { score, recommendations };
};