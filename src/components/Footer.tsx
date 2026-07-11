import { Link } from 'react-router-dom';
import { Github, Twitter, Mail, Heart, HelpCircle, Users, Shield, Book } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { userProfile } = useAuth();

  // Load footer settings from localStorage or use defaults
  const getFooterSettings = () => {
    const saved = localStorage.getItem('footerSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      brandName: 'Zax Million',
      brandDescription: 'Premium manga reading platform with high-quality translations and an amazing community.',
      sections: [
        {
          id: 'help',
          title: 'Help & Support',
          links: [
            { id: '1', label: 'Documentation', url: '/help', isExternal: false },
            { id: '2', label: 'Reading Guide', url: '/help/reading-guide', isExternal: false },
            { id: '3', label: 'Troubleshooting', url: '/help/troubleshooting', isExternal: false },
            { id: '4', label: 'Contact Support', url: '/contact', isExternal: false },
          ]
        },
        {
          id: 'community',
          title: 'Community',
          links: [
            { id: '5', label: 'Discord Server', url: 'https://discord.gg/zaxmillion', isExternal: true },
            { id: '6', label: 'Forums', url: '/community', isExternal: false },
            { id: '7', label: 'Support Us', url: '/support', isExternal: false },
            { id: '8', label: 'Send Feedback', url: '/feedback', isExternal: false },
          ]
        },
        {
          id: 'legal',
          title: 'Legal',
          links: [
            { id: '9', label: 'Privacy Policy', url: '/privacy', isExternal: false },
            { id: '10', label: 'Terms of Service', url: '/terms', isExternal: false },
            { id: '11', label: 'Cookie Policy', url: '/cookies', isExternal: false },
            { id: '12', label: 'DMCA Policy', url: '/dmca', isExternal: false },
          ]
        }
      ],
      socialLinks: [
        { id: '1', platform: 'GitHub', url: 'https://github.com/zaxmillion', icon: 'Github' },
        { id: '2', platform: 'Twitter', url: 'https://twitter.com/zaxmillion', icon: 'Twitter' },
        { id: '3', platform: 'Email', url: 'mailto:contact@zaxmillion.com', icon: 'Mail' },
      ],
      copyrightText: 'All rights reserved.',
      version: 'v1.0.0',
      compactMode: true
    };
  };

  const footerSettings = getFooterSettings();

  const getHelpLink = () => {
    if (userProfile?.role === 'admin') {
      return '/help?role=admin';
    } else if (userProfile?.role === 'author') {
      return '/help?role=author';
    }
    return '/help';
  };

  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'Github':
        return <Github className="h-5 w-5" />;
      case 'Twitter':
        return <Twitter className="h-5 w-5" />;
      case 'Mail':
        return <Mail className="h-5 w-5" />;
      default:
        return <Github className="h-5 w-5" />;
    }
  };

  return (
    <footer className="bg-card/50 border-t border-border/30 mt-auto">
      <div className={`container mx-auto px-4 ${footerSettings.compactMode ? 'py-4' : 'py-8'}`}>
        {/* Main Footer Content */}
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(footerSettings.sections.length + 1, 4)} gap-4 ${footerSettings.compactMode ? 'mb-4' : 'mb-6'}`}>
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className={`flex items-center space-x-2 ${footerSettings.compactMode ? 'mb-2' : 'mb-3'}`}>
              <div className={`${footerSettings.compactMode ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg bg-gradient-to-br from-primary to-manga-gold p-0.5`}>
                <div className="w-full h-full rounded-lg bg-background flex items-center justify-center">
                  <Book className={`${footerSettings.compactMode ? 'h-3 w-3' : 'h-4 w-4'} text-primary`} />
                </div>
              </div>
              <span className={`font-bold text-foreground ${footerSettings.compactMode ? 'text-sm' : 'text-base'}`}>
                {footerSettings.brandName}
              </span>
            </div>
            <p className={`text-muted-foreground leading-tight ${footerSettings.compactMode ? 'text-xs max-w-xs' : 'text-sm'}`}>
              {footerSettings.brandDescription}
            </p>
          </div>

          {/* Dynamic Sections */}
          {footerSettings.sections.map((section: any) => (
            <div key={section.id}>
              <h3 className={`font-semibold text-foreground ${footerSettings.compactMode ? 'mb-2 text-xs' : 'mb-3 text-sm'}`}>
                {section.title}
              </h3>
              <div className={`${footerSettings.compactMode ? 'space-y-1' : 'space-y-2'}`}>
                {section.links.map((link: any) => (
                  <div key={link.id}>
                    {link.isExternal ? (
                      <a 
                        href={link.url} 
                        className={`block text-muted-foreground hover:text-primary transition-colors ${footerSettings.compactMode ? 'text-xs' : 'text-sm'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link 
                        to={link.url} 
                        className={`block text-muted-foreground hover:text-primary transition-colors ${footerSettings.compactMode ? 'text-xs' : 'text-sm'}`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Separator className={footerSettings.compactMode ? 'my-3' : 'my-6'} />

        {/* Bottom Section */}
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 ${footerSettings.compactMode ? 'text-xs' : 'text-sm'}`}>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>© {currentYear} {footerSettings.brandName}. {footerSettings.copyrightText}</span>
          </div>
          
          <div className="flex items-center gap-4">
            {footerSettings.socialLinks.map((social: any) => (
              <a 
                key={social.id}
                href={social.url} 
                className="text-muted-foreground hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {getSocialIcon(social.icon)}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <Link to="/help/documentation" className="hover:text-primary transition-colors">
              Documentation
            </Link>
            <span className="text-muted-foreground/50">•</span>
            <span>{footerSettings.version}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;