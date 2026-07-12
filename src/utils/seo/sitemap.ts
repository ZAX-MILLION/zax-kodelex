export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = (entries: SitemapEntry[]): string => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';
  
  const urls = entries.map(entry => {
    let urlXml = `  <url>\n    <loc>${entry.url}</loc>`;
    
    if (entry.lastmod) {
      urlXml += `\n    <lastmod>${entry.lastmod}</lastmod>`;
    }
    
    if (entry.changefreq) {
      urlXml += `\n    <changefreq>${entry.changefreq}</changefreq>`;
    }
    
    if (entry.priority !== undefined) {
      urlXml += `\n    <priority>${entry.priority}</priority>`;
    }
    
    urlXml += '\n  </url>';
    return urlXml;
  }).join('\n');
  
  return `${xmlHeader}\n${urlsetOpen}\n${urls}\n${urlsetClose}`;
};

export const generateMangaSitemap = (baseUrl: string): SitemapEntry[] => {
  const now = new Date().toISOString();
  
  return [
    {
      url: baseUrl,
      lastmod: now,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/chapters`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      url: `${baseUrl}/support`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.5
    }
  ];
};