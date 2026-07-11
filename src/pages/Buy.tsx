import { useState, useEffect } from 'react';
import { Check, Download, Shield, Star, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SEOHelmet from '@/components/SEOHelmet';

interface LicenseDetails {
  id: string;
  license_key: string;
  license_type: string;
  domains_allowed: number;
  created_at: string;
}

interface PurchaseForm {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  country: string;
  phone: string;
}

const Buy = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'extended' | 'developer'>('single');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [licenseDetails, setLicenseDetails] = useState<LicenseDetails | null>(null);
  const [downloadReady, setDownloadReady] = useState(false);
  
  const [form, setForm] = useState<PurchaseForm>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    country: '',
    phone: ''
  });

  const plans = [
    {
      id: 'single' as const,
      name: 'Single License',
      price: 49,
      originalPrice: 79,
      description: 'Perfect for one website or personal project',
      features: [
        '1 Domain License',
        'Complete Source Code',
        'Documentation Included',
        '6 Months Support',
        'Lifetime Updates',
        'Commercial Use'
      ],
      popular: false,
      badge: 'Most Popular'
    },
    {
      id: 'extended' as const,
      name: 'Extended License',
      price: 149,
      originalPrice: 199,
      description: 'Great for client projects and resale',
      features: [
        '10 Domain License',
        'Complete Source Code',
        'Documentation Included',
        '12 Months Support',
        'Lifetime Updates',
        'Commercial Use',
        'Resale Rights',
        'White Label Rights'
      ],
      popular: true,
      badge: 'Best Value'
    },
    {
      id: 'developer' as const,
      name: 'Developer License',
      price: 299,
      originalPrice: 399,
      description: 'Unlimited usage for agencies and developers',
      features: [
        'Unlimited Domains',
        'Complete Source Code',
        'Documentation Included',
        'Lifetime Support',
        'Lifetime Updates',
        'Commercial Use',
        'Resale Rights',
        'White Label Rights',
        'SaaS License'
      ],
      popular: false,
      badge: 'Enterprise'
    }
  ];

  const selectedPlanDetails = plans.find(plan => plan.id === selectedPlan)!;

  const handleInputChange = (field: keyof PurchaseForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.firstName.trim()) return 'First name is required';
    if (!form.lastName.trim()) return 'Last name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email';
    return null;
  };

  const processPayment = async (method: 'stripe' | 'paypal') => {
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create customer and purchase record
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert({
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName,
          company: form.company || null,
          phone: form.phone || null,
          country: form.country || null
        }, { onConflict: 'email' })
        .select()
        .single();

      if (customerError) throw customerError;

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          customer_id: customer.id,
          amount: selectedPlanDetails.price,
          currency: 'USD',
          status: 'pending',
          payment_method: method,
          metadata: {
            plan: selectedPlan,
            form: JSON.parse(JSON.stringify(form))
          }
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // For demo purposes, simulate successful payment and complete the purchase
      setTimeout(async () => {
        try {
          // Update purchase status to completed
          const { error: updateError } = await supabase
            .from('purchases')
            .update({ status: 'completed' })
            .eq('id', purchase.id);

          if (updateError) throw updateError;

          // Fetch the generated license
          const { data: license, error: licenseError } = await supabase
            .from('licenses')
            .select('*')
            .eq('purchase_id', purchase.id)
            .single();

          if (licenseError) throw licenseError;

          setLicenseDetails(license);
          setPurchaseComplete(true);
          setDownloadReady(true);

          toast({
            title: "Purchase Successful!",
            description: "Your license has been generated and is ready for download.",
          });
        } catch (error) {
          console.error('Error completing purchase:', error);
          toast({
            title: "Payment Error",
            description: "There was an issue processing your payment. Please contact support.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      }, 3000); // Simulate payment processing time

    } catch (error) {
      console.error('Error creating purchase:', error);
      toast({
        title: "Error",
        description: "There was an issue creating your purchase. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!licenseDetails) return;

    try {
      // Log the download
      const { error: logError } = await supabase
        .from('download_logs')
        .insert({
          customer_id: licenseDetails.id, // This should be customer_id from the license
          license_id: licenseDetails.id,
          ip_address: '0.0.0.0', // In real implementation, get actual IP
          user_agent: navigator.userAgent,
          download_url: '/manga-reader-theme.zip',
          file_size: 1024000 // Example file size
        });

      if (logError) console.error('Error logging download:', logError);

      // In a real implementation, this would trigger an actual file download
      toast({
        title: "Download Started",
        description: "Your theme files are being downloaded. Check your downloads folder.",
      });

      // Simulate download
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,Zax Million Theme Download%0AThis is a demo download.%0AIn production, this would be the actual theme files.';
      link.download = 'manga-reader-theme.txt';
      link.click();

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Error",
        description: "There was an issue starting your download. Please contact support.",
        variant: "destructive",
      });
    }
  };

  if (purchaseComplete && licenseDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
        <SEOHelmet 
          title="Purchase Complete - Zax Million Theme"
          description="Your purchase is complete! Download your Zax Million Theme license and files."
        />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Purchase Complete!
              </h1>
              <p className="text-lg text-muted-foreground">
                Thank you for purchasing the Zax Million Theme
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Your License Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">License Key:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {licenseDetails.license_key}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">License Type:</span>
                  <Badge variant="secondary">
                    {licenseDetails.license_type.charAt(0).toUpperCase() + licenseDetails.license_type.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Domains Allowed:</span>
                  <span>{licenseDetails.domains_allowed === 999 ? 'Unlimited' : licenseDetails.domains_allowed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Purchase Date:</span>
                  <span>{new Date(licenseDetails.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {downloadReady && (
              <Button 
                onClick={handleDownload}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Theme Files
              </Button>
            )}

            <div className="mt-8 text-sm text-muted-foreground">
              <p>Keep your license key safe - you'll need it for support and updates.</p>
              <p className="mt-2">
                Need help? Contact us at <a href="mailto:support@example.com" className="text-primary hover:underline">support@example.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <SEOHelmet 
        title="Buy Zax Million Theme - Premium React Template"
        description="Purchase the premium Zax Million Theme. Beautiful, responsive, and feature-rich React template for manga reading websites."
        keywords="manga reader theme, react template, manga website template, premium theme"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Get Your Zax Million Theme
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional, responsive, and feature-rich React template for creating stunning manga reading websites
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedPlan === plan.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              } ${plan.popular ? 'scale-105' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold text-primary">${plan.price}</span>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground line-through">
                        ${plan.originalPrice}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Save ${plan.originalPrice - plan.price}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Purchase Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Secure Checkout
              </CardTitle>
              <CardDescription>
                Complete your purchase for the {selectedPlanDetails.name} (${selectedPlanDetails.price})
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Choose Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto p-4 flex-col gap-2"
                    onClick={() => processPayment('stripe')}
                    disabled={isProcessing}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span>Pay with Credit Card</span>
                    <span className="text-xs text-muted-foreground">Secured by Stripe</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto p-4 flex-col gap-2"
                    onClick={() => processPayment('paypal')}
                    disabled={isProcessing}
                  >
                    <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      PP
                    </div>
                    <span>Pay with PayPal</span>
                    <span className="text-xs text-muted-foreground">Secured by PayPal</span>
                  </Button>
                </div>
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Processing your payment...</p>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Secure Payment Guarantee</p>
                    <p className="text-muted-foreground">
                      Your payment information is encrypted and secure. We never store your credit card details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="text-xs text-muted-foreground text-center">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy.
                You will receive your license key and download link immediately after payment.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Buy;