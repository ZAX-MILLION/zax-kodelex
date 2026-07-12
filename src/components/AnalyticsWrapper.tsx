import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
}

export const AnalyticsWrapper: React.FC<AnalyticsWrapperProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const analytics = useAnalyticsTracking();

  // Make analytics functions globally available
  useEffect(() => {
    (window as any).trackError = analytics.trackError;
    (window as any).trackEvent = analytics.trackEvent;
    (window as any).trackChapterRead = analytics.trackChapterRead;
    (window as any).trackUpload = analytics.trackUpload;
    (window as any).trackSubscription = analytics.trackSubscription;
  }, [analytics]);

  // Track user authentication events
  useEffect(() => {
    if (user) {
      analytics.trackEvent({
        activity_type: 'user_session',
        page_url: location.pathname,
        metadata: {
          session_start: new Date().toISOString(),
          user_role: user.user_metadata?.role || 'user'
        }
      });
    }
  }, [user, analytics, location.pathname]);

  // Track scroll depth with enhanced analytics
  useEffect(() => {
    let maxScroll = 0;
    let scrollTimer: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const scrollPercentage = scrollHeight > 0 ? Math.round((scrolled / scrollHeight) * 100) : 0;
      
      if (scrollPercentage > maxScroll) {
        maxScroll = scrollPercentage;
        
        // Track significant scroll milestones
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          if (maxScroll > 0 && maxScroll % 25 === 0) {
            analytics.trackEvent({
              activity_type: 'scroll_milestone',
              page_url: location.pathname,
              metadata: {
                scroll_percentage: maxScroll,
                page_height: document.documentElement.scrollHeight,
                viewport_height: window.innerHeight
              }
            });
          }
        }, 1000);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [location.pathname, analytics]);

  // Enhanced time tracking
  useEffect(() => {
    const startTime = Date.now();
    let isVisible = true;
    
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      
      if (timeSpent > 5 && isVisible) {
        analytics.trackEvent({
          activity_type: 'page_engagement',
          page_url: location.pathname,
          duration_seconds: timeSpent,
          metadata: {
            engagement_score: Math.min(timeSpent / 60, 10), // 0-10 scale
            page_end_timestamp: new Date().toISOString(),
            was_visible: isVisible
          }
        });
      }
    };
  }, [location.pathname, analytics]);

  return <>{children}</>;
};