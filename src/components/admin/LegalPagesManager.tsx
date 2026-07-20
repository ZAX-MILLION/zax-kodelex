import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Shield, 
  Mail, 
  Copyright,
  ExternalLink,
  Save,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LegalPage {
  slug: string;
  title: string;
  content: string;
  last_updated: string;
  is_published: boolean;
}

interface LegalSettings {
  company_name: string;
  company_address: string;
  contact_email: string;
  copyright_year: number;
  dmca_agent_name: string;
  dmca_agent_email: string;
  dmca_agent_address: string;
  auto_copyright: boolean;
}

const DEFAULT_PAGES: Record<string, Partial<LegalPage>> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    content: `# Privacy Policy

**Last updated: ${new Date().toLocaleDateString()}**

## Information We Collect

We collect information you provide directly to us, such as when you create an account, subscribe to our services, or contact us for support.

### Personal Information
- Email address
- Username
- Profile information
- Payment information (processed securely)

### Usage Information
- Pages visited
- Reading history
- Device information
- IP address (for security purposes)

## How We Use Your Information

We use the information we collect to:
- Provide and maintain our services
- Process transactions and send notifications
- Improve our services and develop new features
- Communicate with you about updates and offers
- Protect against fraud and abuse

## Information Sharing

We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:
- To comply with legal obligations
- To protect our rights and safety
- With service providers who assist in our operations

## Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your account and data
- Opt out of marketing communications

## Cookies

We use cookies to enhance your experience. You can control cookie settings through your browser.

## Children's Privacy

Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.

## Changes to This Policy

We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.

## Contact Us

If you have questions about this privacy policy, please contact us at: [Contact Email]`
  },
  'terms-of-service': {
    title: 'Terms of Service',
    content: `# Terms of Service

**Last updated: ${new Date().toLocaleDateString()}**

## Acceptance of Terms

By accessing and using our service, you accept and agree to be bound by the terms and provision of this agreement.

## Use License

Permission is granted to temporarily access and read content on our platform for personal, non-commercial transitory viewing only.

### This license does not include:
- Modifying or copying the materials
- Using materials for commercial purposes
- Attempting to reverse engineer any software
- Removing copyright or proprietary notations

## User Accounts

When you create an account, you are responsible for:
- Maintaining the security of your account
- All activities that occur under your account
- Providing accurate and complete information

## Prohibited Uses

You may not use our service:
- For any unlawful purpose or activity
- To transmit malicious code or viruses
- To infringe upon intellectual property rights
- To harass, abuse, or harm others
- To distribute spam or unsolicited content

## Content

Our platform contains copyrighted material, trademarks, and proprietary information. Users may not reproduce, distribute, or create derivative works without permission.

## Premium Services

Premium subscriptions provide additional features and ad-free experience. Subscription fees are non-refundable except as required by law.

## Disclaimers

The information on this platform is provided on an 'as is' basis. We disclaim all warranties, express or implied.

## Limitations

In no event shall our company be liable for any damages arising out of the use or inability to use our service.

## Accuracy of Materials

The materials on our platform may include technical inaccuracies or typographical errors. We reserve the right to make changes without notice.

## Modifications

We may revise these terms at any time without notice. By using this platform, you agree to be bound by the current version.

## Governing Law

These terms are governed by and construed in accordance with the laws of [Jurisdiction].

## Contact Information

For questions about these terms, please contact us at: [Contact Email]`
  },
  'dmca-policy': {
    title: 'DMCA Policy',
    content: `# DMCA Copyright Policy

**Last updated: ${new Date().toLocaleDateString()}**

## Notice of Copyright Infringement

We respect the intellectual property rights of others and expect our users to do the same. We respond to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act ("DMCA").

## Filing a DMCA Notice

If you believe that content on our platform infringes your copyright, please provide our DMCA agent with the following information:

### Required Information:
1. **Physical or electronic signature** of the copyright owner or authorized representative
2. **Identification of the copyrighted work** claimed to have been infringed
3. **Identification of the infringing material** and information to locate it on our platform
4. **Your contact information** including address, telephone number, and email
5. **A statement of good faith belief** that the use is not authorized by the copyright owner
6. **A statement of accuracy** under penalty of perjury that you are authorized to act on behalf of the copyright owner

## DMCA Agent Contact Information

**Name:** [DMCA Agent Name]  
**Email:** [DMCA Agent Email]  
**Address:** [DMCA Agent Address]

## Counter-Notification

If you believe your content was removed by mistake or misidentification, you may file a counter-notification containing:

1. Your physical or electronic signature
2. Identification of the removed material and its location
3. A statement under penalty of perjury that you have a good faith belief the material was removed by mistake
4. Your contact information
5. A statement consenting to jurisdiction of federal court

## Repeat Infringer Policy

We will terminate the accounts of users who are repeat infringers in appropriate circumstances.

## Response Time

We will respond to valid DMCA notices within 24-48 hours and remove infringing content promptly.

## Misrepresentation

Knowingly making false claims may result in liability for damages, including attorney fees.

## Contact Us

For DMCA-related inquiries, please contact our designated agent at the information provided above.`
  },
  'contact': {
    title: 'Contact Us',
    content: `# Contact Us

We'd love to hear from you! Get in touch with us using any of the methods below.

## General Inquiries

**Email:** [Contact Email]  
**Response Time:** 24-48 hours

## Support

For technical support and account issues:
**Email:** ZAXMIllion@proton.me  
**Hours:** Monday - Friday, 9 AM - 6 PM EST

## Business Inquiries

For partnerships and business opportunities:
**Email:** ZAXMIllion@proton.me

## DMCA & Legal

For copyright and legal matters:
**Email:** [DMCA Agent Email]

## Mailing Address

[Company Name]  
[Company Address]

## Social Media

Follow us on social media for updates and announcements:
- Twitter: @yourhandle
- Facebook: /yourpage
- Discord: discord.gg/yourserver

## Feedback

We value your feedback and suggestions. Help us improve our platform by sharing your thoughts and ideas.

**Note:** For faster response times, please use email rather than social media for support requests.`
  }
};

