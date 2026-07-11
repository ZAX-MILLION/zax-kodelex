import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface AnalyticsEvent {
  activity_type: string;
  content_id?: string;
  content_type?: string;
  page_url?: string;
  metadata?: Record<string, any>;
  duration_seconds?: number;
}

export const useAnalyticsTracking = () => {
  const { user } = useAuth();
  const location = useLocation();
  const sessionIdRef = useRef<string>(generateSessionId());
  const pageStartTimeRef = useRef<number>(Date.now());
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Generate a unique session ID
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if user has opted out of analytics
  const checkOptOut = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data } = await supabase.rpc('user_analytics_opt_out');
      return data || false;
    } catch (error) {
      console.warn('Failed to check analytics opt-out status:', error);
      return false;
    }
  };

  // Queue events for retry on failure
  const queueEvent = (event: AnalyticsEvent) => {
    eventQueueRef.current.push(event);
    
    // Clear existing timeout and set a new one
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    retryTimeoutRef.current = setTimeout(() => {
      processEventQueue();
    }, 5000); // Retry after 5 seconds
  };

  // Process queued events
  const processEventQueue = async () => {
    if (eventQueueRef.current.length === 0) return;
    
    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];
    
    for (const event of events) {
      try {
        await trackEventInternal(event);
      } catch (error) {
        // Re-queue failed events (max 3 retries)
        if (!event.metadata?.retryCount || event.metadata.retryCount < 3) {
          queueEvent({
            ...event,
            metadata: {
              ...event.metadata,
              retryCount: (event.metadata?.retryCount || 0) + 1
            }
          });
        }
      }
    }
  };

  // Internal tracking function
  const trackEventInternal = async (event: AnalyticsEvent) => {
    const optedOut = await checkOptOut();
    if (optedOut) return;

    const { error } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user?.id || null,
        session_id: sessionIdRef.current,
        activity_type: event.activity_type,
        content_id: event.content_id || null,
        content_type: event.content_type || null,
        page_url: event.page_url || location.pathname,
        metadata: event.metadata || {},
        duration_seconds: event.duration_seconds || null,
        ip_address: null, // Will be set server-side if needed
        user_agent: navigator.userAgent
      });

    if (error) {
      throw error;
    }
  };

  // Public tracking function with error handling
  const trackEvent = async (event: AnalyticsEvent) => {
    try {
      await trackEventInternal(event);
    } catch (error) {
      console.warn('Analytics tracking failed, queueing for retry:', error);
      queueEvent(event);
    }
  };

  // Track page views
  const trackPageView = (pageName?: string) => {
    const pageViewDuration = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
    
    trackEvent({
      activity_type: 'page_view',
      page_url: location.pathname,
      metadata: {
        page_name: pageName || location.pathname,
        referrer: document.referrer,
        previous_page_duration: pageViewDuration
      }
    });
    
    pageStartTimeRef.current = Date.now();
  };

  // Track chapter reads
  const trackChapterRead = (chapterId: string, pageNumber: number, totalPages: number) => {
    trackEvent({
      activity_type: 'chapter_read',
      content_id: chapterId,
      content_type: 'chapter',
      page_url: location.pathname,
      metadata: {
        page_number: pageNumber,
        total_pages: totalPages,
        progress_percentage: Math.round((pageNumber / totalPages) * 100)
      }
    });
  };

  // Track search queries
  const trackSearch = (query: string, resultsCount: number) => {
    trackEvent({
      activity_type: 'search',
      page_url: location.pathname,
      metadata: {
        search_query: query,
        results_count: resultsCount,
        search_timestamp: new Date().toISOString()
      }
    });
  };

  // Track theme switches
  const trackThemeSwitch = (fromTheme: string, toTheme: string) => {
    trackEvent({
      activity_type: 'theme_switch',
      page_url: location.pathname,
      metadata: {
        from_theme: fromTheme,
        to_theme: toTheme,
        theme_switch_timestamp: new Date().toISOString()
      }
    });
  };

  // Track uploads
  const trackUpload = (uploadType: string, fileSize: number, success: boolean) => {
    trackEvent({
      activity_type: 'upload',
      content_type: uploadType,
      page_url: location.pathname,
      metadata: {
        file_size: fileSize,
        upload_success: success,
        upload_timestamp: new Date().toISOString()
      }
    });
  };

  // Track subscription actions
  const trackSubscription = (action: 'subscribe' | 'cancel' | 'upgrade' | 'downgrade', plan: string) => {
    trackEvent({
      activity_type: 'subscription_action',
      page_url: location.pathname,
      metadata: {
        subscription_action: action,
        plan: plan,
        timestamp: new Date().toISOString()
      }
    });
  };

  // Track errors
  const trackError = (errorType: string, errorMessage: string, errorStack?: string) => {
    trackEvent({
      activity_type: 'error',
      page_url: location.pathname,
      metadata: {
        error_type: errorType,
        error_message: errorMessage,
        error_stack: errorStack,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    });
  };

  // Track page view on route change
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  // Track session duration on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionDuration = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
      
      // Use sendBeacon for reliable tracking on page unload
      if (navigator.sendBeacon && user) {
        const event = {
          activity_type: 'session_end',
          page_url: location.pathname,
          duration_seconds: sessionDuration,
          metadata: {
            session_id: sessionIdRef.current,
            timestamp: new Date().toISOString()
          }
        };
        
        navigator.sendBeacon(
          `https://eslcxgomsaizesekdvcc.supabase.co/rest/v1/user_activity_logs`,
          JSON.stringify({
            user_id: user.id,
            session_id: sessionIdRef.current,
            ...event
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, location.pathname]);

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackChapterRead,
    trackSearch,
    trackThemeSwitch,
    trackUpload,
    trackSubscription,
    trackError,
    sessionId: sessionIdRef.current
  };
};