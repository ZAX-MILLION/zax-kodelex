-- Create site_pages table for editable legal and content pages
CREATE TABLE public.site_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view published pages" 
ON public.site_pages 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all pages" 
ON public.site_pages 
FOR ALL 
USING (is_admin());

-- Create updated_at trigger
CREATE TRIGGER update_site_pages_updated_at
BEFORE UPDATE ON public.site_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default legal pages
INSERT INTO public.site_pages (slug, title, content, meta_title, meta_description) VALUES
('dmca', 'DMCA Policy', '# Digital Millennium Copyright Act (DMCA) Notice

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
- **Email**: ZAXMIllion@proton.me
- **Address**: [Your Company Address]

## Counter-Notification

If you believe your content was removed in error, you may submit a counter-notification with the required information as specified in the DMCA.', 'DMCA Policy', 'Digital Millennium Copyright Act (DMCA) policy and copyright information'),

('privacy', 'Privacy Policy', '# Privacy Policy

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
- **Email**: ZAXMIllion@proton.me
- **Address**: [Your Company Address]', 'Privacy Policy', 'Privacy policy and data protection information'),

('terms', 'Terms of Service', '# Terms of Service

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
- **Email**: ZAXMIllion@proton.me
- **Address**: [Your Company Address]', 'Terms of Service', 'Terms of service and usage guidelines'),

('cookies', 'Cookie Policy', '# Cookie Policy

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

When you first visit our site, you''ll see a cookie banner allowing you to:
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
- **Email**: ZAXMIllion@proton.me
- **Address**: [Your Company Address]', 'Cookie Policy', 'Cookie policy and information about how we use cookies');