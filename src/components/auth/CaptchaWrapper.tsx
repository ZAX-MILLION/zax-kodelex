import { useEffect, useRef } from 'react';

interface CaptchaWrapperProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  siteKey?: string;
  action?: string;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export const CaptchaWrapper = ({ 
  onVerify, 
  onError, 
  siteKey = process.env.VITE_RECAPTCHA_SITE_KEY,
  action = 'submit'
}: CaptchaWrapperProps) => {
  const executed = useRef(false);

  useEffect(() => {
    if (!siteKey || executed.current) return;

    const loadRecaptcha = () => {
      if (!window.grecaptcha) {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        script.onload = () => {
          executeRecaptcha();
        };
      } else {
        executeRecaptcha();
      }
    };

    const executeRecaptcha = () => {
      if (executed.current) return;
      executed.current = true;

      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(siteKey, { action })
          .then((token: string) => {
            onVerify(token);
          })
          .catch((error: any) => {
            console.error('reCAPTCHA error:', error);
            onError?.();
          });
      });
    };

    loadRecaptcha();
  }, [siteKey, action, onVerify, onError]);

  return null; // Invisible reCAPTCHA
};