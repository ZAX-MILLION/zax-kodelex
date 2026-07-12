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
  if (import.meta.env.DEV) {
    return false;
  }

  const isComplete = isInstallationComplete();
  return !isComplete;
};