import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';

const TermsPage = () => {
  const content = `
# Terms of Service

## Agreement to Terms

By accessing and using this manga reading platform, you accept and agree to be bound by the terms and provision of this agreement.

## Use License

Permission is granted to temporarily access the materials on this website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- Modify or copy the materials
- Use the materials for commercial purposes
- Attempt to reverse engineer any software
- Remove any copyright or proprietary notations

## User Accounts

When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your password and all activities under your account.

## Content Guidelines

Users must not:
- Upload illegal or copyrighted content
- Share accounts or passwords
- Attempt to hack or disrupt the service
- Post inappropriate comments or content

## Privacy

Your privacy is important to us. Please review our Privacy Policy for information about how we collect and use your data.

## Prohibited Uses

You may not use our service:
- For any unlawful purpose
- To transmit harmful or malicious code
- To infringe intellectual property rights
- To harass or abuse other users

## Termination

We may terminate or suspend your account at any time for violations of these terms.

## Limitation of Liability

In no event shall our company be liable for any damages arising out of the use or inability to use the materials on this website.

## Changes to Terms

We reserve the right to modify these terms at any time. Changes become effective immediately upon posting.

## Contact Information

Questions about these terms should be sent to:
- **Email**: legal@yoursite.com
- **Address**: [Your Company Address]

---

*Last updated: ${new Date().toLocaleDateString()}*
  `;

  return (
    <>
      <EnhancedSEOHelmet 
        title="Terms of Service - Manga Reader"
        description="Terms of service and usage guidelines for our manga reading platform."
        keywords="terms, service, agreement, usage, guidelines, legal"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-foreground">
                Terms of Service
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

export default TermsPage;