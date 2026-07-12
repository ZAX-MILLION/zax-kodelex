import { useState, useEffect } from 'react';

interface MultiSeriesModeConfig {
  enabled: boolean;
  defaultContentType: 'manga' | 'novel' | 'both';
  showContentTypeFilter: boolean;
  allowSingleSeriesMode: boolean;
}

const DEFAULT_CONFIG: MultiSeriesModeConfig = {
  enabled: true,
  defaultContentType: 'both',
  showContentTypeFilter: true,
  allowSingleSeriesMode: true
};

export const useMultiSeriesMode = () => {
  const [config, setConfig] = useState<MultiSeriesModeConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    try {
      const stored = localStorage.getItem('multiSeriesConfig');
      if (stored) {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading multi-series config:', error);
      setConfig(DEFAULT_CONFIG);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (updates: Partial<MultiSeriesModeConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem('multiSeriesConfig', JSON.stringify(newConfig));
  };

  const toggleMultiSeriesMode = () => {
    updateConfig({ enabled: !config.enabled });
  };

  const setContentType = (contentType: 'manga' | 'novel' | 'both') => {
    updateConfig({ defaultContentType: contentType });
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.setItem('multiSeriesConfig', JSON.stringify(DEFAULT_CONFIG));
  };

  return {
    config,
    isLoading,
    updateConfig,
    toggleMultiSeriesMode,
    setContentType,
    resetToDefaults,
    isMultiSeriesEnabled: config.enabled,
    defaultContentType: config.defaultContentType,
    showContentTypeFilter: config.showContentTypeFilter
  };
};