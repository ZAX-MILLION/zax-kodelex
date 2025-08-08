import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';

const PrivacyPage = () => {
  const content = `
# Privacy Policy

## Information We Collect

We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.

### Personal Information
- Email address
- Username
- Payment information (processed securely)
- Reading preferences and history

### Automatically Collected Information
- Device information
- Usage patterns
- IP address
- Browser type and version

## How We Use Your Information

We use the information we collect to:
- Provide and improve our services
- Process transactions
- Send important updates
- Personalize your experience
- Analyze usage patterns

## Information Sharing

We do not sell, trade, or rent your personal information to third parties. We may share information in these limited circumstances:
- With service providers who assist in our operations
- To comply with legal requirements
- To protect our rights and safety

## Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate data
- Delete your account and data
- Opt out of marketing communications

## Contact Us

For privacy-related questions, contact us at:
- **Email**: privacy@yoursite.com
- **Address**: [Your Company Address]

---

*Last updated: ${new Date().toLocaleDateString()}*
  `;

  return (
    <>
      <EnhancedSEOHelmet 
        title="Privacy Policy - Manga Reader"
        description="Privacy policy and data protection information for our manga reading platform."
        keywords="privacy, policy, data protection, personal information, gdpr"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-foreground">
                Privacy Policy
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

export default PrivacyPage;