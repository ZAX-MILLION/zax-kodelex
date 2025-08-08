import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, Shield, Heart, ArrowLeft } from 'lucide-react';
import SEOHelmet from '@/components/SEOHelmet';

const Subscribe = () => {
  const { user } = useAuth();
  const { subscription, isPremium, createSubscription, loading } = useSubscription();
  const [paypalLoading, setPaypalLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setPaypalLoading(true);
    try {
      // PayPal plan ID for $5/month - this should be created in PayPal dashboard
      const planId = 'P-5ML4271244454362WXNWU5NQ'; // Demo plan ID
      
      const subscriptionData = await createSubscription(planId);
      
      if (subscriptionData?.links) {
        const approvalUrl = subscriptionData.links.find((link: any) => link.rel === 'approve')?.href;
        if (approvalUrl) {
          window.location.href = approvalUrl;
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setPaypalLoading(false);
    }
  };

  const premiumFeatures = [
    { icon: <Zap className="h-5 w-5" />, title: 'Ad-Free Reading', description: 'Enjoy uninterrupted manga reading without any advertisements' },
    { icon: <Star className="h-5 w-5" />, title: 'Early Access', description: 'Get new chapters up to 7 days before free users' },
    { icon: <Crown className="h-5 w-5" />, title: 'Premium Themes', description: 'Access all exclusive themes including Shiranami Sakura EX' },
    { icon: <Zap className="h-5 w-5" />, title: 'Fast Loading', description: 'Priority CDN delivery for lightning-fast image loading' },
    { icon: <Shield className="h-5 w-5" />, title: 'Cross-Device Sync', description: 'Reading history and bookmarks synced across all devices' },
    { icon: <Heart className="h-5 w-5" />, title: 'Premium Badge', description: 'Show your premium status with an exclusive profile badge' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <SEOHelmet 
        title="Subscribe to Premium - Manga Reader"
        description="Upgrade to Premium for ad-free reading, early access to chapters, premium themes, and more exclusive features."
        keywords="manga premium, subscription, ad-free manga, early access chapters"
      />
      
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Crown className="h-4 w-4" />
            Premium Subscription
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the ultimate manga reading experience with premium features, early access, and ad-free browsing.
          </p>
        </div>

        {/* Current Status */}
        {isPremium && subscription && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                You're already Premium!
              </CardTitle>
              <CardDescription>
                Thank you for supporting us. Your subscription is active and will auto-renew.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Plan</p>
                  <p className="text-muted-foreground capitalize">{subscription.plan}</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <Badge variant="outline" className="capitalize">{subscription.status}</Badge>
                </div>
                <div>
                  <p className="font-medium">Auto Renew</p>
                  <p className="text-muted-foreground">{subscription.auto_renew ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Basic manga reading experience</CardDescription>
              <div className="text-3xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Access to free chapters</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Basic themes (Dark + Light)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Limited reading history (10 entries)</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-destructive">✗</span>
                  <span>Ads displayed</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-destructive">✗</span>
                  <span>Standard loading speed</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                <Crown className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Premium Plan
              </CardTitle>
              <CardDescription>Ultimate manga reading experience</CardDescription>
              <div className="text-3xl font-bold">$5<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="text-primary mt-0.5">{feature.icon}</div>
                    <div>
                      <p className="font-medium">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              
              {!isPremium ? (
                <Button 
                  onClick={handleSubscribe} 
                  className="w-full" 
                  size="lg"
                  disabled={paypalLoading || loading}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {paypalLoading ? 'Redirecting to PayPal...' : 'Subscribe with PayPal'}
                </Button>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  <Check className="h-4 w-4 mr-2" />
                  Currently Subscribed
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Can I cancel anytime?</h4>
              <p className="text-muted-foreground">Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
              <p className="text-muted-foreground">We accept payments through PayPal, which supports credit cards, debit cards, and PayPal balance.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Do you offer refunds?</h4>
              <p className="text-muted-foreground">We offer a 7-day money-back guarantee. If you're not satisfied with your premium experience, contact us for a full refund.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Will my reading history be preserved?</h4>
              <p className="text-muted-foreground">Yes, all your reading history, bookmarks, and preferences will be preserved when you upgrade to premium.</p>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center mt-8 p-6 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground mb-2">Need help? Have questions?</p>
          <Button variant="outline" asChild>
            <Link to="/support">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;