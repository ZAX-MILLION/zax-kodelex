import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/config/env';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';

interface BlockedPageProps {
  title: string;
  description: string;
  icon: React.ElementType;
}

function BlockedPage({ title, description, icon: Icon }: BlockedPageProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <EnhancedSEOHelmet title={title} noindex />
      <Card className="max-w-lg mx-auto text-center">
        <CardHeader>
          <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{description}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
            {appConfig.features.roleLab && (
              <Button variant="outline" asChild>
                <Link to="/demo">Open Role Lab</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PaymentsRouteGuard({ children }: { children: ReactNode }) {
  if (appConfig.disablePayments) {
    return (
      <BlockedPage
        title="Payments unavailable"
        description="Checkout and coin purchases are disabled on the public demo. Use staging with PayPal sandbox for payment testing."
        icon={CreditCard}
      />
    );
  }
  return <>{children}</>;
}

export function AdminRouteGuard({ children }: { children: ReactNode }) {
  if (appConfig.disableAdmin) {
    return (
      <BlockedPage
        title="Admin panel unavailable"
        description="The admin dashboard is not loaded on the public demo to keep the site fast and secure. Connect staging Supabase for admin access."
        icon={ShieldOff}
      />
    );
  }
  return <>{children}</>;
}
