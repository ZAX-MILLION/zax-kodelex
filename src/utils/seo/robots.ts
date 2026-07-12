export const generateRobotsTxt = (options: {
  allowIndexing: boolean;
  sitemapUrl?: string;
  crawlDelay?: number;
  disallowPaths?: string[];
}) => {
  const { allowIndexing, sitemapUrl, crawlDelay, disallowPaths = [] } = options;
  
  let robotsTxt = 'User-agent: *\n';
  
  if (allowIndexing) {
    robotsTxt += 'Allow: /\n';
    
    // Disallow specific paths
    disallowPaths.forEach(path => {
      robotsTxt += `Disallow: ${path}\n`;
    });
    
    // Common disallowed paths for manga sites
    robotsTxt += 'Disallow: /admin/\n';
    robotsTxt += 'Disallow: /api/\n';
    robotsTxt += 'Disallow: /*.json$\n';
  } else {
    robotsTxt += 'Disallow: /\n';
  }
  
  if (crawlDelay) {
    robotsTxt += `Crawl-delay: ${crawlDelay}\n`;
  }
  
  if (sitemapUrl) {
    robotsTxt += `\nSitemap: ${sitemapUrl}\n`;
  }
  
  return robotsTxt;
};