import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Users, BarChart3, Palette, ShoppingCart, Shield } from 'lucide-react';

interface WelcomeStepProps {
  data?: any;
  onUpdate?: (updates: any) => void;
  onNext: () => void;
  onPrev?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  const features = [
    {
      icon: BookOpen,
      title: 'Advanced Reader',
      description: 'Multiple reading modes, progress tracking, and mobile-optimized experience'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Complete authentication system with roles, profiles, and permissions'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track readership, engagement, and performance metrics'
    },
    {
      icon: Palette,
      title: 'Theme System',
      description: 'Professional themes with customization options'
    },
    {
      icon: ShoppingCart,
      title: 'Monetization',
      description: 'Premium chapters, subscriptions, and coin system'
    },
    {
      icon: Shield,
      title: 'Security & SEO',
      description: 'Built-in security features and SEO optimization'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mb-4">
          <BookOpen className="h-16 w-16 mx-auto text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Zax Million</h1>
        <p className="text-lg text-muted-foreground">
          Premium manga reading platform — set up your site in minutes
        </p>
        <Badge variant="secondary" className="mt-2">v1.0.0</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
          <CardDescription>
            Everything you need for a professional manga reading platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Process</CardTitle>
          <CardDescription>
            We'll guide you through the setup in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">1</div>
              <span className="text-sm">Choose your database connection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">2</div>
              <span className="text-sm">Configure your site settings</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">3</div>
              <span className="text-sm">Create your admin account</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">4</div>
              <span className="text-sm">Launch your platform</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-6">
        <Button onClick={onNext} size="lg" className="flex items-center gap-2">
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};