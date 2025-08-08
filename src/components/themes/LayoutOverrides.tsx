import React from 'react';
import { ChildTheme } from '@/hooks/useChildTheme';
import { componentRegistry } from './ComponentRegistry';
import { ThemeErrorBoundary } from './ThemeErrorBoundary';
import Footer from '@/components/Footer';
import CreativeNavBar from '@/components/CreativeNavBar';

interface LayoutOverridesProps {
  theme: ChildTheme;
  componentType: 'header' | 'footer';
  children?: React.ReactNode;
}

// Enhancement 3: Support for header and footer overrides
export const LayoutOverrides: React.FC<LayoutOverridesProps> = ({ 
  theme, 
  componentType, 
  children 
}) => {
  const getDefaultComponent = () => {
    switch (componentType) {
      case 'header':
        return CreativeNavBar;
      case 'footer':
        return Footer;
      default:
        return null;
    }
  };

  const getOverrideComponent = () => {
    const overrideName = theme.layout_overrides?.[componentType];
    if (!overrideName) return null;

    return componentRegistry.getComponent(theme.id, overrideName);
  };

  const OverrideComponent = getOverrideComponent();
  const DefaultComponent = getDefaultComponent();

  if (OverrideComponent && DefaultComponent) {
    return (
      <ThemeErrorBoundary
        themeId={theme.id}
        componentName={componentType}
        fallback={<DefaultComponent />}
      >
        <OverrideComponent />
        {children}
      </ThemeErrorBoundary>
    );
  }

  return DefaultComponent ? <DefaultComponent /> : null;
};

// Header override wrapper
export const HeaderOverride: React.FC<{ theme: ChildTheme }> = ({ theme }) => (
  <LayoutOverrides theme={theme} componentType="header" />
);

// Footer override wrapper
export const FooterOverride: React.FC<{ theme: ChildTheme }> = ({ theme }) => (
  <LayoutOverrides theme={theme} componentType="footer" />
);