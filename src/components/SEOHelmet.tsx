import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
}

const SEOHelmet = ({ 
  title, 
  description, 
  keywords, 
  image, 
  type = 'website',
  noindex = false 
}: SEOHelmetProps) => {
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}`;
  
  const defaultTitle = 'MangaReader - Read Your Favorite Manga Online';
  const defaultDescription = 'Read the latest manga chapters online. High-quality images, fast loading, and mobile-friendly manga reader.';
  const defaultImage = `${window.location.origin}/manga-cover.jpg`;
  
  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Helper function to update or create meta tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Update basic meta tags
    updateMetaTag('description', finalDescription, true);
    if (keywords) updateMetaTag('keywords', keywords, true);
    if (noindex) updateMetaTag('robots', 'noindex, nofollow', true);

    // Update Open Graph tags
    updateMetaTag('og:title', finalTitle);
    updateMetaTag('og:description', finalDescription);
    updateMetaTag('og:image', finalImage);
    updateMetaTag('og:url', currentUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'MangaReader');

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

  }, [finalTitle, finalDescription, finalImage, currentUrl, keywords, type, noindex]);

  return null;
};

export default SEOHelmet;