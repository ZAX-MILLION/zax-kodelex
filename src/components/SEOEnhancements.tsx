import React from 'react';
import { EnhancedSEOHelmet } from './EnhancedSEOHelmet';
import { useLocation } from 'react-router-dom';

interface SEOEnhancementsProps {
  children: React.ReactNode;
}

export const SEOEnhancements: React.FC<SEOEnhancementsProps> = ({ children }) => {
  const location = useLocation();

  // Dynamic SEO based on route
  const getSEOForRoute = () => {
    const path = location.pathname;
    
    switch (path) {
      case '/':
        return {
          title: 'Manga Reader - Your Premium Reading Experience',
          description: 'Professional manga reading platform with high-quality pages, smooth navigation, and immersive reading experience.'
        };
      
      default:
        return {
          title: 'Manga Reader - Premium Reading Platform',
          description: 'Professional manga reading experience with high-quality pages and smooth navigation.'
        };
    }
  };

  const seoData = getSEOForRoute();

  return (
    <>
      <EnhancedSEOHelmet {...seoData} />
      {children}
    </>
  );
};