import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';

const DMCAPage = () => {
  const content = `
# Digital Millennium Copyright Act (DMCA) Notice

## Copyright Policy

We respect the intellectual property rights of others and expect our users to do the same. It is our policy to respond to clear notices of alleged copyright infringement.

## Filing a DMCA Notice

If you believe that content on our site infringes your copyright, you may submit a DMCA takedown notice containing the following information:

1. **Identification of the copyrighted work** claimed to have been infringed
2. **Identification of the material** that is claimed to be infringing and information reasonably sufficient to permit us to locate the material
3. **Contact information** including your address, telephone number, and email address
4. **Statement of good faith belief** that use of the material is not authorized by the copyright owner
5. **Statement of accuracy** and authorization to act on behalf of the copyright owner
6. **Physical or electronic signature** of the copyright owner or authorized agent

## Contact Information

Please send DMCA notices to:
- **Email**: contact@zaxmillion.com
- **Address**: Zax Million, Online Service

## Counter-Notification

If you believe your content was removed in error, you may submit a counter-notification with the required information as specified in the DMCA.

---

*Last updated: ${new Date().toLocaleDateString()}*
  `;

  return (
    <>
      <EnhancedSEOHelmet 
        title="DMCA Policy - Zax Million"
        description="Digital Millennium Copyright Act (DMCA) policy and copyright information for our manga reading platform."
        keywords="dmca, copyright, takedown, policy, intellectual property"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-foreground">
                DMCA Policy
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

export default DMCAPage;