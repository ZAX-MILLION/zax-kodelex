import { useEffect, useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';

/**
 * Hook to handle RTL (Right-to-Left) layout adjustments
 * Returns utility functions and classes for RTL-aware styling
 */
export const useRTL = () => {
  const { direction, currentLanguage } = useI18n();
  const [isRTL, setIsRTL] = useState(direction === 'rtl');

  useEffect(() => {
    setIsRTL(direction === 'rtl');
  }, [direction]);

  // Direction-aware margin classes
  const marginStart = (value: string) => isRTL ? `mr-${value}` : `ml-${value}`;
  const marginEnd = (value: string) => isRTL ? `ml-${value}` : `mr-${value}`;
  
  // Direction-aware padding classes
  const paddingStart = (value: string) => isRTL ? `pr-${value}` : `pl-${value}`;
  const paddingEnd = (value: string) => isRTL ? `pl-${value}` : `pr-${value}`;
  
  // Direction-aware positioning
  const start = (value: string) => isRTL ? `right-${value}` : `left-${value}`;
  const end = (value: string) => isRTL ? `left-${value}` : `right-${value}`;
  
  // Direction-aware text alignment
  const textStart = isRTL ? 'text-right' : 'text-left';
  const textEnd = isRTL ? 'text-left' : 'text-right';
  
  // Direction-aware flex direction
  const flexDirection = isRTL ? 'flex-row-reverse' : 'flex-row';
  
  // Direction-aware transform classes
  const scaleX = isRTL ? '-scale-x-100' : '';
  
  // Get appropriate font family for current language
  const getFontFamily = () => {
    if (currentLanguage.font_family) {
      return currentLanguage.font_family;
    }
    
    switch (currentLanguage.code) {
      case 'ar':
        return 'font-arabic';
      case 'en':
      case 'ru':
      default:
        return 'font-sans';
    }
  };

  return {
    isRTL,
    direction,
    marginStart,
    marginEnd,
    paddingStart,
    paddingEnd,
    start,
    end,
    textStart,
    textEnd,
    flexDirection,
    scaleX,
    getFontFamily,
    
    // Conditional class helper
    rtl: (rtlClass: string, ltrClass: string = '') => isRTL ? rtlClass : ltrClass,
    
    // Direction-aware style objects
    directionStyle: {
      direction: direction as 'ltr' | 'rtl',
      textAlign: isRTL ? 'right' as const : 'left' as const,
    },
  };
};

/**
 * Utility function to create direction-aware className strings
 */
export const rtlClass = (ltrClass: string, rtlClass?: string) => {
  if (typeof document === 'undefined') return ltrClass;
  
  const dir = document.documentElement.getAttribute('dir');
  return dir === 'rtl' ? (rtlClass || ltrClass) : ltrClass;
};

/**
 * Utility function to get direction-aware CSS properties
 */
export const directionAwareStyle = (
  property: 'marginLeft' | 'marginRight' | 'paddingLeft' | 'paddingRight' | 'left' | 'right',
  value: string | number
) => {
  if (typeof document === 'undefined') return { [property]: value };
  
  const dir = document.documentElement.getAttribute('dir');
  const isRTL = dir === 'rtl';
  
  const mapping = {
    marginLeft: isRTL ? 'marginRight' : 'marginLeft',
    marginRight: isRTL ? 'marginLeft' : 'marginRight',
    paddingLeft: isRTL ? 'paddingRight' : 'paddingLeft',
    paddingRight: isRTL ? 'paddingLeft' : 'paddingRight',
    left: isRTL ? 'right' : 'left',
    right: isRTL ? 'left' : 'right',
  };
  
  return { [mapping[property]]: value };
};