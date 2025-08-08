import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, Shield, Heart, Eye, Palette, ArrowRight, Check } from 'lucide-react';
import SEOHelmet from '@/components/SEOHelmet';

const Premium = () => {
  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Lightning Fast',
      description: 'Priority CDN delivery ensures your pages load instantly',
      color: 'text-yellow-500'
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: 'Ad-Free Experience',
      description: 'Enjoy uninterrupted reading without any advertisements',
      color: 'text-blue-500'
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: 'Early Access',
      description: 'Get new chapters up to 7 days before everyone else',
      color: 'text-purple-500'
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: 'Exclusive Themes',
      description: 'Access premium themes including the legendary Shiranami Sakura EX',
      color: 'text-pink-500'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Cloud Sync',
      description: 'Your reading progress syncs across all your devices',
      color: 'text-green-500'
    },
    {
      icon: <Crown className="h-8 w-8" />,
      title: 'Premium Badge',
      description: 'Show off your premium status with an exclusive profile badge',
      color: 'text-orange-500'
    }
  ];

  const testimonials = [
    {
      name: 'Akira S.',
      comment: 'The ad-free experience is worth every penny. I can finally read without interruptions!',
      rating: 5
    },
    {
      name: 'Yuki T.',
      comment: 'Early access to chapters is amazing. I love being ahead of the curve.',
      rating: 5
    },
    {
      name: 'Rei M.',
      comment: 'The Shiranami Sakura EX theme is absolutely gorgeous. Premium themes are next level!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <SEOHelmet 
        title="Premium Features - Manga Reader"
        description="Discover the ultimate manga reading experience with Premium. Ad-free reading, early access, exclusive themes, and more."
        keywords="manga premium features, ad-free manga, early access chapters, premium themes"
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
        <div className="container relative max-w-6xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <Crown className="h-3 w-3 mr-1" />
            Premium Experience
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Manga Reading
            <br />
            <span className="text-4xl md:text-6xl">Perfected</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform your manga reading experience with Premium. No ads, early access, exclusive themes, 
            and lightning-fast loading. Join thousands of readers who've upgraded to the ultimate experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/subscribe">
                <Crown className="h-5 w-5 mr-2" />
                Start Premium - $5/month
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <Link to="/chapters">
                Try Free Version
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            7-day money-back guarantee • Cancel anytime • No setup fees
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Premium Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for the perfect manga reading experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className={`${feature.color} mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Free vs Premium</h2>
            <p className="text-xl text-muted-foreground">
              See the difference Premium makes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Basic reading experience</CardDescription>
                <div className="text-3xl font-bold">$0</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Access to free chapters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Basic themes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Limited reading history</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-destructive">✗</span>
                    <span>Ads displayed</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-destructive">✗</span>
                    <span>Standard loading</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Premium
                </CardTitle>
                <CardDescription>Ultimate reading experience</CardDescription>
                <div className="text-3xl font-bold">$5<span className="text-lg font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Everything in Free, plus:</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Ad-free reading</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Early access (7 days)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Premium themes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Lightning fast loading</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Cross-device sync</span>
                  </li>
                </ul>
                
                <Button asChild className="w-full" size="lg">
                  <Link to="/subscribe">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Premium Users Say</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied premium readers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.comment}"</p>
                  <p className="font-medium">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Go Premium?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join the ultimate manga reading experience today. Cancel anytime.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/subscribe">
                <Crown className="h-5 w-5 mr-2" />
                Start Premium - $5/month
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
          
          <p className="text-sm opacity-75 mt-4">
            7-day money-back guarantee • Secure PayPal billing • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};

export default Premium;