export const LegalPagesManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [legalSettings, setLegalSettings] = useState<LegalSettings>({
    company_name: 'Zax Million',
    company_address: 'Online Service',
    contact_email: 'ZAXMIllion@proton.me',
    copyright_year: new Date().getFullYear(),
    dmca_agent_name: 'Zax Million Copyright Agent',
    dmca_agent_email: 'ZAXMIllion@proton.me',
    dmca_agent_address: 'Online Service',
    auto_copyright: true
  });
  const [activeTab, setActiveTab] = useState('pages');
  const [editingPage, setEditingPage] = useState<string | null>(null);

  useEffect(() => {
    loadLegalData();
  }, []);

  const loadLegalData = () => {
    // Load from localStorage for demo
    const storedPages = localStorage.getItem('legal_pages');
    const storedSettings = localStorage.getItem('legal_settings');
    
    if (storedPages) {
      setLegalPages(JSON.parse(storedPages));
    } else {
      // Initialize with default pages
      const initialPages: LegalPage[] = Object.entries(DEFAULT_PAGES).map(([slug, page]) => ({
        slug,
        title: page.title || '',
        content: page.content || '',
        last_updated: new Date().toISOString(),
        is_published: true
      }));
      setLegalPages(initialPages);
    }
    
    if (storedSettings) {
      setLegalSettings({ ...legalSettings, ...JSON.parse(storedSettings) });
    }
  };

  const saveLegalData = async () => {
    setLoading(true);
    try {
      // Process content with variables
      const processedPages = legalPages.map(page => ({
        ...page,
        content: interpolateVariables(page.content),
        last_updated: new Date().toISOString()
      }));
      
      localStorage.setItem('legal_pages', JSON.stringify(processedPages));
      localStorage.setItem('legal_settings', JSON.stringify(legalSettings));
      
      toast({
        title: "Success",
        description: "Legal pages saved successfully"
      });
      
      setEditingPage(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save legal pages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const interpolateVariables = (content: string) => {
    return content
      .replace(/\[Company Name\]/g, legalSettings.company_name)
      .replace(/\[Company Address\]/g, legalSettings.company_address)
      .replace(/\[Contact Email\]/g, legalSettings.contact_email)
      .replace(/\[DMCA Agent Name\]/g, legalSettings.dmca_agent_name)
      .replace(/\[DMCA Agent Email\]/g, legalSettings.dmca_agent_email)
      .replace(/\[DMCA Agent Address\]/g, legalSettings.dmca_agent_address)
      .replace(/\[Current Year\]/g, legalSettings.copyright_year.toString());
  };

  const updatePage = (slug: string, field: keyof LegalPage, value: any) => {
    setLegalPages(prev => 
      prev.map(page => 
        page.slug === slug 
          ? { ...page, [field]: value }
          : page
      )
    );
  };

  const generateCopyrightText = () => {
    return `© ${legalSettings.copyright_year} ${legalSettings.company_name}. All rights reserved.`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Legal Pages Manager</h2>
          <p className="text-muted-foreground">
            Manage legal pages, privacy policy, and terms of service
          </p>
        </div>
        <Button onClick={saveLegalData} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">Legal Pages</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Page List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Legal Pages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {legalPages.map((page) => (
                    <Button
                      key={page.slug}
                      variant={editingPage === page.slug ? "default" : "ghost"}
                      className="w-full justify-start text-sm h-auto p-3"
                      onClick={() => setEditingPage(page.slug)}
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          {page.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={page.is_published ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {page.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Page Editor */}
            <div className="lg:col-span-3">
              {editingPage ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {legalPages.find(p => p.slug === editingPage)?.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/${editingPage}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Edit the content for this legal page. Use [Variables] for dynamic content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Page Title</Label>
                        <Input
                          value={legalPages.find(p => p.slug === editingPage)?.title || ''}
                          onChange={(e) => updatePage(editingPage, 'title', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Published</Label>
                          <p className="text-xs text-muted-foreground">Make this page publicly accessible</p>
                        </div>
                        <Button
                          variant={legalPages.find(p => p.slug === editingPage)?.is_published ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const page = legalPages.find(p => p.slug === editingPage);
                            updatePage(editingPage, 'is_published', !page?.is_published);
                          }}
                        >
                          {legalPages.find(p => p.slug === editingPage)?.is_published ? 'Published' : 'Draft'}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Content (Markdown)</Label>
                      <Textarea
                        value={legalPages.find(p => p.slug === editingPage)?.content || ''}
                        onChange={(e) => updatePage(editingPage, 'content', e.target.value)}
                        rows={20}
                        className="font-mono text-sm"
                        placeholder="Write your legal page content in Markdown..."
                      />
                    </div>

                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        Available variables: [Company Name], [Company Address], [Contact Email], [DMCA Agent Name], [DMCA Agent Email], [Current Year]
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Select a page to edit</h3>
                    <p className="text-sm">Choose a legal page from the sidebar to start editing</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Legal Settings
              </CardTitle>
              <CardDescription>
                Configure company information and legal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={legalSettings.company_name}
                    onChange={(e) => setLegalSettings(prev => ({ ...prev, company_name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={legalSettings.contact_email}
                    onChange={(e) => setLegalSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">Company Address</Label>
                <Textarea
                  id="company_address"
                  value={legalSettings.company_address}
                  onChange={(e) => setLegalSettings(prev => ({ ...prev, company_address: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">DMCA Agent Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dmca_agent_name">DMCA Agent Name</Label>
                    <Input
                      id="dmca_agent_name"
                      value={legalSettings.dmca_agent_name}
                      onChange={(e) => setLegalSettings(prev => ({ ...prev, dmca_agent_name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dmca_agent_email">DMCA Agent Email</Label>
                    <Input
                      id="dmca_agent_email"
                      type="email"
                      value={legalSettings.dmca_agent_email}
                      onChange={(e) => setLegalSettings(prev => ({ ...prev, dmca_agent_email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dmca_agent_address">DMCA Agent Address</Label>
                  <Textarea
                    id="dmca_agent_address"
                    value={legalSettings.dmca_agent_address}
                    onChange={(e) => setLegalSettings(prev => ({ ...prev, dmca_agent_address: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Copyright Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="copyright_year">Copyright Year</Label>
                    <Input
                      id="copyright_year"
                      type="number"
                      value={legalSettings.copyright_year}
                      onChange={(e) => setLegalSettings(prev => ({ ...prev, copyright_year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto Copyright</Label>
                      <p className="text-sm text-muted-foreground">Automatically display copyright notice in footer</p>
                    </div>
                    <Button
                      variant={legalSettings.auto_copyright ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLegalSettings(prev => ({ ...prev, auto_copyright: !prev.auto_copyright }))}
                    >
                      {legalSettings.auto_copyright ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>

                {legalSettings.auto_copyright && (
                  <Alert>
                    <Copyright className="h-4 w-4" />
                    <AlertDescription>
                      Copyright notice: {generateCopyrightText()}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Page Previews
              </CardTitle>
              <CardDescription>
                Preview how your legal pages will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {legalPages.map((page) => (
                  <Card key={page.slug} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">{page.title}</h4>
                      <Badge variant={page.is_published ? "default" : "secondary"} className="text-xs">
                        {page.is_published ? 'Live' : 'Draft'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        URL: /{page.slug}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(page.last_updated).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Content length: {page.content.length} characters
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs"
                        onClick={() => setEditingPage(page.slug)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs"
                        onClick={() => window.open(`/${page.slug}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};