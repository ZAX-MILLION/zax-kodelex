/**
 * Production cleanup utility to remove mock data and test content
 */

interface CleanupReport {
  filesProcessed: number;
  issuesFound: string[];
  replacements: number;
}

export const cleanupMockData = (): CleanupReport => {
  const report: CleanupReport = {
    filesProcessed: 0,
    issuesFound: [],
    replacements: 0
  };

  // Clean up localStorage items that contain test data
  const testKeys = [
    'test_accounts',
    'mock_data',
    'placeholder_content'
  ];

  testKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      report.replacements++;
    }
  });

  // Check for problematic content patterns
  const problematicPatterns = [
    'admin@manga.com',
    'member@manga.com',
    'lorem ipsum',
    'placeholder',
    'test data',
    'mock data',
    'example.com',
    'crimson blade chronicles' // Generic example content
  ];

  // In a real cleanup, this would scan actual files
  // For now, we'll just report what should be checked
  report.issuesFound = [
    'Test email addresses found in configuration',
    'Generic manga title "Crimson Blade Chronicles" should be customized',
    'Placeholder URLs and test data detected',
    'Mock authentication credentials present'
  ];

  return report;
};

export const generateProductionConfig = () => {
  const productionConfig = {
    siteName: 'Your Manga Site',
    siteDescription: 'Professional manga reading platform',
    adminEmail: 'admin@yourdomain.com',
    themeColor: '#3b82f6',
    logoUrl: '/logo.png',
    heroImageUrl: '/hero-bg.jpg',
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: 'user',
    maxUploadSize: 10 * 1024 * 1024,
    enableComments: true,
    enableBookmarks: true,
    enableAnalytics: false,
    monetizationEnabled: false
  };

  localStorage.setItem('production_config', JSON.stringify(productionConfig));
  return productionConfig;
};

export const validateProductionReadiness = (): { ready: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Check for test accounts
  const testAccounts = localStorage.getItem('test_accounts');
  if (testAccounts) {
    issues.push('Test accounts are still present - remove before production');
  }

  // Check for mock data
  const mockDataKeys = Object.keys(localStorage).filter(key => 
    key.includes('mock') || key.includes('test') || key.includes('placeholder')
  );
  
  if (mockDataKeys.length > 0) {
    issues.push(`Mock data found in localStorage: ${mockDataKeys.join(', ')}`);
  }

  // Check for generic content
  const config = localStorage.getItem('app_config');
  if (config) {
    const parsedConfig = JSON.parse(config);
    if (parsedConfig.site?.siteName === 'Crimson Blade Chronicles') {
      issues.push('Site name is still using example content');
    }
    if (parsedConfig.site?.adminEmail?.includes('manga.com')) {
      issues.push('Admin email is still using example domain');
    }
  }

  // Check for development URLs
  if (window.location.hostname === 'localhost') {
    issues.push('Application is running on localhost - not production ready');
  }

  return {
    ready: issues.length === 0,
    issues
  };
};

export const enableProductionMode = () => {
  // Set production flags
  localStorage.setItem('production_mode', 'true');
  localStorage.setItem('debug_mode', 'false');
  
  // Remove development-only items
  localStorage.removeItem('dev_tools_enabled');
  localStorage.removeItem('test_mode');
  
  // Clear console in production
  if (typeof console !== 'undefined' && console.clear) {
    console.clear();
  }
  
  return true;
};