import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';

const CookiesPage = () => {
  const content = `
# Cookie Policy

## What Are Cookies

Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.

## How We Use Cookies

We use cookies for several purposes:

### Essential Cookies
- Session management
- Security features
- Basic site functionality
- Login state preservation

### Analytics Cookies
- Usage statistics
- Performance monitoring
- User behavior analysis
- Site optimization

### Preference Cookies
- Theme settings
- Language preferences
- Reading history
- Personalization features

## Types of Cookies We Use

### First-Party Cookies
Set directly by our website for essential functionality and user preferences.

### Third-Party Cookies
Set by external services we use:
- Analytics providers
- Payment processors
- Content delivery networks

## Managing Cookies

You can control cookies through your browser settings:
- **Chrome**: Settings > Privacy and Security > Cookies
- **Firefox**: Settings > Privacy & Security > Cookies
- **Safari**: Preferences > Privacy > Cookies
- **Edge**: Settings > Cookies and Site Permissions

### Cookie Consent

When you first visit our site, you'll see a cookie banner allowing you to:
- Accept all cookies
- Reject non-essential cookies
- Customize your preferences

## Cookie Retention

Different cookies have different retention periods:
- **Session cookies**: Deleted when you close your browser
- **Persistent cookies**: Remain for a set period or until deleted
- **Authentication cookies**: Typically 30 days
- **Preference cookies**: Up to 1 year

## Contact Us

For questions about our cookie policy, contact us at:
- **Email**: privacy@yoursite.com
- **Address**: [Your Company Address]

---

*Last updated: ${new Date().toLocaleDateString()}*
  `;

  return (
    <>
      <EnhancedSEOHelmet 
        title="Cookie Policy - Manga Reader"
        description="Cookie policy and information about how we use cookies on our manga reading platform."
        keywords="cookies, policy, privacy, tracking, analytics, preferences"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-foreground">
                Cookie Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CookiesPage;