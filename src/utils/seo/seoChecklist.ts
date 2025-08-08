export interface SEOChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'pass' | 'warning' | 'fail' | 'pending';
  category: 'meta' | 'technical' | 'content' | 'performance';
  details?: string;
  actionRequired?: string;
}

export const runSEOChecklist = async (): Promise<SEOChecklistItem[]> => {
  const checks: SEOChecklistItem[] = [];
  
  // Meta tags checks
  checks.push(...await checkMetaTags());
  
  // Technical SEO checks  
  checks.push(...await checkTechnicalSEO());
  
  return checks;
};

const checkMetaTags = async (): Promise<SEOChecklistItem[]> => {
  const checks: SEOChecklistItem[] = [];
  
  // Title tag check
  const titleElement = document.querySelector('title');
  checks.push({
    id: 'title-tag',
    title: 'Title Tag Present',
    description: 'Page has a descriptive title tag',
    category: 'meta',
    status: titleElement && titleElement.textContent ? 
      (titleElement.textContent.length <= 60 ? 'pass' : 'warning') : 'fail',
    details: titleElement ? 
      `Title: "${titleElement.textContent}" (${titleElement.textContent?.length} chars)` : 
      'No title tag found'
  });
  
  return checks;
};

const checkTechnicalSEO = async (): Promise<SEOChecklistItem[]> => {
  const checks: SEOChecklistItem[] = [];
  
  // HTTPS check
  checks.push({
    id: 'https',
    title: 'HTTPS Enabled',
    description: 'Site is served over HTTPS',
    category: 'technical',
    status: location.protocol === 'https:' ? 'pass' : 'fail',
    details: `Protocol: ${location.protocol}`
  });
  
  return checks;
};

export const getSEOScore = (checks: SEOChecklistItem[]): { score: number; total: number } => {
  const total = checks.length;
  const passed = checks.filter(check => check.status === 'pass').length;
  const score = Math.round((passed / total) * 100);
  
  return { score, total };
};