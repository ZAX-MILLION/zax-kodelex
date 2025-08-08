// Installation status checker utility

export const isInstallationComplete = (): boolean => {
  return localStorage.getItem('installation_complete') === 'true';
};

export const markInstallationComplete = (): void => {
  localStorage.setItem('installation_complete', 'true');
};

export const resetInstallation = (): void => {
  localStorage.removeItem('installation_complete');
  localStorage.removeItem('manga_reader_config');
};

export const getInstallationConfig = () => {
  const config = localStorage.getItem('manga_reader_config');
  return config ? JSON.parse(config) : null;
};

export const needsInstallation = (): boolean => {
  // Skip installation in development/preview mode (Lovable editor)
  if (import.meta.env.DEV || window.location.hostname.includes('lovable.dev')) {
    return false;
  }
  
  // In production, check installation complete status
  const isComplete = isInstallationComplete();
  return !isComplete;
};