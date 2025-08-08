import { useState, useEffect } from 'react';

interface DeveloperModeSettings {
  disablePremiumGating: boolean;
  disableAds: boolean;
  bypassLicenseCheck: boolean;
  bypassThemeLicense: boolean;
  showDebugInfo: boolean;
}

const DEFAULT_SETTINGS: DeveloperModeSettings = {
  disablePremiumGating: false,
  disableAds: false,
  bypassLicenseCheck: false,
  bypassThemeLicense: false,
  showDebugInfo: false
};

export const useDeveloperMode = () => {
  const [settings, setSettings] = useState<DeveloperModeSettings>(DEFAULT_SETTINGS);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('developer_mode_settings');
      const enabled = localStorage.getItem('developer_mode_enabled') === 'true';
      
      if (saved) {
        setSettings(JSON.parse(saved));
      }
      setIsEnabled(enabled);
    } catch (error) {
      console.error('Failed to load developer settings:', error);
    }
  };

  const updateSettings = (newSettings: Partial<DeveloperModeSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('developer_mode_settings', JSON.stringify(updated));
  };

  const toggleDeveloperMode = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    localStorage.setItem('developer_mode_enabled', newEnabled.toString());
    
    if (!newEnabled) {
      // Reset all settings when disabling
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('developer_mode_settings');
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('developer_mode_settings');
  };

  // Helper functions for components
  const shouldBypassPremium = () => {
    return (import.meta.env.DEV && isEnabled && settings.disablePremiumGating) || 
           import.meta.env.VITE_BYPASS_PREMIUM === 'true';
  };

  const shouldShowAds = () => {
    if (import.meta.env.DEV && isEnabled && settings.disableAds) {
      return false;
    }
    return true;
  };

  const shouldBypassLicense = () => {
    return (import.meta.env.DEV && isEnabled && settings.bypassLicenseCheck) ||
           import.meta.env.VITE_BYPASS_LICENSE === 'true';
  };

  const shouldBypassThemeLicense = () => {
    return (import.meta.env.DEV && isEnabled && settings.bypassThemeLicense) ||
           import.meta.env.VITE_BYPASS_THEME_LICENSE === 'true';
  };

  return {
    isEnabled,
    settings,
    toggleDeveloperMode,
    updateSettings,
    resetSettings,
    shouldBypassPremium,
    shouldShowAds,
    shouldBypassLicense,
    shouldBypassThemeLicense,
    isDevelopment: import.meta.env.DEV
  };
};