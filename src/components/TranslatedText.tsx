import React from 'react';
import { useI18n } from '@/contexts/I18nContext';

interface TranslatedTextProps {
  translationKey: string;
  fallback?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  children?: never;
}

/**
 * Component that renders translated text with fallback support
 * Automatically uses the current language from I18n context
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({
  translationKey,
  fallback,
  className,
  as: Component = 'span',
  ...props
}) => {
  const { t } = useI18n();
  
  const translatedText = t(translationKey, fallback);
  
  return (
    <Component className={className} {...props}>
      {translatedText}
    </Component>
  );
};

// Convenience components for common HTML elements
export const TranslatedHeading = (props: Omit<TranslatedTextProps, 'as'>) => (
  <TranslatedText as="h1" {...props} />
);

export const TranslatedSubheading = (props: Omit<TranslatedTextProps, 'as'>) => (
  <TranslatedText as="h2" {...props} />
);

export const TranslatedParagraph = (props: Omit<TranslatedTextProps, 'as'>) => (
  <TranslatedText as="p" {...props} />
);

export const TranslatedLabel = (props: Omit<TranslatedTextProps, 'as'>) => (
  <TranslatedText as="label" {...props} />
);

export const TranslatedButton = (props: Omit<TranslatedTextProps, 'as'>) => (
  <TranslatedText as="button" {...props} />
);