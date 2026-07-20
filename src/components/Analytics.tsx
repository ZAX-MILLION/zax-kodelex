import { useEffect } from 'react';
import { appConfig } from '@/config/env';

const Analytics = () => {
  useEffect(() => {
    if (appConfig.isDemo || appConfig.isStaging) {
      return;
    }

    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = window.location.hostname;
    script.src = 'https://plausible.io/js/script.js';
    script.async = true;

    if (import.meta.env.PROD) {
      document.head.appendChild(script);
    }

    return () => {
      const existingScript = document.querySelector('script[src="https://plausible.io/js/script.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return null;
};

export default Analytics;
