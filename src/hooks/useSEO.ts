import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonical?: string;
  robots?: string;
  schema?: Record<string, any>;
}

interface SEOSettings {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  defaultImage: string;
  twitterHandle?: string;
  facebookAppId?: string;
  googleSiteVerification?: string;
  allowIndexing: boolean;
  robotsDirectives: string[];
}

interface PageSEORule {
  id: string;
  path_pattern: string;
  title_template: string;
  description_template: string;
  meta_keywords: string[];
  og_image: string | null;
  twitter_card_type: string;
  canonical_pattern: string | null;
  robots_directive: string;
  schema_markup: Record<string, any> | null;
  is_active: boolean;
}

export const useSEO = () => {
  const location = useLocation();
  const [seoSettings, setSEOSettings] = useState<SEOSettings>({
    siteTitle: 'Manga Reader',
    siteDescription: 'Professional manga reading platform with premium features',
    siteUrl: window.location.origin,
    defaultImage: '/manga-cover.jpg',
    allowIndexing: true,
    robotsDirectives: ['index', 'follow']
  });
  
  const [currentMetadata, setCurrentMetadata] = useState<SEOMetadata>({});
  const [pageRules, setPageRules] = useState<PageSEORule[]>([]);
  const [loading, setLoading] = useState(true);

  // Load SEO settings from database
  const loadSEOSettings = useCallback(async () => {
    try {
      // For now, use localStorage until we add the seo_settings table
      const stored = localStorage.getItem('seo_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        setSEOSettings(prev => ({
          ...prev,
          ...settings
        }));
      }
    } catch (error) {
      console.error('Failed to load SEO settings:', error);
    }
  }, []);

  // Load page-specific SEO rules
  const loadPageRules = useCallback(async () => {
    try {
      // For now, use localStorage until we add the page_seo_rules table
      const stored = localStorage.getItem('page_seo_rules');
      if (stored) {
        const rules = JSON.parse(stored);
        setPageRules(rules || []);
      }
    } catch (error) {
      console.error('Failed to load page SEO rules:', error);
    }
  }, []);

  // Generate metadata for current page
  const generateMetadata = useCallback((customMeta: Partial<SEOMetadata> = {}) => {
    const currentPath = location.pathname;
    
    // Find matching rule for current path
    const matchingRule = pageRules.find(rule => {
      const pattern = new RegExp(rule.path_pattern.replace('*', '.*'));
      return pattern.test(currentPath);
    });

    // Base metadata
    let metadata: SEOMetadata = {
      title: seoSettings.siteTitle,
      description: seoSettings.siteDescription,
      image: seoSettings.defaultImage,
      url: `${seoSettings.siteUrl}${currentPath}`,
      type: 'website',
      siteName: seoSettings.siteTitle,
      canonical: `${seoSettings.siteUrl}${currentPath}`,
      robots: seoSettings.allowIndexing ? 'index,follow' : 'noindex,nofollow',
      twitterCard: 'summary_large_image',
      ...customMeta
    };

    // Apply page rule if found
    if (matchingRule) {
      metadata = {
        ...metadata,
        title: interpolateTemplate(matchingRule.title_template, customMeta),
        description: interpolateTemplate(matchingRule.description_template, customMeta),
        keywords: matchingRule.meta_keywords.join(', '),
        image: matchingRule.og_image || metadata.image,
        twitterCard: (matchingRule.twitter_card_type as any) || metadata.twitterCard,
        canonical: matchingRule.canonical_pattern ? 
          interpolateTemplate(matchingRule.canonical_pattern, customMeta) : 
          metadata.canonical,
        robots: matchingRule.robots_directive || metadata.robots,
        schema: matchingRule.schema_markup || undefined
      };
    }

    // Apply custom overrides
    metadata = { ...metadata, ...customMeta };

    setCurrentMetadata(metadata);
    return metadata;
  }, [location.pathname, pageRules, seoSettings]);

  // Template interpolation helper
  const interpolateTemplate = (template: string, data: Record<string, any>) => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  };

  // Update SEO settings
  const updateSEOSettings = useCallback(async (newSettings: Partial<SEOSettings>) => {
    try {
      const updatedSettings = { ...seoSettings, ...newSettings };
      localStorage.setItem('seo_settings', JSON.stringify(updatedSettings));
      setSEOSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Failed to update SEO settings:', error);
      return false;
    }
  }, [seoSettings]);

  // Add/update page rule
  const upsertPageRule = useCallback(async (rule: Omit<PageSEORule, 'id'>) => {
    try {
      const ruleWithId = { ...rule, id: Date.now().toString() };
      const stored = localStorage.getItem('page_seo_rules');
      const existingRules = stored ? JSON.parse(stored) : [];
      const updatedRules = [...existingRules, ruleWithId];
      localStorage.setItem('page_seo_rules', JSON.stringify(updatedRules));
      await loadPageRules();
      return true;
    } catch (error) {
      console.error('Failed to save page rule:', error);
      return false;
    }
  }, [loadPageRules]);

  // Delete page rule
  const deletePageRule = useCallback(async (ruleId: string) => {
    try {
      const stored = localStorage.getItem('page_seo_rules');
      const existingRules = stored ? JSON.parse(stored) : [];
      const filteredRules = existingRules.filter((rule: any) => rule.id !== ruleId);
      localStorage.setItem('page_seo_rules', JSON.stringify(filteredRules));
      await loadPageRules();
      return true;
    } catch (error) {
      console.error('Failed to delete page rule:', error);
      return false;
    }
  }, [loadPageRules]);

  // Generate structured data
  const generateSchema = useCallback((type: string, data: Record<string, any>) => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    };

    return baseSchema;
  }, []);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([
        loadSEOSettings(),
        loadPageRules()
      ]);
      setLoading(false);
    };

    initialize();
  }, [loadSEOSettings, loadPageRules]);

  // Auto-generate metadata when location changes
  useEffect(() => {
    if (!loading) {
      generateMetadata();
    }
  }, [location.pathname, loading, generateMetadata]);

  return {
    seoSettings,
    currentMetadata,
    pageRules,
    loading,
    generateMetadata,
    updateSEOSettings,
    upsertPageRule,
    deletePageRule,
    generateSchema
  };
};