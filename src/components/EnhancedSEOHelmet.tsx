import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSEO, SEOMetadata } from '@/hooks/useSEO';

interface EnhancedSEOHelmetProps {
  // Override any metadata for this specific page
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  canonical?: string;
  robots?: string;
  schema?: Record<string, any>;
  noindex?: boolean;
  // Additional custom meta tags
  customMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
}

export const EnhancedSEOHelmet: React.FC<EnhancedSEOHelmetProps> = ({
  title,
  description,
  image,
  keywords,
  type,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  canonical,
  robots,
  schema,
  noindex,
  customMeta = []
}) => {
  const { generateMetadata, seoSettings } = useSEO();

  // Generate metadata with overrides
  const metadata = React.useMemo(() => {
    const overrides: Partial<SEOMetadata> = {};
    
    if (title) overrides.title = title;
    if (description) overrides.description = description;
    if (image) overrides.image = image;
    if (keywords) overrides.keywords = keywords;
    if (type) overrides.type = type;
    if (author) overrides.author = author;
    if (publishedTime) overrides.publishedTime = publishedTime;
    if (modifiedTime) overrides.modifiedTime = modifiedTime;
    if (section) overrides.section = section;
    if (tags) overrides.tags = tags;
    if (canonical) overrides.canonical = canonical;
    if (robots) overrides.robots = robots;
    if (schema) overrides.schema = schema;
    if (noindex) overrides.robots = 'noindex,nofollow';

    return generateMetadata(overrides);
  }, [
    title, description, image, keywords, type, author,
    publishedTime, modifiedTime, section, tags, canonical,
    robots, schema, noindex, generateMetadata
  ]);

  // Ensure image URLs are absolute
  const absoluteImageUrl = metadata.image?.startsWith('http') 
    ? metadata.image 
    : `${seoSettings.siteUrl}${metadata.image}`;

  // Ensure canonical URL is absolute
  const absoluteCanonical = metadata.canonical?.startsWith('http')
    ? metadata.canonical
    : `${seoSettings.siteUrl}${metadata.canonical}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      {metadata.keywords && <meta name="keywords" content={metadata.keywords} />}
      {metadata.author && <meta name="author" content={metadata.author} />}
      <meta name="robots" content={metadata.robots} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={absoluteCanonical} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:url" content={metadata.url} />
      <meta property="og:type" content={metadata.type} />
      <meta property="og:site_name" content={metadata.siteName} />
      
      {/* Optional OG tags */}
      {metadata.author && <meta property="article:author" content={metadata.author} />}
      {metadata.publishedTime && <meta property="article:published_time" content={metadata.publishedTime} />}
      {metadata.modifiedTime && <meta property="article:modified_time" content={metadata.modifiedTime} />}
      {metadata.section && <meta property="article:section" content={metadata.section} />}
      {metadata.tags?.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={metadata.twitterCard} />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      {seoSettings.twitterHandle && (
        <meta name="twitter:site" content={`@${seoSettings.twitterHandle}`} />
      )}
      
      {/* Facebook App ID */}
      {seoSettings.facebookAppId && (
        <meta property="fb:app_id" content={seoSettings.facebookAppId} />
      )}
      
      {/* Google Site Verification */}
      {seoSettings.googleSiteVerification && (
        <meta name="google-site-verification" content={seoSettings.googleSiteVerification} />
      )}
      
      {/* Custom Meta Tags */}
      {customMeta.map((meta, index) => (
        <meta
          key={index}
          {...(meta.name ? { name: meta.name } : {})}
          {...(meta.property ? { property: meta.property } : {})}
          content={meta.content}
        />
      ))}
      
      {/* Structured Data (JSON-LD) */}
      {metadata.schema && (
        <script type="application/ld+json">
          {JSON.stringify(metadata.schema, null, 2)}
        </script>
      )}
    </Helmet>
  );
};