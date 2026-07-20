import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { appConfig } from '@/config/env';

interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  font_family?: string;
  is_active: boolean;
  display_order: number;
}

interface Translation {
  key: string;
  value: string;
  context?: string;
}

interface I18nContextType {
  currentLanguage: Language;
  languages: Language[];
  translations: Record<string, string>;
  isLoading: boolean;
  direction: 'ltr' | 'rtl';
  setLanguage: (code: string) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  addTranslation: (key: string, value: string, context?: string) => Promise<void>;
  refreshTranslations: () => Promise<void>;
}

const defaultLanguage: Language = {
  id: 'default',
  code: 'en',
  name: 'English',
  native_name: 'English',
  direction: 'ltr',
  is_active: true,
  display_order: 1
};

const I18nContext = createContext<I18nContextType | null>(null);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);
  const [languages, setLanguages] = useState<Language[]>([defaultLanguage]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load languages from database
  const loadLanguages = async () => {
    if (appConfig.isDemo || !isSupabaseConfigured) {
      setLanguages([defaultLanguage]);
      setCurrentLanguage(defaultLanguage);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      if (data && data.length > 0) {
        const typedLanguages = data.map(lang => ({
          ...lang,
          direction: lang.direction as 'ltr' | 'rtl'
        }));
        setLanguages(typedLanguages);
        
        // Set default language from stored preference or browser language
        const storedLang = localStorage.getItem('preferred-language');
        const browserLang = navigator.language.split('-')[0];
        
        let preferredLang = typedLanguages.find(lang => lang.code === storedLang) ||
                           typedLanguages.find(lang => lang.code === browserLang) ||
                           typedLanguages.find(lang => lang.code === 'en') ||
                           typedLanguages[0];

        // Load user preference if authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userPref } = await supabase
            .from('user_language_preferences')
            .select('language_code')
            .eq('user_id', user.id)
            .single();

          if (userPref) {
            const userLang = typedLanguages.find(lang => lang.code === userPref.language_code);
            if (userLang) preferredLang = userLang;
          }
        }

        setCurrentLanguage(preferredLang);
      }
    } catch (error) {
      console.error('Error loading languages:', error);
      setLanguages([defaultLanguage]);
      setCurrentLanguage(defaultLanguage);
    }
  };

  // Load translations for current language
  const loadTranslations = async (languageCode: string) => {
    if (appConfig.isDemo || !isSupabaseConfigured) {
      setTranslations({});
      return;
    }
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('key, value')
        .eq('language_code', languageCode);

      if (error) throw error;

      const translationMap: Record<string, string> = {};
      data?.forEach(translation => {
        translationMap[translation.key] = translation.value;
      });

      setTranslations(translationMap);
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to English if current language fails
      if (languageCode !== 'en') {
        await loadTranslations('en');
      }
    }
  };

  // Set language and persist preference
  const setLanguage = async (code: string) => {
    const newLanguage = languages.find(lang => lang.code === code);
    if (!newLanguage) return;

    setIsLoading(true);
    setCurrentLanguage(newLanguage);
    localStorage.setItem('preferred-language', code);

    // Save to database if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        await supabase
          .from('user_language_preferences')
          .upsert({ 
            user_id: user.id, 
            language_code: code 
          });
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }

    await loadTranslations(code);
    setIsLoading(false);

    // Update document attributes for RTL/LTR
    document.documentElement.setAttribute('dir', newLanguage.direction);
    document.documentElement.setAttribute('lang', code);
    
    // Apply font family if specified
    if (newLanguage.font_family) {
      document.documentElement.style.setProperty('--font-language', newLanguage.font_family);
    } else {
      document.documentElement.style.removeProperty('--font-language');
    }
  };

  // Translation function
  const t = (key: string, fallback?: string): string => {
    return translations[key] || fallback || key;
  };

  // Add new translation
  const addTranslation = async (key: string, value: string, context?: string) => {
    try {
      const { error } = await supabase
        .from('translations')
        .upsert({
          key,
          language_code: currentLanguage.code,
          value,
          context
        });

      if (error) throw error;

      setTranslations(prev => ({
        ...prev,
        [key]: value
      }));

      toast({
        title: "Translation added",
        description: `Translation for "${key}" has been added.`
      });
    } catch (error) {
      console.error('Error adding translation:', error);
      toast({
        title: "Error",
        description: "Failed to add translation.",
        variant: "destructive"
      });
    }
  };

  // Refresh translations
  const refreshTranslations = async () => {
    await loadTranslations(currentLanguage.code);
  };

  // Initialize
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadLanguages();
      setIsLoading(false);
    };
    init();
  }, []);

  // Load translations when language changes
  useEffect(() => {
    if (currentLanguage.code !== 'default') {
      loadTranslations(currentLanguage.code);
    }
  }, [currentLanguage.code]);

  // Set initial document attributes
  useEffect(() => {
    document.documentElement.setAttribute('dir', currentLanguage.direction);
    document.documentElement.setAttribute('lang', currentLanguage.code);
    
    if (currentLanguage.font_family) {
      document.documentElement.style.setProperty('--font-language', currentLanguage.font_family);
    }
  }, [currentLanguage]);

  const value: I18nContextType = {
    currentLanguage,
    languages,
    translations,
    isLoading,
    direction: currentLanguage.direction,
    setLanguage,
    t,
    addTranslation,
    refreshTranslations
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Utility function for direction-aware className
export const directionClass = (ltrClass: string, rtlClass: string = '') => {
  if (typeof document !== 'undefined') {
    const direction = document.documentElement.getAttribute('dir') || 'ltr';
    return direction === 'rtl' ? rtlClass || ltrClass : ltrClass;
  }
  return ltrClass;
};

// Hook for direction-aware styles
export const useDirection = () => {
  const { direction } = useI18n();
  return {
    direction,
    isRTL: direction === 'rtl',
    isLTR: direction === 'ltr'
  };
};