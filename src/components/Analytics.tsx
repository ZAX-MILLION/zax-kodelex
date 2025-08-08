import { useEffect } from 'react';

const Analytics = () => {
  useEffect(() => {
    // Plausible Analytics - lightweight and privacy-friendly
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = window.location.hostname;
    script.src = 'https://plausible.io/js/script.js';
    script.async = true;
    
    // Only add analytics in production
    if (process.env.NODE_ENV === 'production') {
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector('script[src="https://plausible.io/js/script.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return null;
};

export default Analytics;